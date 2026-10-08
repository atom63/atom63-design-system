/**
 * Writes a component set from a `ComponentModel`, bound to the variables the
 * token sync made: plan (a read-only diff per variant), apply (write what
 * differs), plan again to verify, and re-apply once the variants that still
 * differ; each verification waits a macrotask first. A Label reference Figma
 * is still reconciling is reported as pending, not as a difference. Nodes are
 * found by name, so a re-run updates in place; layers and variants the model
 * does not list are never touched.
 * Bundled into the runtime IIFE: no Node or DOM imports.
 */
import { applyPlan, readSnapshot } from '../apply'
import { parseDerived } from '../derived'
import { planSync, type SyncModel } from '../plan'
import { variablesOf } from '../style-sync'
import {
  type Check,
  fontTarget,
  INTER,
  layerChecks,
  loads,
  tokensOf,
  shown,
  type ValueContext,
} from './component-values'
import type { ComponentModel, LayerSpec, VariantSpec } from './model'
import type { NodesApi, PageLike, SceneNodeLike } from './nodes-api'
import { legacyRingCheck, outlineChecks } from './outline'
import { applyCard, CARD_TOKENS, type CardPlan, findCard, findSetIn, planCard } from './spec-card'

export interface ComponentPlan {
  /** C8: code tokens with no variable; non-empty → nothing is written. */
  missingVariables: string[]
  /** Derived variables (the `Component` collection) to create or update, by name. */
  variables: string[]
  /** Variant names (and 'page', 'set') that do not exist yet. */
  create: string[]
  /** Variant names whose layers or bindings differ. */
  update: string[]
  unchanged: number
  /** The first check that differs on each differing variant, at most `DIFFERENCES`; only when any. */
  differences?: Difference[]
  /**
   * Variants whose Label reference Figma is still reconciling, at most
   * `DIFFERENCES`: neither `update` nor `unchanged`; only when any.
   */
  pendingReferences?: string[]
  /** The spec card's parts (spec-card.ts), by name; only in the part that carries `doc`. */
  card?: CardPlan
}
/** A check that does not hold on a variant, with what the node holds and what it should. */
export interface Difference {
  variant: string
  what: string
  actual?: string
  expected?: string
}
export interface ComponentResult {
  /** Derived variables created or updated before binding. */
  variables: number
  created: number
  updated: number
  fontFallbacks: string[]
  /** Spec card parts created and updated; only in the part that carries `doc`. */
  card?: { created: number; updated: number }
}
/** A variant the retry could not write, with the error Figma threw. */
export interface RetryError {
  variant: string
  error: string
}

const GAP = 24
/** Differences a plan reports, so a script's result stays well under use_figma's 20 KB. */
export const DIFFERENCES = 12
/** Retry errors a sync reports, for the same reason. */
export const RETRY_ERRORS = 12
const REFERENCES = '.componentPropertyReferences'
/** Figma's error for a reference write while it is still reconciling that reference. */
const REFERENCE_EXISTS = 'Could not create a new component property reference'

/**
 * Yields one macrotask, where the host has timers, else a microtask: right
 * after a set is made, Figma can read a value back stale until the execution
 * yields.
 */
export function settle(): Promise<void> {
  return typeof setTimeout === 'function'
    ? new Promise<void>(resolve => setTimeout(resolve, 0))
    : Promise.resolve()
}

interface PropertyKeys {
  label?: string
  icon?: string
}
interface Run extends ValueContext {
  model: ComponentModel
  variants: VariantSpec[]
  page: PageLike | undefined
  /** The spec card frame, when the page has one. */
  card: SceneNodeLike | undefined
  set: SceneNodeLike | undefined
  keys: PropertyKeys
}

const boundTokens = (variants: VariantSpec[]) => [
  ...new Set(variants.flatMap(variant => variant.layers.flatMap(tokensOf))),
]

/** The derived variables `variants` bind, as a sync model for the token engine. */
function derivedModel(model: ComponentModel, variants: VariantSpec[]): SyncModel {
  const bound = new Set(boundTokens(variants))
  const variables = model.derived.variables.filter(variable => bound.has(variable.token))
  return {
    schemaVersion: 1,
    summary: { collections: 1, variables: variables.length, aliasValues: 0, skipped: 0 },
    collections: variables.length > 0 ? [{ ...model.derived, variables }] : [],
    skipped: [],
  }
}

async function open(figma: NodesApi, model: ComponentModel, only?: string[]): Promise<Run> {
  const wanted = only && new Set(only)
  const variants = model.variants.filter(variant => !wanted || wanted.has(variant.name))
  const page = figma.root.children.find(item => item.name === model.page)
  if (page) await page.loadAsync()
  // In the spec card (S6), else on the page: a file from before the card, or a set the card has not adopted yet.
  const card = findCard(page, model)
  const set =
    findSetIn(card, model.component) ??
    page?.children.find(node => node.type === 'COMPONENT_SET' && node.name === model.component)
  return {
    figma,
    ...(await variablesOf(figma.variables)),
    fonts: new Map(),
    model,
    variants,
    page,
    card,
    set,
    keys: set ? propertyKeys(set) : {},
  }
}

function propertyKeys(set: SceneNodeLike): PropertyKeys {
  const entries = Object.entries(set.componentPropertyDefinitions ?? {})
  const find = (name: string, type: string) =>
    entries.find(([key, definition]) => key.split('#')[0] === name && definition.type === type)?.[0]
  return { label: find('Label', 'TEXT'), icon: find('Icon', 'BOOLEAN') }
}

const kindOf = (layer: LayerSpec) => (layer.kind === 'text' ? 'TEXT' : 'FRAME')
const findLayer = (variant: SceneNodeLike, layer: LayerSpec) =>
  variant.children?.find(child => child.name === layer.name && child.type === kindOf(layer))
const findVariant = (set: SceneNodeLike, name: string) =>
  set.children?.find(child => child.type === 'COMPONENT' && child.name === name)

/**
 * The root's auto layout: a horizontal row, centered, hugging its width at a
 * fixed height. Clipping stays off so the focus ring layer, which sits outside
 * the root as CSS `outline` does, is not cut away (C6); the earlier ring's
 * drop shadow goes first, while the clipping Figma required for it is still on.
 */
function rootChecks(run: Run, root: SceneNodeLike): { before: Check[]; after: Check[] } {
  const check = <K extends keyof SceneNodeLike>(key: K, value: SceneNodeLike[K]): Check => ({
    what: `${root.name}.${String(key)}`,
    same: () => root[key] === value,
    write: () => {
      root[key] = value
    },
    describe: () => ({ actual: root[key], expected: value }),
  })
  return {
    before: [
      check('layoutMode', 'HORIZONTAL'),
      check('primaryAxisAlignItems', 'CENTER'),
      check('counterAxisAlignItems', 'CENTER'),
      legacyRingCheck(root, run.model, run),
      check('clipsContent', false),
    ],
    // After the height: Figma fixes both axes when an auto-layout frame is resized.
    after: [check('primaryAxisSizingMode', 'AUTO'), check('counterAxisSizingMode', 'FIXED')],
  }
}

const OVERLAY = 'Spinner'
const nearPixel = (left: number, right: number) => Math.abs(left - right) < 0.01

/**
 * The Spinner sits over the row, as CSS `position: absolute; inset: 0` places
 * it: out of the auto-layout flow (so a loading variant is no wider) and
 * centered, with center constraints so it stays centered as the root hugs.
 */
function overlayChecks(root: SceneNodeLike): Check[] {
  const layer = root.children?.find(child => child.name === OVERLAY && child.type === 'FRAME')
  if (!layer) return []
  const center = () => ({
    x: (root.width - layer.width) / 2,
    y: (root.height - layer.height) / 2,
  })
  return [
    {
      what: `${OVERLAY}.layoutPositioning`,
      same: () => layer.layoutPositioning === 'ABSOLUTE',
      write: () => {
        layer.layoutPositioning = 'ABSOLUTE'
      },
      describe: () => ({ actual: layer.layoutPositioning, expected: 'ABSOLUTE' }),
    },
    {
      what: `${OVERLAY}.constraints`,
      same: () =>
        layer.constraints?.horizontal === 'CENTER' && layer.constraints.vertical === 'CENTER',
      write: () => {
        layer.constraints = { horizontal: 'CENTER', vertical: 'CENTER' }
      },
      describe: () => ({
        actual: layer.constraints,
        expected: { horizontal: 'CENTER', vertical: 'CENTER' },
      }),
    },
    {
      what: `${OVERLAY}.x`,
      same: () => nearPixel(layer.x, center().x),
      write: () => {
        layer.x = center().x
      },
      describe: () => ({ actual: layer.x, expected: center().x }),
    },
    {
      what: `${OVERLAY}.y`,
      same: () => nearPixel(layer.y, center().y),
      write: () => {
        layer.y = center().y
      },
      describe: () => ({ actual: layer.y, expected: center().y }),
    },
  ]
}

/**
 * A property-reference check. Right after a set is made, Figma reconciles its
 * default variant's text-property reference asynchronously: meanwhile the
 * layer reads `{}` and a write is refused with `REFERENCE_EXISTS`, and it
 * settles by itself. `unsettled` says the Label reads so while its property
 * is defined.
 */
interface ReferenceCheck extends Check {
  unsettled?(): boolean
}

/** `Label.characters` and `Icon.visible` follow the set's Label and Icon properties. */
function referenceChecks(run: Run, variant: SceneNodeLike): ReferenceCheck[] {
  const checks: ReferenceCheck[] = []
  for (const [layerName, field, key] of [
    ['Label', 'characters', run.keys.label],
    ['Icon', 'visible', run.keys.icon],
  ] as const) {
    const layer = variant.children?.find(child => child.name === layerName)
    if (!layer) continue
    const unsettled = () => {
      const references = layer.componentPropertyReferences
      return !!key && (!references || Object.keys(references).length === 0)
    }
    checks.push({
      what: `${layerName}${REFERENCES}`,
      same: () => !!key && layer.componentPropertyReferences?.[field] === key,
      write: () => {
        layer.componentPropertyReferences = { [field]: key }
      },
      describe: () => ({
        actual: layer.componentPropertyReferences ?? null,
        expected: { [field]: key ?? 'no property' },
      }),
      ...(field === 'characters' ? { unsettled } : {}),
    })
  }
  return checks
}

interface CheckGroup {
  node: SceneNodeLike
  checks: Check[]
  fallbacks?: string[]
}

/** Every check for a variant's existing layers, in write order. */
async function variantChecks(run: Run, node: SceneNodeLike, spec: VariantSpec) {
  const layout = rootChecks(run, node)
  const groups: CheckGroup[] = []
  for (const [index, layer] of spec.layers.entries()) {
    const target = index === 0 ? node : findLayer(node, layer)
    if (!target) continue
    const font = layer.kind === 'text' ? await fontTarget(run, target, layer) : null
    const own = layerChecks(run, target, layer, font)
    groups.push({
      node: target,
      checks: index === 0 ? [...layout.before, ...own] : own,
      fallbacks: font?.fallbacks,
    })
  }
  // Last, on the root's final size: outline layers leave the flow before the overlay centers.
  const outlines = spec.layers.flatMap(layer => {
    const target = layer.kind === 'outline' ? findLayer(node, layer) : undefined
    return target ? outlineChecks(node, target, layer) : []
  })
  groups.push({
    node,
    checks: [...layout.after, ...outlines, ...overlayChecks(node), ...referenceChecks(run, node)],
  })
  return groups
}

/** A failing check as a difference, with short actual and expected values when it can say. */
function difference(variant: string, check: Check): Difference {
  let described: { actual: unknown; expected: unknown } | undefined
  try {
    described = check.describe?.()
  } catch {
    described = undefined
  }
  return described
    ? {
        variant,
        what: check.what,
        actual: shown(described.actual),
        expected: shown(described.expected),
      }
    : { variant, what: check.what }
}

/** The set's default variant: its first child. */
const isDefault = (run: Run, node: SceneNodeLike) => run.set?.children?.[0] === node

/**
 * The first thing that differs on a variant, or null when it holds the model,
 * and whether its Label reference is pending: unsettled on the set's default
 * variant, or on a variant in `pending`, whose write Figma refused as such.
 */
async function differs(run: Run, node: SceneNodeLike, spec: VariantSpec, pending: Set<string>) {
  const missing = spec.layers.slice(1).find(layer => !findLayer(node, layer))
  if (missing)
    return { difference: { variant: spec.name, what: `${missing.name} missing` }, pending: false }
  const excused = isDefault(run, node) || pending.has(spec.name)
  let unsettled = false
  for (const group of await variantChecks(run, node, spec))
    for (const check of group.checks as ReferenceCheck[]) {
      if (check.same()) continue
      if (excused && check.unsettled?.()) {
        unsettled = true
        continue
      }
      return { difference: difference(spec.name, check), pending: unsettled }
    }
  return { difference: null, pending: unsettled }
}

async function planRun(run: Run, pending = new Set<string>()): Promise<ComponentPlan> {
  const derived = derivedModel(run.model, run.variants)
  const known = new Set(derived.collections.flatMap(c => c.variables.map(v => v.token)))
  // A derived variable needs its code token; one the model does not define cannot be made.
  const needed = boundTokens(run.variants).map(token =>
    known.has(token) ? (parseDerived(token)?.alias ?? token) : token
  )
  if (run.model.doc) needed.push(...Object.values(CARD_TOKENS))
  const variablePlan = planSync(derived, await readSnapshot(run.figma.variables, derived))
  const plan: ComponentPlan = {
    missingVariables: [...new Set(needed)].filter(token => !run.byToken.has(token)),
    variables: variablePlan.changes.map(change => change.variable.name),
    create: [],
    update: [],
    unchanged: 0,
  }
  if (!run.page) plan.create.push('page')
  if (!run.set) plan.create.push('set')
  const differences: Difference[] = []
  const unsettled: string[] = []
  for (const spec of run.variants) {
    const node = run.set && findVariant(run.set, spec.name)
    if (!node) {
      plan.create.push(spec.name)
      continue
    }
    const found = await differs(run, node, spec, pending)
    if (found.pending && unsettled.length < DIFFERENCES) unsettled.push(spec.name)
    if (found.difference) {
      plan.update.push(spec.name)
      if (differences.length < DIFFERENCES) differences.push(found.difference)
    } else if (!found.pending) plan.unchanged += 1
  }
  if (run.model.doc) {
    const card = await planCard(run)
    plan.card = card.plan
    for (const found of card.differences)
      if (differences.length < DIFFERENCES) differences.push(difference(found.variant, found.check))
  }
  if (differences.length > 0) plan.differences = differences
  if (unsettled.length > 0) plan.pendingReferences = unsettled
  return plan
}

const cardWork = (plan: ComponentPlan) =>
  !!plan.card && plan.card.create.length + plan.card.update.length > 0

export async function planComponent(
  figma: NodesApi,
  model: ComponentModel,
  only?: string[]
): Promise<ComponentPlan> {
  return planRun(await open(figma, model, only))
}

/** Adds a missing anatomy layer after the anatomy layer before it. */
function addLayer(run: Run, variant: SceneNodeLike, layer: LayerSpec, after?: SceneNodeLike) {
  const node = layer.kind === 'text' ? run.figma.createText() : run.figma.createFrame()
  node.name = layer.name
  variant.insertChild(after ? (variant.children ?? []).indexOf(after) + 1 : 0, node)
  if (layer.kind === 'text') {
    node.characters = run.model.label
    node.textAutoResize = 'WIDTH_AND_HEIGHT'
  } else {
    node.fills = []
    // The Icon boolean property shows it; its default is off.
    if (layer.name === 'Icon') node.visible = false
  }
  return node
}

const messageOf = (error: unknown) =>
  error && typeof error === 'object' && 'message' in error ? String(error.message) : String(error)

/**
 * Runs one write, naming the variant and what it wrote if it throws: Figma's
 * sandbox drops the stack, and with it where the message came from.
 */
function named<T>(variant: string, what: string, write: () => T): T {
  try {
    return write()
  } catch (error) {
    throw Object.assign(new Error(`${variant} — ${what}: ${messageOf(error)}`), { cause: error })
  }
}

/**
 * What an apply records: the variants whose Label reference Figma is still
 * reconciling (`pending`) and, in a retry, the variants it could not write.
 */
interface Outcome {
  pending: Set<string>
  errors?: RetryError[]
}

/**
 * Writes what differs on one variant. Property references wait until the
 * variant is in the set (`references`), since Figma checks them against it.
 * A Label reference write Figma refuses while it reads unsettled is pending,
 * not an error; a retry does not write the default variant's unsettled one.
 */
async function writeVariant(
  run: Run,
  node: SceneNodeLike,
  spec: VariantSpec,
  fallbacks: Set<string>,
  references: boolean,
  outcome: Outcome
) {
  const write = (check: ReferenceCheck) => {
    if (outcome.errors && isDefault(run, node) && check.unsettled?.()) {
      outcome.pending.add(spec.name)
      return
    }
    try {
      named(spec.name, check.what, () => check.write())
    } catch (error) {
      if (!messageOf(error).includes(REFERENCE_EXISTS) || !check.unsettled?.()) throw error
      outcome.pending.add(spec.name)
    }
  }
  let previous: SceneNodeLike | undefined
  for (const layer of spec.layers.slice(1))
    previous =
      findLayer(node, layer) ??
      named(spec.name, `add ${layer.name}`, () => addLayer(run, node, layer, previous))
  for (const group of await variantChecks(run, node, spec)) {
    for (const fallback of group.fallbacks ?? []) fallbacks.add(fallback)
    const pending = group.checks.filter(
      check => (references || !check.what.endsWith(REFERENCES)) && !check.same()
    )
    // Figma changes a text layer only once its current font is loaded.
    if (pending.length > 0 && group.node.type === 'TEXT' && group.node.fontName)
      await loads(run, group.node.fontName)
    for (const check of pending) if (!check.same()) write(check)
  }
}

function ensureProperties(run: Run, set: SceneNodeLike) {
  const keys = propertyKeys(set)
  run.keys = {
    label: keys.label ?? set.addComponentProperty?.('Label', 'TEXT', run.model.label),
    icon: keys.icon ?? set.addComponentProperty?.('Icon', 'BOOLEAN', false),
  }
}

/**
 * Places new variants on a grid, rows Variant × Size and columns State, with
 * cells as large as the largest variant, and grows the set to fit. Variants
 * already in the set keep their place.
 */
function place(run: Run, set: SceneNodeLike, added: { node: SceneNodeLike; spec: VariantSpec }[]) {
  const { Variant, Size, State } = run.model.axes
  const variants = (set.children ?? []).filter(child => child.type === 'COMPONENT')
  const width = Math.max(...variants.map(child => child.width))
  const height = Math.max(...variants.map(child => child.height))
  let right = set.width
  let bottom = set.height
  for (const { node, spec } of added) {
    const row = Variant.indexOf(spec.coord.variant) * Size.length + Size.indexOf(spec.coord.size)
    node.x = GAP + State.indexOf(spec.coord.state) * (width + GAP)
    node.y = GAP + row * (height + GAP)
    right = Math.max(right, node.x + width + GAP)
    bottom = Math.max(bottom, node.y + height + GAP)
  }
  if (right !== set.width || bottom !== set.height) set.resize(right, bottom)
}

/**
 * Applies a plan. In a retry (`outcome.errors`), a variant whose write throws
 * is recorded in its errors and the others still run; otherwise the first
 * throw ends the apply.
 */
async function applyRun(
  run: Run,
  plan: ComponentPlan,
  outcome: Outcome = { pending: new Set() }
): Promise<ComponentResult> {
  const fallbacks = new Set<string>()
  const write = async (node: SceneNodeLike, spec: VariantSpec, references: boolean) => {
    const errors = outcome.errors
    if (!errors) return writeVariant(run, node, spec, fallbacks, references, outcome)
    try {
      await writeVariant(run, node, spec, fallbacks, references, outcome)
    } catch (error) {
      if (errors.length < RETRY_ERRORS) errors.push({ variant: spec.name, error: messageOf(error) })
    }
  }
  const result: ComponentResult = { variables: 0, created: 0, updated: 0, fontFallbacks: [] }
  if (plan.missingVariables.length > 0) return result
  if (plan.variables.length > 0) {
    // Derived variables first, through the token engine, so the paints can bind them.
    const derived = derivedModel(run.model, run.variants)
    const variablePlan = planSync(derived, await readSnapshot(run.figma.variables, derived))
    const applied = await applyPlan(run.figma.variables, derived, variablePlan)
    result.variables = applied.created + applied.updated
    Object.assign(run, await variablesOf(run.figma.variables))
  }
  if (plan.create.length === 0 && plan.update.length === 0 && !cardWork(plan)) return result
  // New text layers start in Inter Regular, and a font that does not load falls back to it.
  await loads(run, INTER)

  let page = run.page
  if (!page) {
    page = run.figma.createPage()
    page.name = run.model.page
    await page.loadAsync()
    run.page = page
  }

  const created: { node: SceneNodeLike; spec: VariantSpec }[] = []
  for (const spec of run.variants) {
    if (run.set && findVariant(run.set, spec.name)) continue
    // A run that failed before the set took its variants left them loose on the page.
    let node = page.children.find(child => child.type === 'COMPONENT' && child.name === spec.name)
    if (!node) {
      node = run.figma.createComponent()
      // Figma puts a new node on the current page; keep it on ours until the set takes it.
      page.appendChild(node)
      node.name = spec.name
    }
    await write(node, spec, false)
    created.push({ node, spec })
  }

  let set = run.set
  // A new set starts on the page; the part that carries the doc moves it into the card.
  if (!set && created.length === 0) return finish(run, plan, result, fallbacks, 0, outcome)
  if (!set) {
    set = run.figma.combineAsVariants(
      created.map(item => item.node),
      page
    )
    set.name = run.model.component
    // The grid starts at the set's corner; `place` grows the set to fit it.
    set.resize(1, 1)
    run.set = set
  } else for (const { node } of created) set.appendChild(node)
  ensureProperties(run, set)
  if (created.length > 0) place(run, set, created)

  for (const { node, spec } of created) await write(node, spec, true)
  for (const name of plan.update) {
    const spec = run.variants.find(variant => variant.name === name)
    const node = spec && findVariant(set, name)
    if (spec && node) await write(node, spec, true)
  }
  return finish(run, plan, result, fallbacks, created.length, outcome)
}

/** Draws the spec card, in the part that carries the doc, once every variant is written. */
async function finish(
  run: Run,
  plan: ComponentPlan,
  result: ComponentResult,
  fallbacks: Set<string>,
  created: number,
  outcome: Outcome
): Promise<ComponentResult> {
  result.created = created
  result.updated = plan.update.length
  if (run.model.doc) {
    try {
      const card = await applyCard(run, named)
      result.card = { created: card.created, updated: card.updated }
      for (const fallback of card.fallbacks) fallbacks.add(fallback)
    } catch (error) {
      // As for a variant: a retry records what it could not write, a first apply throws.
      if (!outcome.errors) throw error
      if (outcome.errors.length < RETRY_ERRORS)
        outcome.errors.push({ variant: 'card', error: messageOf(error) })
    }
  }
  result.fontFallbacks = [...fallbacks]
  return result
}

export async function applyComponent(
  figma: NodesApi,
  model: ComponentModel,
  only?: string[]
): Promise<ComponentResult> {
  const run = await open(figma, model, only)
  return applyRun(run, await planRun(run))
}

export interface ComponentSync {
  planned: ComponentPlan
  applied: ComponentResult
  verification: ComponentPlan
  /** Variants applied a second time because the first verification still listed them; only when any. */
  retried?: number
  /** Variants the retry could not write, at most `RETRY_ERRORS`; only when any. */
  retryErrors?: RetryError[]
}

/**
 * Plan, apply, plan again. Each verification waits a macrotask first, since
 * Figma can read a value back stale until the execution yields; a variant the
 * first verification still lists is applied once more, alone, and planned
 * again; never more than once. The retry does not throw: a variant it cannot
 * write is reported in `retryErrors`, the others still run, and the final
 * verification says what holds. A Label reference Figma is still reconciling
 * is reported in `pendingReferences` and not written again.
 */
export async function syncComponent(
  figma: NodesApi,
  model: ComponentModel,
  only?: string[]
): Promise<ComponentSync> {
  const first = await open(figma, model, only)
  const planned = await planRun(first)
  const outcome: Outcome = { pending: new Set() }
  const applied = await applyRun(first, planned, outcome)
  await settle()
  const verification = await planRun(await open(figma, model, only), outcome.pending)
  // Only variants and the card: with the page or the set missing, a second apply would make them again.
  const again =
    verification.missingVariables.length === 0 &&
    !verification.create.includes('page') &&
    !verification.create.includes('set')
  const retry = again ? [...verification.create, ...verification.update] : []
  if (retry.length === 0 && !(again && cardWork(verification)))
    return { planned, applied, verification }
  const run = await open(figma, model, retry)
  const errors: RetryError[] = []
  const second = await applyRun(run, await planRun(run, outcome.pending), {
    pending: outcome.pending,
    errors,
  })
  await settle()
  const card =
    applied.card || second.card
      ? {
          card: {
            created: (applied.card?.created ?? 0) + (second.card?.created ?? 0),
            updated: (applied.card?.updated ?? 0) + (second.card?.updated ?? 0),
          },
        }
      : {}
  return {
    planned,
    applied: {
      variables: applied.variables + second.variables,
      created: applied.created + second.created,
      updated: applied.updated + second.updated,
      fontFallbacks: [...new Set([...applied.fontFallbacks, ...second.fontFallbacks])],
      ...card,
    },
    verification: await planRun(await open(figma, model, only), outcome.pending),
    ...(retry.length > 0 ? { retried: retry.length } : {}),
    ...(errors.length > 0 ? { retryErrors: errors } : {}),
  }
}
