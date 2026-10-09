/**
 * The whole Atom63 design system in one call, for the Cipher plugin's main
 * thread: the token set (variables, text and effect styles), then every
 * component and its spec card, through the same engine the agent path runs.
 * A check reads only. `readDesignSystemTable` says what a file holds now.
 */
import type { ApplyResult } from './apply'
import { tokenOfCodeSyntax } from './apply'
import { type ComponentCounts, countsOf } from './components/counts'
import type { ComponentModel } from './components/model'
import type { NodesApi, SceneNodeLike } from './components/nodes-api'
import { findCard, findSetIn } from './components/spec-card'
import {
  type ComponentResult,
  planComponent,
  type RetryError,
  settle,
  syncComponent,
} from './components/sync-component'
import { isDerivedToken } from './derived'
import type { SyncModel } from './plan'
import { checkModel, type PartTotals, syncModel } from './runtime'
import { applyStyles, planStyles, type StylePlan, type StyleResult } from './style-sync'
import { deriveStyles } from './styles'

export interface DesignSystemModels {
  sync: SyncModel
  components: ComponentModel[]
}

export type DesignSystemPhase = 'tokens' | 'styles' | 'components' | 'card' | 'done'
/**
 * Where a build is. `components` starts a component (its variants and card),
 * `card` ends it; `done` counts are per phase.
 */
export interface DesignSystemProgress {
  phase: DesignSystemPhase
  done: number
  total: number
  label?: string
}

/** `pending`: nothing differs but property references Figma is still reconciling. */
export type DesignSystemStatus = 'pass' | 'pending' | 'fail'

export interface DesignSystemComponentOutcome {
  name: string
  variants: number
  planned: ComponentCounts
  /** Only in a build. */
  applied?: ComponentResult
  verification: ComponentCounts
  retried?: number
  retryErrors?: RetryError[]
}

export interface DesignSystemOutcome {
  status: DesignSystemStatus
  tokens: { planned: PartTotals; applied?: ApplyResult; verification: PartTotals }
  styles?: { planned: StylePlan; applied?: StyleResult; verification: StylePlan }
  components: DesignSystemComponentOutcome[]
  /** Every font that fell back, styles and components, once each. */
  fontFallbacks: string[]
}

/** The sync model with its text and effect styles, derived as the CLI derives them. */
const withStyles = (sync: SyncModel): SyncModel =>
  sync.styles ? sync : { ...sync, styles: deriveStyles(sync) }

const settled = (plan: { create: number | string[]; update: number | string[] }) =>
  (Array.isArray(plan.create) ? plan.create.length : plan.create) === 0 &&
  (Array.isArray(plan.update) ? plan.update.length : plan.update) === 0

function statusOf(outcome: Omit<DesignSystemOutcome, 'status'>): DesignSystemStatus {
  const clean =
    settled(outcome.tokens.verification) &&
    (!outcome.styles || settled(outcome.styles.verification)) &&
    outcome.components.every(({ verification: plan, retryErrors }) => {
      const card = plan.card ?? { create: 0, update: 0 }
      return (
        plan.missingVariables.length === 0 &&
        plan.variables === 0 &&
        settled(plan) &&
        settled(card) &&
        !plan.differences &&
        !retryErrors
      )
    })
  if (!clean) return 'fail'
  return outcome.components.some(item => item.verification.pendingReferences) ? 'pending' : 'pass'
}

/** Style fallbacks as the component ones read, one line per font for all the styles it hits. */
function styleFallbacks(result: StyleResult | undefined): string[] {
  const styles = new Map<string, string[]>()
  for (const { style, wanted, used } of result?.fontFallbacks ?? []) {
    const what = wanted.startsWith('--')
      ? `${wanted} not bound in every mode; used ${used}`
      : `${wanted} did not load; used ${used}`
    styles.set(what, [...(styles.get(what) ?? []), style])
  }
  return [...styles].map(
    ([what, names]) => `${names.length === 1 ? names[0] : `${names.length} text styles`}: ${what}`
  )
}

/**
 * Writes the token set, then each component with its spec card, and verifies
 * each part as it goes. Yields to the host between phases and components, so
 * a plugin's UI can show `onProgress`.
 */
export async function buildDesignSystem(
  figma: NodesApi,
  models: DesignSystemModels,
  onProgress: (progress: DesignSystemProgress) => void = () => {}
): Promise<DesignSystemOutcome> {
  const sync = withStyles(models.sync)
  const total = models.components.length
  onProgress({ phase: 'tokens', done: 0, total: 1 })
  await settle()
  const { styles: set, ...variables } = sync
  const tokens = await syncModel(figma, variables)
  onProgress({ phase: 'tokens', done: 1, total: 1 })
  onProgress({ phase: 'styles', done: 0, total: 1 })
  await settle()
  // As syncModel does with a model's styles, once the variables they bind exist.
  let styles: DesignSystemOutcome['styles']
  if (set) {
    const planned = await planStyles(figma, set)
    const applied = await applyStyles(figma, set, planned)
    styles = { planned, applied, verification: await planStyles(figma, set) }
  }
  onProgress({ phase: 'styles', done: 1, total: 1 })
  await settle()

  const components: DesignSystemComponentOutcome[] = []
  for (const [index, model] of models.components.entries()) {
    onProgress({ phase: 'components', done: index, total, label: model.component })
    await settle()
    const result = await syncComponent(figma, model)
    components.push({
      name: model.component,
      variants: model.variants.length,
      planned: countsOf(result.planned),
      applied: { ...result.applied, fontFallbacks: [...new Set(result.applied.fontFallbacks)] },
      verification: countsOf(result.verification),
      ...(result.retried ? { retried: result.retried } : {}),
      ...(result.retryErrors ? { retryErrors: result.retryErrors } : {}),
    })
    onProgress({ phase: 'card', done: index + 1, total, label: model.component })
  }

  const outcome = {
    tokens: { planned: tokens.planned, applied: tokens.applied, verification: tokens.verification },
    ...(styles ? { styles } : {}),
    components,
    fontFallbacks: [
      ...new Set([
        ...styleFallbacks(styles?.applied),
        ...components.flatMap(item => item.applied?.fontFallbacks ?? []),
      ]),
    ],
  }
  onProgress({ phase: 'done', done: 1, total: 1 })
  return { status: statusOf(outcome), ...outcome }
}

/** What a build would still write; reads only. */
export async function checkDesignSystem(
  figma: NodesApi,
  models: DesignSystemModels
): Promise<DesignSystemOutcome> {
  const tokens = await checkModel(figma, withStyles(models.sync))
  const components: DesignSystemComponentOutcome[] = []
  for (const model of models.components) {
    const plan = countsOf(await planComponent(figma, model))
    components.push({
      name: model.component,
      variants: model.variants.length,
      planned: plan,
      verification: plan,
    })
  }
  const outcome = {
    tokens: { planned: tokens.planned, verification: tokens.verification },
    ...(tokens.styles ? { styles: { planned: tokens.styles, verification: tokens.styles } } : {}),
    components,
    fontFallbacks: [],
  }
  return { status: statusOf(outcome), ...outcome }
}

export interface DesignSystemTable {
  /** Variables with an Atom63 token's code syntax, per collection; null when none. */
  atom63: { variables: number; collections: { name: string; variables: number }[] } | null
  /**
   * Variables with another project's token code syntax (`var(--x)`, not
   * `--a63-*` and not in the Atom63 token set): a template table; null when none.
   */
  template: { variables: number } | null
  components: { name: string; variants: number; card: boolean; setOnPage: boolean }[]
}

/**
 * What the file holds now, cheaply: variables by code syntax only (no values),
 * and each component's set and card on its page. Without `models`, an Atom63
 * token is one named `--a63-*` and no component is looked for.
 */
export async function readDesignSystemTable(
  figma: NodesApi,
  models?: DesignSystemModels
): Promise<DesignSystemTable> {
  const atom63Tokens = new Set(
    models?.sync.collections.flatMap(collection => collection.variables.map(item => item.token))
  )
  const isAtom63 = (token: string) => token.startsWith('--a63-') || atom63Tokens.has(token)
  const collections: { name: string; variables: number }[] = []
  let template = 0
  for (const collection of await figma.variables.getLocalVariableCollectionsAsync()) {
    let count = 0
    for (const id of collection.variableIds) {
      const variable = await figma.variables.getVariableByIdAsync(id)
      const token = tokenOfCodeSyntax(variable?.codeSyntax?.WEB)
      if (!token || isDerivedToken(token)) continue
      if (isAtom63(token)) count += 1
      else template += 1
    }
    if (count > 0) collections.push({ name: collection.name, variables: count })
  }
  const variables = collections.reduce((sum, item) => sum + item.variables, 0)

  const components: DesignSystemTable['components'] = []
  for (const model of models?.components ?? []) {
    const page = figma.root.children.find(item => item.name === model.page)
    if (page) await page.loadAsync()
    const card = findCard(page, model)
    const onPage = page?.children.find(
      node => node.type === 'COMPONENT_SET' && node.name === model.component
    )
    const set: SceneNodeLike | undefined = findSetIn(card, model.component) ?? onPage
    components.push({
      name: model.component,
      variants: set?.children?.filter(node => node.type === 'COMPONENT').length ?? 0,
      card: !!card,
      setOnPage: !!set && set === onPage,
    })
  }
  return {
    atom63: variables > 0 ? { variables, collections } : null,
    template: template > 0 ? { variables: template } : null,
    components,
  }
}
