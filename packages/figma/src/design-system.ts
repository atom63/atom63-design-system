/**
 * The whole Atom63 design system in one call, for the Cipher plugin's main
 * thread: the token set (variables, text and effect styles), then every
 * component and its spec card, through the same engine the agent path runs.
 * A check reads only. `readDesignSystemTable` says what a file holds now.
 */
import { type ApplyResult, MOVED_PREFIX, tokenOfCodeSyntax } from './apply'
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

/**
 * A build that wrote nothing: the file already holds a token set that is not
 * provably Atom63's (see `readDesignSystemTable`). `collections` names it.
 */
export interface DesignSystemBlocked {
  status: 'blocked'
  reason: string
  collections: string[]
}

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
    outcome.tokens.verification.typeConflicts === 0 &&
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
 * a plugin's UI can show `onProgress`. When the file already holds another
 * token set, it refuses: `blocked`, nothing written and no progress posted.
 */
export async function buildDesignSystem(
  figma: NodesApi,
  models: DesignSystemModels,
  onProgress: (progress: DesignSystemProgress) => void = () => {}
): Promise<DesignSystemOutcome | DesignSystemBlocked> {
  const { template, blocked } = await readTokenTables(figma, models.sync)
  if (template && blocked) {
    return { status: 'blocked', reason: blocked, collections: template.collections }
  }
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
  /** Variables in the collections that are provably Atom63's; null when none. */
  atom63: { variables: number; collections: { name: string; variables: number }[] } | null
  /**
   * Another token set: every collection holding a token variable that is not
   * provably Atom63's, or an Atom63-named collection that cannot be Atom63's;
   * null when none.
   */
  template: { variables: number; collections: string[] } | null
  /** Why a build would refuse this file, when `template` is set; else null. */
  blocked: string | null
  components: { name: string; variants: number; card: boolean; setOnPage: boolean }[]
}

const sameModes = (modes: readonly string[], wanted: readonly string[]) =>
  modes.length === wanted.length &&
  modes[0] === wanted[0] &&
  wanted.every(mode => modes.includes(mode))

/**
 * Atom63's and another token set's variables, by collection. Nothing is
 * claimed for Atom63 that it cannot prove; a file that holds anything else is
 * one a build refuses.
 *
 * - A token variable is one whose web code syntax is `var(--x)`. Derived
 *   (`color-mix`) variables and Atom63's retired `(moved)/…` copies are
 *   ignored: both are Atom63's own.
 * - A collection is Atom63's only when its name is an Atom63 collection's, no
 *   other local collection has that name, its modes are the model's modes for
 *   it (the same names, the same first, default, mode), and each of its token
 *   variables stands for a token the model puts in that collection, with no
 *   other variable in the file standing for the same token. And the file must
 *   hold such a collection with an `--a63-*` token: a template's own `Surface`
 *   can hold exactly Atom63's Surface tokens, but no template has those.
 * - Every other collection with a token variable holds another token set. So
 *   does an Atom63-named collection that is not Atom63's and holds any variable,
 *   with code syntax or without (a template's `Mode`, whose modes differ).
 *   Variables without code syntax elsewhere are a designer's and are ignored.
 *
 * An older Atom63 version's token that this one dropped or moved reads as
 * another token set too: the build refuses rather than guess.
 */
async function readTokenTables(figma: NodesApi, sync: SyncModel) {
  const model = new Map(
    sync.collections.map(item => [
      item.name,
      { modes: item.modes, tokens: new Set(item.variables.map(v => v.token)) },
    ])
  )
  const read = await Promise.all(
    (await figma.variables.getLocalVariableCollectionsAsync()).map(async collection => {
      const variables = (
        await Promise.all(
          collection.variableIds.map(id => figma.variables.getVariableByIdAsync(id))
        )
      ).filter(variable => !!variable && !variable.name.startsWith(`${MOVED_PREFIX}/`))
      const tokens = variables
        .map(variable => tokenOfCodeSyntax(variable?.codeSyntax?.WEB))
        .filter((token): token is string => !!token && !isDerivedToken(token))
      return {
        name: collection.name,
        modes: collection.modes.map(mode => mode.name),
        tokens,
        variables: variables.length,
      }
    })
  )
  const names = new Map<string, number>()
  const uses = new Map<string, number>()
  for (const { name, tokens } of read) {
    names.set(name, (names.get(name) ?? 0) + 1)
    for (const token of tokens) uses.set(token, (uses.get(token) ?? 0) + 1)
  }
  const candidates = new Set(
    read.filter(({ name, modes, tokens }) => {
      const own = model.get(name)
      return (
        !!own &&
        names.get(name) === 1 &&
        sameModes(modes, own.modes) &&
        tokens.every(token => own.tokens.has(token) && uses.get(token) === 1)
      )
    })
  )
  // A template's Surface can match Atom63's exactly; only Atom63 has `--a63-*` tokens.
  const anchored = [...candidates].some(({ tokens }) =>
    tokens.some(token => token.startsWith('--a63-'))
  )
  const atom63: { name: string; variables: number }[] = []
  const other: { name: string; variables: number; atom63Name: boolean }[] = []
  for (const item of read) {
    const { name, tokens, variables } = item
    const own = model.get(name)
    if (anchored && candidates.has(item)) {
      if (tokens.length > 0) atom63.push({ name, variables: tokens.length })
    } else if (own && variables > 0) {
      other.push({ name, variables, atom63Name: true })
    } else if (tokens.length > 0) {
      other.push({ name, variables: tokens.length, atom63Name: false })
    }
  }
  const sum = (items: { variables: number }[]) =>
    items.reduce((total, item) => total + item.variables, 0)
  const collections = other.map(item => item.name)
  return {
    atom63: atom63.length > 0 ? { variables: sum(atom63), collections: atom63 } : null,
    template: other.length > 0 ? { variables: sum(other), collections } : null,
    blocked:
      other.length > 0
        ? `This file already holds another token set (collections: ${collections.join(', ')}). Start the Atom63 design system in a new file.${
            other.some(item => item.atom63Name)
              ? " If this file holds an older Atom63 token set, this version can't update it."
              : ''
          }`
        : null,
  }
}

/**
 * What the file holds now, cheaply: variables by code syntax and modes only
 * (no values), and each component's set and card on its page. `blocked` says
 * whether a build would refuse the file (see `readTokenTables` for the rule).
 */
export async function readDesignSystemTable(
  figma: NodesApi,
  models: DesignSystemModels
): Promise<DesignSystemTable> {
  const tables = await readTokenTables(figma, models.sync)
  const components: DesignSystemTable['components'] = []
  for (const model of models.components) {
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
  return { ...tables, components }
}
