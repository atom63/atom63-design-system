/**
 * One layer property at a time: what Figma should hold for a model value, whether
 * the node already holds it, and how to write it. A plan asks `same`; an apply
 * writes only what is not. Bundled into the runtime IIFE: no Node or DOM imports.
 */
import type { VariableLike } from '../apply'
import { familiesOf, near } from '../style-sync'
import { firstFamily } from '../styles'
import type { ComponentValue, FigmaProperty, LayerSpec } from './model'
import type {
  BindableField,
  FontNameLike,
  NodesApi,
  PaintLike,
  SceneNodeLike,
  VariableAlias,
} from './nodes-api'

export interface ValueContext {
  figma: NodesApi
  byToken: Map<string, VariableLike>
  byId: Map<string, VariableLike>
  firstMode: Map<string, string>
  /** `family|style` → whether it loads, so a run tries each font once. */
  fonts: Map<string, Promise<boolean>>
}

export interface Check {
  what: string
  same(): boolean
  write(): void
  /** What the node holds and what the check wants, for a difference report. */
  describe?(): { actual: unknown; expected: unknown }
}

const SHOWN = 120

/** A value as a short string for a difference report: numbers rounded, at most 120 characters. */
export function shown(value: unknown): string {
  let text: string | undefined
  try {
    text = JSON.stringify(value, (_key, item: unknown) => {
      if (typeof item === 'number')
        return Number.isFinite(item) ? Math.round(item * 1000) / 1000 : String(item)
      if (typeof item === 'symbol') return 'mixed'
      return item
    })
  } catch {
    text = undefined
  }
  text ??= String(value)
  return text.length > SHOWN ? `${text.slice(0, SHOWN - 1)}…` : text
}

type Color = { r: number; g: number; b: number; a: number }
type Alias = { alias: string }

export const INTER: FontNameLike = { family: 'Inter', style: 'Regular' }

const isAlias = (value: ComponentValue | undefined): value is Alias => !!value && 'alias' in value
const isColor = (value: unknown): value is Color =>
  typeof value === 'object' && value !== null && 'r' in value && 'g' in value && 'b' in value
const literal = (value: ComponentValue | undefined) =>
  value && 'value' in value ? value.value : undefined
const sameColor = (left: { r: number; g: number; b: number }, right: Color) =>
  near(left.r, right.r) && near(left.g, right.g) && near(left.b, right.b)

/**
 * Every alias bound to a node field. A text node reports a text field
 * (`fontSize`, `fontWeight`, …) as an array, one alias per styled range; any
 * other field holds one alias.
 */
function storedAliases(node: SceneNodeLike, field: BindableField): readonly VariableAlias[] {
  const bound = (
    node.boundVariables as
      Partial<Record<BindableField, VariableAlias | readonly VariableAlias[]>> | undefined
  )?.[field]
  if (!bound) return []
  return 'id' in bound ? [bound] : bound
}

/**
 * Shorthand fields Figma binds but never stores: `boundVariables` reports a
 * `strokeWeight` binding on the four sides and a `cornerRadius` one on the four
 * corners. A legacy shorthand key, if a file has one, still counts.
 */
const storedAs: Partial<Record<BindableField, readonly BindableField[]>> = {
  strokeWeight: ['strokeTopWeight', 'strokeRightWeight', 'strokeBottomWeight', 'strokeLeftWeight'],
  cornerRadius: ['topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius'],
}

/** Every alias a field holds: a shorthand's own key, else each of its individual fields. */
function aliasesOf(node: SceneNodeLike, field: BindableField): readonly VariableAlias[] {
  const own = storedAliases(node, field)
  const parts = storedAs[field]
  if (own.length > 0 || !parts) return own
  return parts.flatMap(part => storedAliases(node, part))
}

const isBound = (node: SceneNodeLike, field: BindableField) => aliasesOf(node, field).length > 0

const nameOf = (context: ValueContext, id: string | undefined) =>
  id === undefined ? undefined : (context.byId.get(id)?.name ?? id)

/** The variables bound to a field, by name; one per text range. */
const boundNames = (context: ValueContext, node: SceneNodeLike, field: BindableField) =>
  aliasesOf(node, field).map(alias => nameOf(context, alias.id))

/** Bound to `id` across the whole node: every range of a text field, or the one alias. */
function boundTo(node: SceneNodeLike, field: BindableField, id: string): boolean {
  const parts = storedAs[field]
  if (parts && storedAliases(node, field).length === 0)
    return parts.every(part => boundTo(node, part, id))
  const aliases = aliasesOf(node, field)
  return aliases.length > 0 && aliases.every(alias => alias.id === id)
}

/** Tokens a layer binds, for the C8 check that every one has a variable. */
export function tokensOf(layer: LayerSpec): string[] {
  return Object.values(layer.properties).flatMap(value => (isAlias(value) ? [value.alias] : []))
}

export async function loads(context: ValueContext, font: FontNameLike): Promise<boolean> {
  const key = `${font.family}|${font.style}`
  let loaded = context.fonts.get(key)
  if (!loaded) {
    loaded = context.figma.loadFontAsync(font).then(
      () => true,
      () => false
    )
    context.fonts.set(key, loaded)
  }
  return loaded
}

/**
 * A variable's value in its collection's first mode, through aliases and
 * composed colors (an alias at an opacity scales the color's alpha).
 */
export function firstValue(context: ValueContext, variable: VariableLike, depth = 0): unknown {
  const raw = variable.valuesByMode[context.firstMode.get(variable.id) ?? '']
  if (!raw || typeof raw !== 'object' || depth >= 16) return raw
  const follow = (id: string | undefined) => {
    const target = context.byId.get(id ?? '')
    return target ? firstValue(context, target, depth + 1) : undefined
  }
  const alias = raw as { type?: string; id?: string }
  if (alias.type === 'VARIABLE_ALIAS') return follow(alias.id)
  const composed = raw as { color?: { id?: string }; opacity?: number }
  if (composed.color && typeof composed.opacity === 'number') {
    const color = follow(composed.color.id)
    return isColor(color) ? { ...color, a: (color.a ?? 1) * (composed.opacity / 100) } : undefined
  }
  return raw
}

/**
 * The color a variable shows on `node`: Figma's `resolveForConsumer` (the node's
 * effective modes), else the first-mode value. This is what Figma stores in a
 * paint bound to it: rgb as the color, alpha as the paint opacity.
 */
function resolvedColor(context: ValueContext, node: SceneNodeLike, variable: VariableLike) {
  const value = variable.resolveForConsumer
    ? variable.resolveForConsumer(node).value
    : firstValue(context, variable)
  return isColor(value) ? { r: value.r, g: value.g, b: value.b, a: value.a ?? 1 } : null
}

/** A solid paint of `color`, or black when the color is unknown. */
const solid = (color: Color | null): PaintLike => ({
  type: 'SOLID',
  color: color ? { r: color.r, g: color.g, b: color.b } : { r: 0, g: 0, b: 0 },
  opacity: color ? color.a : 1,
})

// Numbers ────────────────────────────────────────────────────────────────────

/** Figma fields each numeric model property writes. */
const numberFields: Partial<Record<FigmaProperty, BindableField[]>> = {
  strokeWeight: ['strokeWeight'],
  cornerRadius: ['topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius'],
  height: ['height'],
  size: ['width', 'height'],
  paddingInline: ['paddingLeft', 'paddingRight'],
  itemSpacing: ['itemSpacing'],
  fontSize: ['fontSize'],
  lineHeight: ['lineHeight'],
  opacity: ['opacity'],
}

function readNumber(node: SceneNodeLike, field: string): number {
  if (field === 'lineHeight')
    return node.lineHeight?.unit === 'PIXELS' ? node.lineHeight.value : Number.NaN
  return (node as unknown as Record<string, number>)[field]
}

function writeNumber(node: SceneNodeLike, field: string, value: number) {
  if (field === 'width') node.resize(value, node.height)
  else if (field === 'height') node.resize(node.width, value)
  else if (field === 'lineHeight') node.lineHeight = { unit: 'PIXELS', value }
  else (node as unknown as Record<string, number>)[field] = value
}

/** A bound field, or a literal with any binding cleared; other values are left alone. */
function fieldCheck(
  context: ValueContext,
  node: SceneNodeLike,
  field: BindableField,
  value: ComponentValue
): Check | null {
  const what = `${node.name}.${field}`
  if ('alias' in value) {
    const variable = context.byToken.get(value.alias)
    return {
      what,
      same: () => !!variable && boundTo(node, field, variable.id),
      write: () => node.setBoundVariable(field, variable ?? null),
      describe: () => ({
        actual: { bound: boundNames(context, node, field) },
        expected: { bound: variable?.name ?? `no variable for ${value.alias}` },
      }),
    }
  }
  const wanted = literal(value)
  if (typeof wanted === 'boolean' && field === 'visible')
    return {
      what,
      same: () => !isBound(node, 'visible') && node.visible === wanted,
      write: () => {
        if (isBound(node, 'visible')) node.setBoundVariable('visible', null)
        node.visible = wanted
      },
      describe: () => ({
        actual: { value: node.visible, bound: boundNames(context, node, 'visible') },
        expected: { value: wanted },
      }),
    }
  if (typeof wanted !== 'number' || field === 'visible') return null
  return {
    what,
    same: () => !isBound(node, field) && near(readNumber(node, field), wanted),
    write: () => {
      if (isBound(node, field)) node.setBoundVariable(field, null)
      writeNumber(node, field, wanted)
    },
    describe: () => ({
      actual: { value: readNumber(node, field), bound: boundNames(context, node, field) },
      expected: { value: wanted },
    }),
  }
}

// Paints ─────────────────────────────────────────────────────────────────────

/**
 * One solid paint: bound to a variable, or a literal color. A bound paint holds
 * the variable's binding and, as Figma stores it, its resolved color with the
 * alpha as the paint opacity; a paint Figma left with a stale color is an update.
 */
function paintCheck(
  context: ValueContext,
  node: SceneNodeLike,
  key: 'fills' | 'strokes',
  value: ComponentValue
): Check | null {
  const what = `${node.name}.${key}`
  const paints = () =>
    node[key].map(paint => ({
      type: paint.type,
      ...(paint.color ? { color: paint.color } : {}),
      opacity: paint.opacity ?? 1,
      ...(paint.visible === false ? { visible: false } : {}),
      ...(paint.boundVariables?.color
        ? { bound: nameOf(context, paint.boundVariables.color.id) }
        : {}),
    }))
  const single = () => {
    const paints = node[key]
    const paint = paints[0]
    return paints.length === 1 && paint.type === 'SOLID' && paint.visible !== false ? paint : null
  }
  if (isAlias(value)) {
    const variable = context.byToken.get(value.alias)
    const holds = () => {
      const paint = single()
      if (!paint || !variable || paint.boundVariables?.color?.id !== variable.id) return false
      const resolved = resolvedColor(context, node, variable)
      return !resolved || (sameColor(paint.color, resolved) && near(paint.opacity ?? 1, resolved.a))
    }
    const bind = (target: VariableLike) => {
      const paint = solid(resolvedColor(context, node, target))
      node[key] = [context.figma.variables.setBoundVariableForPaint(paint, 'color', target)]
    }
    return {
      what,
      same: holds,
      write: () => {
        if (!variable) return
        bind(variable)
        if (holds()) return
        // Rebinding the variable a paint already holds keeps Figma's stale stored
        // color; binding another variable first refreshes it. The unbound paint
        // before it is a second, unproven way to reset the binding.
        node[key] = [solid(resolvedColor(context, node, variable))]
        const other = [...context.byId.values()].find(
          item => item.resolvedType === 'COLOR' && item.id !== variable.id
        )
        if (other) bind(other)
        bind(variable)
      },
      describe: () => {
        const resolved = variable && resolvedColor(context, node, variable)
        return {
          actual: paints(),
          expected: {
            bound: variable?.name ?? `no variable for ${value.alias}`,
            ...(resolved ? { color: resolved } : {}),
          },
        }
      },
    }
  }
  const color = literal(value)
  if (!isColor(color)) return null
  return {
    what,
    same: () => {
      const paint = single()
      return (
        !!paint &&
        !paint.boundVariables?.color &&
        sameColor(paint.color, color) &&
        near(paint.opacity ?? 1, color.a)
      )
    },
    write: () => {
      node[key] = [solid(color)]
    },
    describe: () => ({ actual: paints(), expected: { color } }),
  }
}

// Fonts ──────────────────────────────────────────────────────────────────────

const styleOfWeight = (weight: unknown) =>
  ({ 400: 'Regular', 500: 'Medium', 600: 'Semi Bold', 700: 'Bold' })[Number(weight)] ?? 'Regular'

export interface FontTarget {
  font: FontNameLike
  family: VariableLike | null
  weight: VariableLike | null
  /** What did not hold, as text styles report it: a font that did not load, a family left unbound. */
  fallbacks: string[]
}

/**
 * The font a text layer should use, as text styles do: the first family of the
 * first-mode stack in the weight's style, else Inter Regular. The family
 * variable binds only when every mode's family loads, since Figma refuses to
 * bind one that does not.
 */
export async function fontTarget(
  context: ValueContext,
  node: SceneNodeLike,
  layer: LayerSpec
): Promise<FontTarget | null> {
  const { fontFamily, fontWeight } = layer.properties
  const usable = (value: ComponentValue | undefined) =>
    value && !('skipped' in value) ? value : undefined
  const family = usable(fontFamily)
  const weight = usable(fontWeight)
  if (!family && !weight) return null
  const familyVariable = family && 'alias' in family ? context.byToken.get(family.alias) : undefined
  const weightVariable = weight && 'alias' in weight ? context.byToken.get(weight.alias) : undefined
  const current = node.fontName ?? INTER
  const stack = familyVariable ? firstValue(context, familyVariable) : literal(family)
  const wanted = {
    family: typeof stack === 'string' ? firstFamily(stack) : current.family,
    style: weight
      ? styleOfWeight(weightVariable ? firstValue(context, weightVariable) : literal(weight))
      : current.style,
  }
  const alias = family && 'alias' in family ? family.alias : undefined
  const fallbacks: string[] = []
  if (!(await loads(context, wanted))) {
    fallbacks.push(
      `${layer.name}: ${wanted.family} ${wanted.style} did not load; used Inter Regular`
    )
    if (alias) fallbacks.push(`${layer.name}: ${alias} not bound; used Inter`)
    return { font: INTER, family: null, weight: null, fallbacks }
  }
  let bind: VariableLike | null = null
  if (familyVariable) {
    const families = familiesOf(familyVariable, context.byId)
    const loaded = await Promise.all(
      families.map(item => loads(context, { family: item, style: wanted.style }))
    )
    if (families.length > 0 && loaded.every(Boolean)) bind = familyVariable
    else fallbacks.push(`${layer.name}: ${alias} not bound in every mode; used ${wanted.family}`)
  }
  return { font: wanted, family: bind, weight: weightVariable ?? null, fallbacks }
}

function fontCheck(context: ValueContext, node: SceneNodeLike, target: FontTarget): Check {
  /** Bound to the variable on every range, or unbound when there is none. */
  const holds = (field: 'fontFamily' | 'fontWeight', variable: VariableLike | null) =>
    variable ? boundTo(node, field, variable.id) : !isBound(node, field)
  return {
    what: `${node.name}.fontName`,
    same: () =>
      node.fontName?.family === target.font.family &&
      node.fontName.style === target.font.style &&
      holds('fontFamily', target.family) &&
      holds('fontWeight', target.weight),
    write: () => {
      node.fontName = { ...target.font }
      for (const [field, variable] of [
        ['fontFamily', target.family],
        ['fontWeight', target.weight],
      ] as const)
        if (variable || isBound(node, field)) node.setBoundVariable(field, variable)
    },
    describe: () => ({
      actual: {
        font: node.fontName,
        family: boundNames(context, node, 'fontFamily'),
        weight: boundNames(context, node, 'fontWeight'),
      },
      expected: {
        font: target.font,
        family: target.family?.name ?? null,
        weight: target.weight?.name ?? null,
      },
    }),
  }
}

// A layer ────────────────────────────────────────────────────────────────────

/**
 * Every check for one layer, in write order. `Icon.visible` belongs to the Icon
 * boolean property; an outline layer's offset is geometry (sync-component).
 */
export function layerChecks(
  context: ValueContext,
  node: SceneNodeLike,
  layer: LayerSpec,
  font: FontTarget | null
): Check[] {
  const checks: (Check | null)[] = []
  if (font) checks.push(fontCheck(context, node, font))
  for (const [property, value] of Object.entries(layer.properties) as [
    FigmaProperty,
    ComponentValue,
  ][]) {
    if (!value || 'skipped' in value) continue
    if (property === 'fill') checks.push(paintCheck(context, node, 'fills', value))
    else if (property === 'stroke') checks.push(paintCheck(context, node, 'strokes', value))
    else if (property === 'visible') {
      if (layer.name !== 'Icon') checks.push(fieldCheck(context, node, 'visible', value))
    } else
      for (const field of numberFields[property] ?? [])
        checks.push(fieldCheck(context, node, field, value))
  }
  return checks.filter((check): check is Check => check !== null)
}
