/**
 * The whole Atom63 design system in one call, for the Cipher plugin's main
 * thread: the token set (variables, text and effect styles), then every
 * component and its spec card, through the same engine the agent path runs.
 * A check reads only. `readDesignSystemTable` says what a file holds now.
 */
import { applyPlan, type ApplyResult, readSnapshot, tokenOfCodeSyntax } from './apply'
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
import { planSync, type SyncModel, type SyncPlan } from './plan'
import { checkModel, type PartTotals } from './runtime'
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
 * A build that wrote nothing: the file has template collections whose names
 * Atom63 uses, and the caller did not allow writing into them.
 */
export interface DesignSystemBlocked {
  status: 'blocked'
  collisions: string[]
}

export interface BuildDesignSystemOptions {
  /**
   * Write into template collections whose names Atom63 uses (after the user
   * confirms). Their template variables are never retired or renamed away,
   * and their modes are only added to.
   */
  allowCollisions?: boolean
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

const totalsOf = ({ orphaned: _orphaned, ...totals }: SyncPlan['totals']): PartTotals => totals

/**
 * syncModel's variable pass, kept off a template's variables in the colliding
 * collections: a single template mode is kept (the model's modes are added
 * beside it, not renamed onto it), and a template variable whose token the
 * model puts in another collection is left in place, not retired.
 */
async function syncVariables(figma: NodesApi, model: SyncModel, collisions: Set<string>) {
  const plan = async () => planSync(model, await readSnapshot(figma.variables, model))
  let planned = await plan()
  let addedModes = 0
  const renames = planned.collections.filter(
    item => item.renameFirstMode && collisions.has(item.name)
  )
  if (renames.length > 0) {
    const modesOnly: SyncPlan = {
      ...planned,
      changes: [],
      collections: renames.map(item => ({
        ...item,
        renameFirstMode: null,
        addModes: [item.renameFirstMode!, ...item.addModes],
      })),
    }
    addedModes = (await applyPlan(figma.variables, model, modesOnly)).addedModes
    planned = await plan()
  }
  const changes = planned.changes.map(change =>
    change.kind === 'create' && change.moveFrom && collisions.has(change.moveFrom.collection)
      ? { kind: change.kind, collection: change.collection, variable: change.variable }
      : change
  )
  const kept: SyncPlan = {
    ...planned,
    changes,
    totals: {
      ...planned.totals,
      move: changes.filter(change => change.kind === 'create' && change.moveFrom).length,
    },
  }
  const applied = await applyPlan(figma.variables, model, kept)
  return {
    planned: totalsOf(kept.totals),
    applied: { ...applied, addedModes: applied.addedModes + addedModes },
    verification: totalsOf((await plan()).totals),
  }
}

/**
 * Writes the token set, then each component with its spec card, and verifies
 * each part as it goes. Yields to the host between phases and components, so
 * a plugin's UI can show `onProgress`. When the file has template collections
 * named as Atom63's (`collisions`), it writes nothing unless `allowCollisions`.
 */
export async function buildDesignSystem(
  figma: NodesApi,
  models: DesignSystemModels,
  onProgress: (progress: DesignSystemProgress) => void = () => {},
  options: BuildDesignSystemOptions = {}
): Promise<DesignSystemOutcome | DesignSystemBlocked> {
  const { collisions } = await readTokenTables(figma, models.sync)
  if (collisions.length > 0 && !options.allowCollisions) return { status: 'blocked', collisions }
  const sync = withStyles(models.sync)
  const total = models.components.length
  onProgress({ phase: 'tokens', done: 0, total: 1 })
  await settle()
  const { styles: set, ...variables } = sync
  const tokens = await syncVariables(figma, variables, new Set(collisions))
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
   * Variables with another project's token code syntax: a template table;
   * null when none. `collections` names every collection holding one.
   */
  template: { variables: number; collections: string[] } | null
  /** Template collections named as an Atom63 one, which a build would write into. */
  collisions: string[]
  components: { name: string; variants: number; card: boolean; setOnPage: boolean }[]
}

/**
 * Atom63 and template tokens, by collection. A collection is Atom63's when it
 * holds an `--a63-*` token, or, once the file holds Atom63 at all, when it has
 * an Atom63 collection's name and only that collection's tokens (Foundation
 * and a few others have no `--a63-*` token). In an Atom63 collection, a token
 * in the Atom63 set is Atom63's. Every other `var(--x)` token is a template's,
 * even one whose name the Atom63 set shares (a template's palette often does).
 */
async function readTokenTables(figma: NodesApi, sync: SyncModel | undefined) {
  const modelTokens = new Map(
    sync?.collections.map(item => [item.name, new Set(item.variables.map(v => v.token))])
  )
  const atom63Tokens = new Set([...modelTokens.values()].flatMap(tokens => [...tokens]))
  const prefixed = (token: string) => token.startsWith('--a63-')
  const read = await Promise.all(
    (await figma.variables.getLocalVariableCollectionsAsync()).map(async collection => {
      const variables = await Promise.all(
        collection.variableIds.map(id => figma.variables.getVariableByIdAsync(id))
      )
      const tokens = variables
        .map(variable => tokenOfCodeSyntax(variable?.codeSyntax?.WEB))
        .filter((token): token is string => !!token && !isDerivedToken(token))
      return { name: collection.name, tokens }
    })
  )
  const fileHasAtom63 = read.some(item => item.tokens.some(prefixed))
  const atom63: { name: string; variables: number }[] = []
  const template: { name: string; variables: number }[] = []
  for (const { name, tokens } of read) {
    const own = modelTokens.get(name)
    const isAtom63Collection =
      tokens.some(prefixed) ||
      (fileHasAtom63 && !!own && tokens.length > 0 && tokens.every(token => own.has(token)))
    const count = isAtom63Collection
      ? tokens.filter(token => prefixed(token) || atom63Tokens.has(token)).length
      : 0
    if (count > 0) atom63.push({ name, variables: count })
    if (tokens.length > count) template.push({ name, variables: tokens.length - count })
  }
  const sum = (items: { variables: number }[]) =>
    items.reduce((total, item) => total + item.variables, 0)
  return {
    atom63: atom63.length > 0 ? { variables: sum(atom63), collections: atom63 } : null,
    template:
      template.length > 0
        ? { variables: sum(template), collections: template.map(item => item.name) }
        : null,
    collisions: template.map(item => item.name).filter(name => modelTokens.has(name)),
  }
}

/**
 * What the file holds now, cheaply: variables by code syntax only (no values),
 * and each component's set and card on its page. Without `models`, only an
 * `--a63-*` token is Atom63's, nothing collides, and no component is looked for.
 */
export async function readDesignSystemTable(
  figma: NodesApi,
  models?: DesignSystemModels
): Promise<DesignSystemTable> {
  const tables = await readTokenTables(figma, models?.sync)
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
  return { ...tables, components }
}
