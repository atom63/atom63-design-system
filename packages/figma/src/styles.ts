/**
 * Text and effect styles derived from a token set: text steps pair a size and
 * a line-height variable, shadows become drop or inner shadow layers. Works on
 * a project's CSS model and on Atom63's model alike.
 */
import { parseColor } from './css-model'
import type { SyncColor, SyncModel, SyncVariable } from './plan'

export interface ShadowLayer {
  inset: boolean
  x: number
  y: number
  blur: number
  spread: number
  color: SyncColor
}
export type StyleNumber = { alias: string } | { value: number }
export interface TextStyleSpec {
  name: string
  description: string
  family: { alias: string; fallback: string } | { value: string }
  fontSize: StyleNumber
  lineHeight: StyleNumber
}
export interface EffectStyleSpec {
  name: string
  description: string
  layers: ShadowLayer[]
}
export interface StyleSet {
  text: TextStyleSpec[]
  effects: EffectStyleSpec[]
  skipped: { name: string; reason: string }[]
}

/** Splits on commas outside parentheses. */
function layersOf(expression: string): string[] {
  const parts: string[] = []
  let depth = 0
  let current = ''
  for (const char of expression) {
    if (char === '(') depth += 1
    if (char === ')') depth -= 1
    if (char === ',' && depth === 0) {
      parts.push(current.trim())
      current = ''
    } else current += char
  }
  if (current.trim()) parts.push(current.trim())
  return parts
}

const LENGTH = /^-?\d*\.?\d+(px)?$/

export function parseShadow(expression: string): ShadowLayer[] | null {
  const layers: ShadowLayer[] = []
  for (const layer of layersOf(expression.replace(/\s+/g, ' '))) {
    const words: string[] = layer.match(/(?:[a-z-]+\([^()]*\)|\S)+/gi) ?? []
    const inset = words.includes('inset')
    const lengths = words.filter(word => LENGTH.test(word)).map(word => Number.parseFloat(word))
    const colorWord = words.find(word => word !== 'inset' && !LENGTH.test(word))
    const color = colorWord ? parseColor(colorWord) : null
    if (lengths.length < 2 || lengths.length > 4 || !color) return null
    const [x, y, blur = 0, spread = 0] = lengths
    layers.push({ inset, x, y, blur, spread, color })
  }
  return layers.length > 0 ? layers : null
}

const TEXT_PAIRS = [
  { size: /^--text-(.+)-size$/, leading: (step: string) => `--text-${step}-leading` },
  {
    size: /^--typography-(.+)-font-size$/,
    leading: (step: string) => `--typography-${step}-line-height`,
  },
]
const SHADOW = [/^--shadow-(.+)$/, /^--effect-shadow-(.+)$/]
const FONT_VARIABLE = '--a63-font-app'
const FONT_STACK = '--font-sans'

/** The first family of a CSS font stack, unquoted. */
export function firstFamily(stack: string): string {
  return layersOf(stack)[0]?.replace(/^['"]|['"]$/g, '') ?? 'Inter'
}

export function deriveStyles(model: SyncModel, raw: Record<string, string> = {}): StyleSet {
  const variables = new Map<string, SyncVariable>(
    model.collections.flatMap(collection =>
      collection.variables.map(variable => [variable.token, variable] as const)
    )
  )
  const skipped: StyleSet['skipped'] = []

  // The family: a font variable when the model has one, else the first font of the sans stack.
  const fontVariable = variables.get(FONT_VARIABLE)
  const firstValue = fontVariable && Object.values(fontVariable.values)[0]
  const fallbackStack =
    firstValue && 'alias' in firstValue
      ? String((variables.get(firstValue.alias)?.values.Value as { value?: string })?.value ?? '')
      : ''
  const family: TextStyleSpec['family'] = fontVariable
    ? { alias: FONT_VARIABLE, fallback: firstFamily(fallbackStack || 'Inter') }
    : { value: firstFamily(raw[FONT_STACK] ?? 'Inter') }

  // A token's number in its first mode, through aliases.
  const numberOf = (token: string, depth = 0): number | null => {
    const variable = variables.get(token)
    const value = variable && Object.values(variable.values)[0]
    if (!value || depth > 8) return null
    if ('alias' in value) return numberOf(value.alias, depth + 1)
    return 'value' in value && typeof value.value === 'number' ? value.value : null
  }

  // A model can list a token as skipped in one place and hold it as a variable in another.
  const missingSizes = new Set(model.skipped.map(item => item.token).filter(t => !variables.has(t)))
  for (const token of missingSizes)
    for (const pair of TEXT_PAIRS) {
      const step = pair.size.exec(token)?.[1]
      if (step)
        skipped.push({
          name: `Text/${step}`,
          reason: `the size token ${token} is not a Figma variable`,
        })
    }

  const text: TextStyleSpec[] = []
  for (const token of variables.keys()) {
    for (const pair of TEXT_PAIRS) {
      const step = pair.size.exec(token)?.[1]
      if (!step) continue
      const name = `Text/${step}`
      const leading = pair.leading(step)
      if (!variables.has(leading)) {
        skipped.push({ name, reason: `no line height token (${leading})` })
        continue
      }
      // A line height below its font size is a CSS ratio (1.5), not pixels.
      const size = numberOf(token)
      const height = numberOf(leading)
      if (size !== null && height !== null && height < size) {
        skipped.push({ name, reason: `unitless line height (${leading}); Figma needs pixels` })
        continue
      }
      text.push({
        name,
        description: `var(${token}) / var(${leading})`,
        family,
        fontSize: { alias: token },
        lineHeight: { alias: leading },
      })
    }
  }

  const effects: EffectStyleSpec[] = []
  const shadowSources = new Map<string, string>(Object.entries(raw))
  for (const [token, variable] of variables)
    if (variable.type === 'STRING') {
      const value = Object.values(variable.values)[0]
      if (value && 'value' in value && typeof value.value === 'string')
        shadowSources.set(token, value.value)
    }
  for (const [token, expression] of shadowSources) {
    const step = SHADOW.map(pattern => pattern.exec(token)?.[1]).find(Boolean)
    if (!step) continue
    const name = `Shadow/${step}`
    const layers = parseShadow(expression)
    if (!layers) {
      skipped.push({ name, reason: `not a plain box shadow (${token})` })
      continue
    }
    effects.push({ name, description: `var(${token})`, layers })
  }

  return { text, effects, skipped }
}
