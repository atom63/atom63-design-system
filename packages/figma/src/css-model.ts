/**
 * Project mode: builds a sync model from a project's own token CSS, so a site
 * started from the Atom63 site template (Tailwind, shadcn/ui, tokens as plain
 * CSS) gets its tokens as Figma variables. Code stays the source of truth; the
 * same plan and apply code as Atom63 mode writes the model.
 *
 * The CSS is read statically. It supports what a token file needs:
 * - custom properties under `:root`, `.light`, `.dark`, `[data-<axis>='<value>']`
 *   and `[data-<axis>]` (every value of that axis), in any combination of
 *   comma-separated selectors;
 * - `@media (min-width: …)` blocks, read at the widest viewport;
 * - Tailwind's `@theme` (emitted variables) and `@theme inline` (utility wiring,
 *   not synced when it only points at another variable).
 *
 * Each `data-<axis>` attribute becomes a collection whose modes are its values,
 * the `dark` class becomes the Mode collection, and everything else lands in
 * Base. A variable goes where its value varies: `var(--x)` becomes an alias and
 * `color-mix(… var(--x) N%, transparent)` a composed color, which both follow
 * their target across every axis; any other value is evaluated per mode, so it
 * must vary on one axis at most. What Figma cannot hold is reported as skipped.
 */
import type { SyncColor, SyncModel, SyncValue, SyncVariable, SyncVariableType } from './plan'

/** Turns a CSS color with no var() left in it into sRGB channels, or null. */
export type ColorResolver = (expression: string) => SyncColor | null

export interface CssFile {
  name: string
  text: string
}

export interface TokenSource {
  file: string
  selector: string
  expression: string
}

export interface ProjectModel {
  model: SyncModel
  /** Where each variable's value comes from, per token and mode, for the change list. */
  sources: Record<string, Record<string, TokenSource>>
  /** The effective `:root` expression of each skipped token, for styles. */
  raw: Record<string, string>
  notes: string[]
}

export const BASE_COLLECTION = 'Base'
export const MODE_COLLECTION = 'Mode'
const BASE_MODE = 'Value'
const MODE_AXIS = 'mode'

// ── Parsing ──────────────────────────────────────────────────────────────────

interface Scope {
  /** The axis the selector sets, or null for :root and @theme. */
  axis: string | null
  /** The axis value, or '*' for every value of the axis. */
  value: string
}

interface Declaration {
  token: string
  expression: string
  scope: Scope
  selector: string
  file: string
  /** Source order; @theme declarations sit in a lower cascade layer. */
  order: number
  themeLayer: boolean
  /** The block is `@theme inline`. */
  inline: boolean
  media: boolean
}

const ATTRIBUTE_SELECTOR = /^\[data-([\w-]+)(?:=(['"]?)([^'"\]]+)\2)?\]$/

function stripComments(text: string): string {
  return text.replace(/\/\*[\s\S]*?\*\//g, '')
}

/** Splits on a separator outside parentheses and brackets. */
function splitTopLevel(text: string, separator: string): string[] {
  const parts: string[] = []
  let depth = 0
  let start = 0
  for (let index = 0; index < text.length; index++) {
    const char = text[index]
    if (char === '(' || char === '[') depth++
    else if (char === ')' || char === ']') depth--
    else if (char === separator && depth === 0) {
      parts.push(text.slice(start, index))
      start = index + 1
    }
  }
  parts.push(text.slice(start))
  return parts.map(part => part.trim()).filter(Boolean)
}

function scopeOf(selector: string): Scope | null {
  if (selector === ':root') return { axis: null, value: '*' }
  if (selector === '.light') return { axis: MODE_AXIS, value: 'light' }
  if (selector === '.dark') return { axis: MODE_AXIS, value: 'dark' }
  const match = ATTRIBUTE_SELECTOR.exec(selector)
  if (match) return { axis: match[1], value: match[3] ?? '*' }
  return null
}

interface Block {
  prelude: string
  body: string
}

/** The top-level `prelude { body }` blocks of a stylesheet or block body. */
function blocks(text: string): Block[] {
  const found: Block[] = []
  let index = 0
  while (index < text.length) {
    const open = text.indexOf('{', index)
    if (open < 0) break
    let depth = 1
    let close = open + 1
    while (close < text.length && depth > 0) {
      if (text[close] === '{') depth++
      else if (text[close] === '}') depth--
      close++
    }
    const prelude = text.slice(index, open)
    // A statement at-rule (`@import …;`) before the block is not part of its prelude.
    found.push({
      prelude: prelude.slice(prelude.lastIndexOf(';') + 1).trim(),
      body: text.slice(open + 1, close - 1),
    })
    index = close
  }
  return found
}

/** The custom property declarations directly in a block body, not in nested blocks. */
function declarations(body: string): [string, string][] {
  let flat = ''
  let depth = 0
  for (const char of body) {
    if (char === '{') depth++
    if (depth === 0) flat += char
    if (char === '}') depth--
  }
  return splitTopLevel(flat, ';')
    .map(item => /^(--[\w-]+)\s*:\s*([\s\S]+)$/.exec(item))
    .filter((match): match is RegExpExecArray => match !== null)
    .map(match => [match[1], match[2].replace(/\s+/g, ' ').trim()])
}

function parse(files: CssFile[]): Declaration[] {
  const found: Declaration[] = []
  let order = 0
  const visit = (
    body: string,
    file: string,
    context: { media: boolean; theme: boolean; inline: boolean }
  ) => {
    for (const block of blocks(body)) {
      if (block.prelude.startsWith('@media')) {
        visit(block.body, file, { ...context, media: true })
        continue
      }
      if (block.prelude.startsWith('@theme')) {
        const inline = /\binline\b/.test(block.prelude)
        for (const [token, expression] of declarations(block.body)) {
          found.push({
            token,
            expression,
            scope: { axis: null, value: '*' },
            selector: block.prelude,
            file,
            order: order++,
            themeLayer: true,
            inline,
            media: context.media,
          })
        }
        continue
      }
      if (block.prelude.startsWith('@')) continue
      const scopes = splitTopLevel(block.prelude, ',').map(scopeOf)
      if (scopes.some(scope => scope === null)) continue
      for (const [token, expression] of declarations(block.body)) {
        for (const scope of scopes as Scope[]) {
          found.push({
            token,
            expression,
            scope,
            selector: block.prelude.replace(/\s+/g, ' '),
            file,
            order: order++,
            themeLayer: false,
            inline: false,
            media: context.media,
          })
        }
      }
    }
  }
  for (const file of files)
    visit(stripComments(file.text), file.name, { media: false, theme: false, inline: false })
  return found
}

// ── Axes ─────────────────────────────────────────────────────────────────────

interface Axis {
  name: string
  values: string[]
  /** The value that also matches :root. */
  default: string
}

function axesOf(files: CssFile[], found: Declaration[]): Axis[] {
  const values = new Map<string, string[]>()
  const defaults = new Map<string, string>()
  for (const file of files) {
    for (const block of blocks(stripComments(file.text))) {
      const selectors = splitTopLevel(block.prelude, ',')
      const scopes = selectors.map(scopeOf)
      for (const scope of scopes) {
        if (!scope?.axis || scope.axis === MODE_AXIS || scope.value === '*') continue
        const list = values.get(scope.axis) ?? []
        if (!list.includes(scope.value)) list.push(scope.value)
        values.set(scope.axis, list)
        if (selectors.includes(':root') && !defaults.has(scope.axis))
          defaults.set(scope.axis, scope.value)
      }
    }
  }
  // An axis only counts when a declaration uses it (a @media wrapper does not).
  const used = new Set(
    found.map(item => item.scope.axis).filter(axis => axis && axis !== MODE_AXIS)
  )
  return [...values]
    .filter(([name]) => used.has(name))
    .map(([name, list]) => {
      const fallback = defaults.get(name) ?? list[0]
      return {
        name,
        values: [fallback, ...list.filter(value => value !== fallback)],
        default: fallback,
      }
    })
}

type Context = Record<string, string>

// ── Values ───────────────────────────────────────────────────────────────────

const VAR_ONLY = /^var\(\s*(--[\w-]+)\s*(?:,[\s\S]*)?\)$/
const COMPOSED =
  /^color-mix\(\s*in\s+[\w-]+\s*,\s*(?:var\(\s*(--[\w-]+)\s*\)\s*(\d+(?:\.\d+)?)?%?\s*,\s*transparent\s*(\d+(?:\.\d+)?)?%?|transparent\s*(\d+(?:\.\d+)?)?%?\s*,\s*var\(\s*(--[\w-]+)\s*\)\s*(\d+(?:\.\d+)?)?%?)\s*\)$/

function composedOf(expression: string): { alias: string; opacity: number } | null {
  const match = COMPOSED.exec(expression)
  if (!match) return null
  const [
    ,
    colorFirst,
    colorWeight,
    transparentWeight,
    transparentFirstWeight,
    colorLast,
    colorLastWeight,
  ] = match
  const alias = colorFirst ?? colorLast
  const own = colorFirst ? colorWeight : colorLastWeight
  const other = colorFirst ? transparentWeight : transparentFirstWeight
  const opacity = own !== undefined ? Number(own) : other !== undefined ? 100 - Number(other) : 50
  return { alias, opacity }
}

/** Evaluates a length or number: `12px`, `1.5`, `calc(10px * 0.8 * 1)`. Units: px, rem (16px). */
export function evaluateNumber(expression: string): number | null {
  const source = expression.trim()
  let index = 0
  const peek = () => source[index]
  const skip = () => {
    while (/\s/.test(peek() ?? '')) index++
  }
  const primary = (): number | null => {
    skip()
    if (source.startsWith('calc(', index)) {
      index += 5
      const value = sum()
      skip()
      if (peek() !== ')') return null
      index++
      return value
    }
    if (peek() === '(') {
      index++
      const value = sum()
      skip()
      if (peek() !== ')') return null
      index++
      return value
    }
    const match = /^-?\d*\.?\d+(?:e-?\d+)?(px|rem)?/.exec(source.slice(index))
    if (!match) return null
    index += match[0].length
    const number = Number.parseFloat(match[0])
    return match[1] === 'rem' ? number * 16 : number
  }
  const product = (): number | null => {
    let left = primary()
    for (;;) {
      skip()
      const operator = peek()
      if (left === null || (operator !== '*' && operator !== '/')) return left
      index++
      const right = primary()
      if (right === null) return null
      left = operator === '*' ? left * right : left / right
    }
  }
  const sum = (): number | null => {
    let left = product()
    for (;;) {
      skip()
      const operator = peek()
      if (left === null || (operator !== '+' && operator !== '-')) return left
      index++
      const right = product()
      if (right === null) return null
      left = operator === '+' ? left + right : left - right
    }
  }
  const value = sum()
  skip()
  return value !== null && index === source.length ? value : null
}

/** A pure color reader for the literal forms token files use: rgb(a), hex, and keywords. */
export const parseColor: ColorResolver = expression => {
  const value = expression.trim().toLowerCase()
  if (value === 'transparent') return { r: 0, g: 0, b: 0, a: 0 }
  if (value === 'white') return { r: 1, g: 1, b: 1, a: 1 }
  if (value === 'black') return { r: 0, g: 0, b: 0, a: 1 }
  const hex = /^#([\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/.exec(value)
  if (hex) {
    let digits = hex[1]
    if (digits.length <= 4) digits = [...digits].map(char => char + char).join('')
    const channel = (offset: number) => Number.parseInt(digits.slice(offset, offset + 2), 16) / 255
    return { r: channel(0), g: channel(2), b: channel(4), a: digits.length === 8 ? channel(6) : 1 }
  }
  const rgb = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:\s*[,/]\s*([\d.]+%?))?\s*\)$/.exec(
    value
  )
  if (rgb) {
    const alpha =
      rgb[4] === undefined
        ? 1
        : rgb[4].endsWith('%')
          ? Number.parseFloat(rgb[4]) / 100
          : Number(rgb[4])
    return { r: Number(rgb[1]) / 255, g: Number(rgb[2]) / 255, b: Number(rgb[3]) / 255, a: alpha }
  }
  return null
}

// ── Model ────────────────────────────────────────────────────────────────────

const SCALE_FAMILIES = ['color', 'surface', 'brand', 'radius', 'text', 'chart']
const RADIUS_STEP = /^radius(-(2xs|xs|sm|md|lg|xl|\dxl|full))?$/

/** Figma variable name: scale families get groups (`color/b1/500`), roles stay flat (`muted-foreground`). */
export function variableName(token: string): string {
  const name = token.replace(/^--/, '')
  // A family root (`--radius`) would share its name with the group (`radius/lg`).
  if (SCALE_FAMILIES.includes(name)) return `${name}/base`
  return SCALE_FAMILIES.some(family => name.startsWith(`${family}-`))
    ? name.replaceAll('-', '/')
    : name
}

function collectionName(axis: string | null): string {
  if (axis === null) return BASE_COLLECTION
  if (axis === MODE_AXIS) return MODE_COLLECTION
  const words = axis.split('-').join(' ')
  return words[0].toUpperCase() + words.slice(1)
}

/** Picker visibility: raw ramps and axis multipliers are hidden; scales go to their own pickers. */
function scopesFor(token: string, type: SyncVariableType): string[] {
  const name = token.replace(/^--/, '')
  if (/^(color|surface)-/.test(name)) return []
  if (RADIUS_STEP.test(name)) return ['CORNER_RADIUS']
  if (/^text-.+-size$/.test(name)) return ['FONT_SIZE']
  if (/^text-.+-leading$/.test(name)) return ['LINE_HEIGHT']
  if (type === 'FLOAT') return []
  return ['ALL_SCOPES']
}

export function buildProjectModel(
  files: CssFile[],
  resolveColor: ColorResolver = parseColor
): ProjectModel {
  const all = parse(files)
  const axes = axesOf(files, all)
  const modeAxis: Axis = { name: MODE_AXIS, values: ['light', 'dark'], default: 'light' }
  const axisList = all.some(item => item.scope.axis === MODE_AXIS) ? [...axes, modeAxis] : axes
  const defaults: Context = Object.fromEntries(axisList.map(axis => [axis.name, axis.default]))

  // Inline @theme entries that only point at another variable are Tailwind wiring.
  const synced = all.filter(item => !(item.inline && VAR_ONLY.test(item.expression)))
  const byToken = new Map<string, Declaration[]>()
  for (const item of all) {
    if (item.inline) continue
    const list = byToken.get(item.token) ?? []
    list.push(item)
    byToken.set(item.token, list)
  }
  const tokens = [...new Set(synced.map(item => item.token))]

  /** The declaration that wins on <html> for a context: unlayered over @theme, then source order. */
  const effective = (token: string, context: Context): Declaration | null => {
    const candidates = (byToken.get(token) ?? []).filter(
      item =>
        item.scope.axis === null ||
        item.scope.value === '*' ||
        context[item.scope.axis] === item.scope.value
    )
    if (candidates.length === 0) return null
    return candidates.reduce((best, item) =>
      Number(item.themeLayer) < Number(best.themeLayer) ||
      (item.themeLayer === best.themeLayer && item.order > best.order)
        ? item
        : best
    )
  }

  /** Replaces every var() with its value for the context, recursively. */
  const substitute = (expression: string, context: Context, seen: Set<string>): string | null => {
    let result = ''
    let index = 0
    while (index < expression.length) {
      const start = expression.indexOf('var(', index)
      if (start < 0) {
        result += expression.slice(index)
        break
      }
      result += expression.slice(index, start)
      let depth = 1
      let end = start + 4
      while (end < expression.length && depth > 0) {
        if (expression[end] === '(') depth++
        else if (expression[end] === ')') depth--
        end++
      }
      const [name, ...fallback] = splitTopLevel(expression.slice(start + 4, end - 1), ',')
      const declaration = seen.has(name) ? null : effective(name, context)
      const replacement = declaration
        ? substitute(declaration.expression, context, new Set([...seen, name]))
        : fallback.length > 0
          ? substitute(fallback.join(','), context, seen)
          : null
      if (replacement === null) return null
      result += replacement
      index = end
    }
    return result
  }

  /** The axes a token's value varies on: its own declarations, plus its references unless it is an alias. */
  const axesMemo = new Map<string, Set<string>>()
  const variesOn = (token: string, seen = new Set<string>()): Set<string> => {
    const cached = axesMemo.get(token)
    if (cached) return cached
    const result = new Set<string>()
    for (const item of byToken.get(token) ?? []) {
      if (item.scope.axis) result.add(item.scope.axis)
      if (VAR_ONLY.test(item.expression) || composedOf(item.expression)) continue
      for (const [, reference] of item.expression.matchAll(/var\(\s*(--[\w-]+)/g)) {
        if (seen.has(reference)) continue
        for (const axis of variesOn(reference, new Set([...seen, token]))) result.add(axis)
      }
    }
    axesMemo.set(token, result)
    return result
  }

  const skipped: SyncModel['skipped'] = []
  const sources: ProjectModel['sources'] = {}
  const raw: ProjectModel['raw'] = {}
  const remember = (token: string) => {
    const declaration = effective(token, defaults)
    if (declaration) raw[token] = declaration.expression
  }
  const variablesByCollection = new Map<string, SyncVariable[]>()
  const syncedTokens = new Set(tokens)

  type Evaluated = { type: SyncVariableType; value: SyncValue } | { reason: string }
  const evaluate = (token: string, context: Context): Evaluated => {
    const declaration = effective(token, context)
    if (!declaration) return { reason: 'no value for this mode' }
    const alias = VAR_ONLY.exec(declaration.expression)?.[1]
    if (alias && syncedTokens.has(alias)) return { type: 'COLOR', value: { alias } }
    const composed = composedOf(declaration.expression)
    if (composed && syncedTokens.has(composed.alias)) return { type: 'COLOR', value: { composed } }
    const literal = substitute(declaration.expression, context, new Set([token]))
    if (literal === null) return { reason: 'refers to a variable that is not defined' }
    const number = evaluateNumber(literal)
    if (number !== null)
      return { type: 'FLOAT', value: { value: Math.round(number * 10_000) / 10_000 } }
    const color = resolveColor(literal)
    if (color) return { type: 'COLOR', value: { value: color } }
    if (/^(oklch|oklab|lab|lch|hsla?|hwb|color|color-mix)\(/.test(literal))
      return { reason: 'a color that could not be computed here' }
    return {
      reason: /\d(px|rem)?\s+-?\d/.test(literal)
        ? 'a shadow or other compound value; Figma variables hold one color or number (use an effect style)'
        : 'not a color or a number, which Figma variables need',
    }
  }

  // Aliases take their target's type; resolve them after the literals.
  const typeOf = new Map<string, SyncVariableType>()

  for (const token of tokens) {
    const axisNames = [...variesOn(token)]
    if (axisNames.length > 1) {
      skipped.push({
        token,
        reason: `varies on more than one axis (${axisNames.join(', ')}); Figma holds one per collection`,
      })
      remember(token)
      continue
    }
    const axis = axisList.find(item => item.name === axisNames[0]) ?? null
    const modes = axis ? axis.values : [BASE_MODE]
    const values: Record<string, SyncValue> = {}
    let type: SyncVariableType | null = null
    let failure: string | null = null
    for (const mode of modes) {
      const context = axis ? { ...defaults, [axis.name]: mode } : defaults
      const result = evaluate(token, context)
      if ('reason' in result) {
        failure = result.reason
        break
      }
      values[mode] = result.value
      if ('value' in result.value) type = result.type
      const declaration = effective(token, context)
      if (declaration) {
        sources[token] ??= {}
        sources[token][mode] = {
          file: declaration.file,
          selector: declaration.selector,
          expression: declaration.expression,
        }
      }
    }
    if (failure) {
      skipped.push({ token, reason: failure })
      remember(token)
      continue
    }
    if (type) typeOf.set(token, type)
    const collection = collectionName(axis?.name ?? null)
    const list = variablesByCollection.get(collection) ?? []
    list.push({ name: variableName(token), token, type: type ?? 'COLOR', values })
    variablesByCollection.set(collection, list)
  }

  // A token that points at one the model could not hold cannot be written
  // either; drop it too, until every alias target is in the model.
  const aliasTarget = (value: SyncValue) =>
    'alias' in value ? value.alias : 'composed' in value ? value.composed.alias : null
  for (let changed = true; changed;) {
    changed = false
    const present = new Set([...variablesByCollection.values()].flat().map(item => item.token))
    for (const [collection, list] of variablesByCollection) {
      const kept = list.filter(variable => {
        const missing = Object.values(variable.values)
          .map(aliasTarget)
          .find(target => target !== null && !present.has(target))
        if (!missing) return true
        skipped.push({ token: variable.token, reason: `points at ${missing}, which is not synced` })
        remember(variable.token)
        changed = true
        return false
      })
      variablesByCollection.set(collection, kept)
    }
  }

  // An alias's type is its target's; a chain of aliases resolves in a few passes.
  const allVariables = [...variablesByCollection.values()].flat()
  const targetOf = (variable: SyncVariable) =>
    Object.values(variable.values)
      .map(value =>
        'alias' in value ? value.alias : 'composed' in value ? value.composed.alias : null
      )
      .find(Boolean) ?? null
  for (let pass = 0; pass < 8; pass++) {
    for (const variable of allVariables) {
      if (typeOf.has(variable.token)) continue
      const target = targetOf(variable)
      const targetType = target ? typeOf.get(target) : undefined
      if (targetType) typeOf.set(variable.token, targetType)
    }
  }

  const collections: SyncModel['collections'] = []
  const collectionOrder = [BASE_COLLECTION, ...axisList.map(axis => collectionName(axis.name))]
  for (const name of collectionOrder) {
    const variables = variablesByCollection.get(name)
    if (!variables || variables.length === 0) continue
    const axis = axisList.find(item => collectionName(item.name) === name)
    for (const variable of variables) {
      variable.type = typeOf.get(variable.token) ?? variable.type
      variable.codeSyntax = `var(${variable.token})`
      variable.scopes = scopesFor(variable.token, variable.type)
    }
    collections.push({ name, modes: axis ? axis.values : [BASE_MODE], variables })
  }

  const notes: string[] = []
  if (all.some(item => item.media))
    notes.push('Values inside @media (min-width) blocks are read at the widest viewport.')

  const variableCount = collections.reduce((total, item) => total + item.variables.length, 0)
  const aliasValues = collections.reduce(
    (total, item) =>
      total +
      item.variables.reduce(
        (count, variable) =>
          count + Object.values(variable.values).filter(value => !('value' in value)).length,
        0
      ),
    0
  )
  return {
    model: {
      schemaVersion: 1,
      summary: {
        collections: collections.length,
        variables: variableCount,
        aliasValues,
        skipped: skipped.length,
      },
      collections,
      skipped,
    },
    sources,
    raw,
    notes,
  }
}
