/**
 * Writes a component set from a `ComponentModel`, bound to the variables the
 * token sync made: plan (a read-only diff per variant), apply (write what
 * differs), plan again to verify. Nodes are found by name, so a re-run updates
 * in place; layers and variants the model does not list are never touched.
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
  type ValueContext,
} from './component-values'
import type { ComponentModel, LayerSpec, VariantSpec } from './model'
import type { NodesApi, PageLike, SceneNodeLike } from './nodes-api'
import { legacyRingCheck, outlineChecks } from './outline'

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
}
export interface ComponentResult {
  /** Derived variables created or updated before binding. */
  variables: number
  created: number
  updated: number
  fontFallbacks: string[]
}

const GAP = 24
const REFERENCES = '.componentPropertyReferences'

interface PropertyKeys {
  label?: string
  icon?: string
}
interface Run extends ValueContext {
  model: ComponentModel
  variants: VariantSpec[]
  page: PageLike | undefined
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
  const set = page?.children.find(
    node => node.type === 'COMPONENT_SET' && node.name === model.component
  )
  return {
    figma,
    ...(await variablesOf(figma.variables)),
    fonts: new Map(),
    model,
    variants,
    page,
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
    },
    {
      what: `${OVERLAY}.constraints`,
      same: () =>
        layer.constraints?.horizontal === 'CENTER' && layer.constraints.vertical === 'CENTER',
      write: () => {
        layer.constraints = { horizontal: 'CENTER', vertical: 'CENTER' }
      },
    },
    {
      what: `${OVERLAY}.x`,
      same: () => nearPixel(layer.x, center().x),
      write: () => {
        layer.x = center().x
      },
    },
    {
      what: `${OVERLAY}.y`,
      same: () => nearPixel(layer.y, center().y),
      write: () => {
        layer.y = center().y
      },
    },
  ]
}

/** `Label.characters` and `Icon.visible` follow the set's Label and Icon properties. */
function referenceChecks(run: Run, variant: SceneNodeLike): Check[] {
  const checks: Check[] = []
  for (const [layerName, field, key] of [
    ['Label', 'characters', run.keys.label],
    ['Icon', 'visible', run.keys.icon],
  ] as const) {
    const layer = variant.children?.find(child => child.name === layerName)
    if (!layer) continue
    checks.push({
      what: `${layerName}${REFERENCES}`,
      same: () => !!key && layer.componentPropertyReferences?.[field] === key,
      write: () => {
        layer.componentPropertyReferences = { [field]: key }
      },
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

async function differs(run: Run, node: SceneNodeLike, spec: VariantSpec): Promise<boolean> {
  if (spec.layers.slice(1).some(layer => !findLayer(node, layer))) return true
  for (const group of await variantChecks(run, node, spec))
    if (group.checks.some(check => !check.same())) return true
  return false
}

async function planRun(run: Run): Promise<ComponentPlan> {
  const derived = derivedModel(run.model, run.variants)
  const known = new Set(derived.collections.flatMap(c => c.variables.map(v => v.token)))
  // A derived variable needs its code token; one the model does not define cannot be made.
  const needed = boundTokens(run.variants).map(token =>
    known.has(token) ? (parseDerived(token)?.alias ?? token) : token
  )
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
  for (const spec of run.variants) {
    const node = run.set && findVariant(run.set, spec.name)
    if (!node) plan.create.push(spec.name)
    else if (await differs(run, node, spec)) plan.update.push(spec.name)
    else plan.unchanged += 1
  }
  return plan
}

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

/**
 * Writes what differs on one variant. Property references wait until the
 * variant is in the set (`references`), since Figma checks them against it.
 */
async function writeVariant(
  run: Run,
  node: SceneNodeLike,
  spec: VariantSpec,
  fallbacks: Set<string>,
  references: boolean
) {
  let previous: SceneNodeLike | undefined
  for (const layer of spec.layers.slice(1))
    previous = findLayer(node, layer) ?? addLayer(run, node, layer, previous)
  for (const group of await variantChecks(run, node, spec)) {
    for (const fallback of group.fallbacks ?? []) fallbacks.add(fallback)
    const pending = group.checks.filter(
      check => (references || !check.what.endsWith(REFERENCES)) && !check.same()
    )
    // Figma changes a text layer only once its current font is loaded.
    if (pending.length > 0 && group.node.type === 'TEXT' && group.node.fontName)
      await loads(run, group.node.fontName)
    for (const check of pending) if (!check.same()) check.write()
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

async function applyRun(run: Run, plan: ComponentPlan): Promise<ComponentResult> {
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
  if (plan.create.length === 0 && plan.update.length === 0) return result
  const fallbacks = new Set<string>()
  // New text layers start in Inter Regular, and a font that does not load falls back to it.
  await loads(run, INTER)

  let page = run.page
  if (!page) {
    page = run.figma.createPage()
    page.name = run.model.page
    await page.loadAsync()
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
    await writeVariant(run, node, spec, fallbacks, false)
    created.push({ node, spec })
  }

  let set = run.set
  if (!set) {
    set = run.figma.combineAsVariants(
      created.map(item => item.node),
      page
    )
    set.name = run.model.component
    // The grid starts at the set's corner; `place` grows the set to fit it.
    set.resize(1, 1)
  } else for (const { node } of created) set.appendChild(node)
  ensureProperties(run, set)
  if (created.length > 0) place(run, set, created)

  for (const { node, spec } of created) await writeVariant(run, node, spec, fallbacks, true)
  for (const name of plan.update) {
    const spec = run.variants.find(variant => variant.name === name)
    const node = spec && findVariant(set, name)
    if (spec && node) await writeVariant(run, node, spec, fallbacks, true)
  }
  result.created = created.length
  result.updated = plan.update.length
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

export async function syncComponent(
  figma: NodesApi,
  model: ComponentModel,
  only?: string[]
): Promise<{ planned: ComponentPlan; applied: ComponentResult; verification: ComponentPlan }> {
  const planned = await planComponent(figma, model, only)
  const applied = await applyComponent(figma, model, only)
  const verification = await planComponent(figma, model, only)
  return { planned, applied, verification }
}
