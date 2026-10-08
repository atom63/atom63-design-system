/**
 * Reads a component recipe (contract + recipe CSS + the token sync model) into a
 * ComponentModel: one spec per Variant × Size × State, each layer's properties bound
 * to the synced token the recipe resolves to (C4, C5). Pure: no Node or DOM APIs.
 */

import { evaluateNumber } from '../css-model'
import type { SyncModel, SyncVariable } from '../plan'
import type { buttonAnatomy } from './button-anatomy'
import { readRules } from './css-rules'
import type { ComponentModel, ComponentValue, FigmaProperty, LayerSpec, VariantSpec } from './model'

export interface RecipeInput {
  css: string
  contract: {
    variants: readonly string[]
    sizes: readonly string[]
    states: readonly string[]
    defaultVariant: string
    defaultSize: string
  }
  anatomy: typeof buttonAnatomy
  sync: SyncModel
  /** C2: sizes outside this list go to `skipped`. */
  sizes: readonly string[]
}

export interface Coordinate {
  variant?: string
  size?: string
  /** `[data-size^='…']`: matches sizes starting with this prefix. */
  sizePrefix?: string
  state?: string
  layer: 'root' | 'Label'
}

type Declarations = Record<string, string>
type Skip = { what: string; reason: string }
type TokenIndex = Map<string, { variable: SyncVariable; mode: string }>

const TRANSPARENT = { r: 0, g: 0, b: 0, a: 0 }
const STATE_OF: Record<string, string> = {
  ':hover': 'hover',
  ':active': 'pressed',
  '[data-pressed]': 'pressed',
  ':focus-visible': 'focusVisible',
  ':disabled': 'disabled',
  '[data-disabled]': 'disabled',
  '[data-loading]': 'loading',
}

/** Index of the `)` closing the `(` at `open`. */
function closing(text: string, open: number): number {
  let depth = 0
  for (let index = open; index < text.length; index++) {
    if (text[index] === '(') depth++
    else if (text[index] === ')' && --depth === 0) return index
  }
  return text.length - 1
}

function splitTopLevel(text: string, separator: ',' | ' '): string[] {
  const parts: string[] = []
  let depth = 0
  let start = 0
  for (let index = 0; index < text.length; index++) {
    const char = text[index]
    if (char === '(') depth++
    else if (char === ')') depth--
    else if (depth === 0 && (separator === ' ' ? /\s/.test(char) : char === separator)) {
      parts.push(text.slice(start, index))
      start = index + 1
    }
  }
  parts.push(text.slice(start))
  return parts.map(part => part.trim()).filter(Boolean)
}

/** `:where(X)` → X, dropping any `:not(…)` inside it (it only guards disabled hover). */
function unwrapWhere(selector: string): string {
  let text = selector
  for (let start = text.indexOf(':where('); start !== -1; start = text.indexOf(':where(')) {
    const end = closing(text, start + 6)
    let inner = text.slice(start + 7, end)
    for (let not = inner.indexOf(':not('); not !== -1; not = inner.indexOf(':not('))
      inner = inner.slice(0, not) + inner.slice(closing(inner, not + 4) + 1)
    text = text.slice(0, start) + inner + text.slice(end + 1)
  }
  return text
}

/** Where a root selector applies: its variant / size / state and the layer it styles. */
export function coordinateOf(selector: string, rootClass: string): Coordinate | { skip: string } {
  if (selector.includes('::')) return { skip: 'pseudo-element' }
  const rest = unwrapWhere(selector.slice(rootClass.length)).replace(/\s*>\s*/g, ' ')
  const space = rest.search(/\s/)
  const compound = space === -1 ? rest : rest.slice(0, space)
  const descendant = space === -1 ? '' : rest.slice(space).trim()
  const coordinate: Coordinate = { layer: 'root' }
  if (descendant) {
    if (descendant !== `${rootClass}-label`) return { skip: 'descendant' }
    coordinate.layer = 'Label'
  }
  const part = /\[data-(variant|size)(\^?)='([^']+)'\]|\[data-[a-z]+\]|:[a-z-]+/y
  for (let match = part.exec(compound); match; match = part.exec(compound)) {
    if (match[1] === 'variant') coordinate.variant = match[3]
    else if (match[1] === 'size') coordinate[match[2] ? 'sizePrefix' : 'size'] = match[3]
    else if (STATE_OF[match[0]]) coordinate.state = STATE_OF[match[0]]
    else return { skip: `unsupported selector part ${match[0]}` }
    if (part.lastIndex === compound.length) return coordinate
  }
  return compound ? { skip: 'unsupported selector' } : coordinate
}

/** Cascade order (C5): base, variant, size, state, variant+state, size+state. */
const rankOf = (c: Coordinate) =>
  (c.state ? 4 : 0) + (c.variant ? 1 : 0) + (c.size || c.sizePrefix ? 2 : 0)

const matches = (c: Coordinate, variant: string, size: string, state: string) =>
  (c.variant === undefined || c.variant === variant) &&
  (c.size === undefined || c.size === size) &&
  (c.sizePrefix === undefined || size.startsWith(c.sizePrefix)) &&
  (c.state === undefined || c.state === state)

/** `border: <width> <style> <color>` → `border-width` + `border-color`. */
function expandBorder(selector: string, declarations: Declarations, skip: (s: Skip) => void) {
  const out: Declarations = {}
  for (const [property, value] of Object.entries(declarations)) {
    if (property !== 'border') {
      out[property] = value
      continue
    }
    const parts = splitTopLevel(value, ' ')
    if (parts.length === 3) {
      out['border-width'] = parts[0]
      out['border-color'] = parts[2]
    } else
      skip({
        what: `${selector} border: ${value}`,
        reason: 'only `border: <width> <style> <color>` is read',
      })
  }
  return out
}

const indexes = new WeakMap<SyncModel, TokenIndex>()
function indexOf(sync: SyncModel): TokenIndex {
  let index = indexes.get(sync)
  if (!index) {
    index = new Map()
    for (const collection of sync.collections)
      for (const variable of collection.variables)
        index.set(variable.token, { variable, mode: collection.modes[0] })
    indexes.set(sync, index)
  }
  return index
}

/** A token's number in the first mode of its collection, following aliases. */
function defaultNumber(token: string, index: TokenIndex, depth = 0): number | null {
  const entry = index.get(token)
  const value = entry?.variable.values[entry.mode]
  if (!value || depth > 16) return null
  if ('alias' in value) return defaultNumber(value.alias, index, depth + 1)
  return 'value' in value && typeof value.value === 'number' ? value.value : null
}

function parseVar(text: string): { name: string; fallback?: string } | null {
  if (!text.startsWith('var(') || closing(text, 3) !== text.length - 1) return null
  const [name, ...fallback] = splitTopLevel(text.slice(4, -1), ',')
  return fallback.length ? { name, fallback: fallback.join(', ') } : { name }
}

interface Context {
  declarations: Declarations
  index: TokenIndex
}

/** A number for `calc()` / `max()` / `min()`, or why there is none. */
function toNumber(expression: string, context: Context, seen: Set<string>): number | string {
  let text = expression
  for (let start = text.indexOf('var('); start !== -1; start = text.indexOf('var(')) {
    const end = closing(text, start + 3)
    const ref = parseVar(text.slice(start, end + 1))
    if (!ref) return `cannot read ${text.slice(start, end + 1)}`
    const { declarations, index } = context
    let number: number | string = `var(${ref.name}) has no number`
    if (index.has(ref.name)) number = defaultNumber(ref.name, index) ?? number
    else if (ref.name in declarations && !seen.has(ref.name))
      number = toNumber(declarations[ref.name], context, new Set(seen).add(ref.name))
    else if (ref.fallback !== undefined) number = toNumber(ref.fallback, context, seen)
    if (typeof number === 'string') return number
    text = text.slice(0, start) + String(number) + text.slice(end + 1)
  }
  for (;;) {
    const start = Math.max(text.lastIndexOf('max('), text.lastIndexOf('min('))
    if (start === -1) break
    const end = closing(text, start + 3)
    const args = splitTopLevel(text.slice(start + 4, end), ',').map(evaluateNumber)
    if (!args.length || args.some(arg => arg === null)) return `cannot evaluate ${expression}`
    const reduce = text.startsWith('max', start) ? Math.max : Math.min
    text = text.slice(0, start) + String(reduce(...(args as number[]))) + text.slice(end + 1)
  }
  const number = evaluateNumber(text)
  return number === null ? `cannot evaluate ${expression}` : Math.round(number * 10_000) / 10_000
}

function resolveExpression(
  expression: string,
  context: Context,
  seen: Set<string>,
  onLiteral: (expression: string) => void
): ComponentValue {
  const value = expression.trim()
  if (value === 'transparent') return { value: TRANSPARENT }
  if (/(^|[^\w-])(calc|max|min)\(/.test(value)) {
    const number = toNumber(value, context, seen)
    if (typeof number === 'string') return { skipped: number }
    onLiteral(value)
    return { value: number }
  }
  const ref = parseVar(value)
  if (ref) {
    if (context.index.has(ref.name)) return { alias: ref.name }
    if (ref.name in context.declarations && !seen.has(ref.name))
      return resolveExpression(
        context.declarations[ref.name],
        context,
        new Set(seen).add(ref.name),
        onLiteral
      )
    if (ref.fallback !== undefined) return resolveExpression(ref.fallback, context, seen, onLiteral)
    return { skipped: `var(${ref.name}) is not a synced token` }
  }
  const mix = /^color-mix\(\s*in oklch\s*,\s*(.+?)\s+(\d+(?:\.\d+)?)%\s*,\s*transparent\s*\)$/.exec(
    value
  )
  if (mix) {
    const inner = resolveExpression(mix[1], context, seen, onLiteral)
    if ('alias' in inner) return { composed: { alias: inner.alias, opacity: Number(mix[2]) } }
    return { skipped: `color-mix of ${mix[1]}, which is not a synced token` }
  }
  return { skipped: `unsupported value ${value}` }
}

/** Resolve a CSS property or custom property in the effective declarations (C4). */
export function resolve(
  name: string,
  declarations: Declarations,
  sync: SyncModel,
  onLiteral: (expression: string) => void = () => {}
): ComponentValue | 'unset' {
  const context = { declarations, index: indexOf(sync) }
  if (name.startsWith('--')) {
    if (!(name in declarations) && !context.index.has(name)) return 'unset'
    return resolveExpression(`var(${name})`, context, new Set(), onLiteral)
  }
  const expression = declarations[name]
  return expression === undefined
    ? 'unset'
    : resolveExpression(expression, context, new Set(), onLiteral)
}

export function readRecipe(input: RecipeInput): ComponentModel {
  const { anatomy, contract, sync } = input
  const skippedByKey = new Map<string, Skip>()
  const skip = (entry: Skip) => skippedByKey.set(`${entry.what}\n${entry.reason}`, entry)
  const sizes = contract.sizes.filter(size => input.sizes.includes(size))
  for (const size of contract.sizes)
    if (!sizes.includes(size)) skip({ what: `Size=${size}`, reason: 'not in this plan (C2)' })

  const root = anatomy.rootClass
  const mentionsRoot = new RegExp(`${root.replace(/[.-]/g, '\\$&')}(?![\\w-])`)
  const entries: { coordinate: Coordinate; declarations: Declarations; order: number }[] = []
  for (const rule of readRules(input.css))
    for (const selector of rule.selectors) {
      if (!mentionsRoot.test(selector)) continue
      if (!selector.startsWith(root) || /[\w-]/.test(selector[root.length] ?? '')) {
        skip({ what: selector, reason: 'context selector' })
        continue
      }
      const coordinate = coordinateOf(selector, root)
      if ('skip' in coordinate) skip({ what: selector, reason: coordinate.skip })
      else
        entries.push({
          coordinate,
          declarations: expandBorder(selector, rule.declarations, skip),
          order: entries.length,
        })
    }
  entries.sort((a, b) => rankOf(a.coordinate) - rankOf(b.coordinate) || a.order - b.order)

  const tokens = new Set<string>()
  const literals: ComponentModel['literals'] = []
  const variants: VariantSpec[] = []
  for (const variant of contract.variants)
    for (const size of sizes)
      for (const state of contract.states) {
        const name = `Variant=${variant}, Size=${size}, State=${state}`
        const fold = (layer: Coordinate['layer']) =>
          Object.assign(
            {},
            ...entries
              .filter(
                e => e.coordinate.layer === layer && matches(e.coordinate, variant, size, state)
              )
              .map(e => e.declarations)
          ) as Declarations
        const rootDeclarations = fold('root')
        const labelDeclarations = { ...rootDeclarations, ...fold('Label') }
        const layers = anatomy.layers.map((layer): LayerSpec => {
          const declarations = layer.name === 'Label' ? labelDeclarations : rootDeclarations
          const properties: LayerSpec['properties'] = {}
          for (const [property, read] of Object.entries(layer.reads) as [FigmaProperty, string][]) {
            const value = resolve(read, declarations, sync, expression =>
              literals.push({ variant: name, layer: layer.name, property, expression })
            )
            if (value === 'unset') continue
            properties[property] = value
            if ('alias' in value) tokens.add(value.alias)
            if ('composed' in value) tokens.add(value.composed.alias)
          }
          for (const [property, fixed] of Object.entries(layer.byState?.[state] ?? {}) as [
            FigmaProperty,
            number | boolean,
          ][]) {
            properties[property] = { value: fixed }
            const declared = declarations[property]
            if (
              typeof fixed === 'number' &&
              declared !== undefined &&
              evaluateNumber(declared) !== fixed
            )
              skip({
                what: `${layer.name} ${property} in State=${state}`,
                reason: `the anatomy says ${fixed}, the recipe says ${declared}`,
              })
          }
          return { name: layer.name, kind: layer.kind, properties }
        })
        variants.push({ name, coord: { variant, size, state }, layers })
      }

  return {
    schemaVersion: 1,
    component: anatomy.component,
    page: 'Components',
    axes: { Variant: [...contract.variants], Size: sizes, State: [...contract.states] },
    defaults: { Variant: contract.defaultVariant, Size: contract.defaultSize, State: 'rest' },
    label: anatomy.component,
    variants,
    tokens: [...tokens].sort(),
    literals,
    skipped: [...skippedByKey.values()],
  }
}
