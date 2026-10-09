/**
 * A failed check's differences as readable lines. The engine reports each one
 * as the variant, the property path and both values as short JSON strings;
 * this formats them for people and leaves the engine's data as it is:
 * `Button · primary / md / rest — fill: none → action/primary`.
 */
import { formatCount } from './format'

export interface Difference {
  variant: string
  /** The node to show in Figma; replies from before it was added carry none. */
  nodeId?: string
  what: string
  actual?: string
  expected?: string
}

/** `Variant=primary, Size=md, State=rest` as its values: `primary / md / rest`. */
export function variantName(variant: string): string {
  const parts = variant.split(',').map(part => part.trim())
  if (!parts.every(part => part.includes('='))) return variant
  return parts.map(part => part.slice(part.indexOf('=') + 1).trim()).join(' / ')
}

const PROPERTIES: Record<string, string> = {
  fills: 'fill',
  strokes: 'stroke',
  effects: 'effects',
  fontName: 'font',
  textStyleId: 'text style',
  layoutPositioning: 'positioning',
}

/** The property path without the variant's own name, its last key in words. */
export function propertyName(variant: string, what: string): string {
  const path = what.startsWith(`${variant}.`) ? what.slice(variant.length + 1) : what
  const dot = path.lastIndexOf('.')
  const key = dot === -1 ? path : path.slice(dot + 1)
  const label = PROPERTIES[key] ?? key
  return dot === -1 ? label : `${path.slice(0, dot)} ${label}`
}

const hexByte = (channel: number) =>
  Math.round(Math.min(Math.max(channel, 0), 1) * 255)
    .toString(16)
    .padStart(2, '0')

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isColor = (value: unknown): value is { r: number; g: number; b: number; a?: number } =>
  isRecord(value) &&
  typeof value.r === 'number' &&
  typeof value.g === 'number' &&
  typeof value.b === 'number'

function hex(color: { r: number; g: number; b: number; a?: number }, opacity = 1): string {
  const text = `#${hexByte(color.r)}${hexByte(color.g)}${hexByte(color.b)}`.toUpperCase()
  const alpha = (color.a ?? 1) * opacity
  return alpha < 1 ? `${text} at ${Math.round(alpha * 100)}%` : text
}

/** A bound variable's name, or the names of several, or undefined when none. */
function boundName(bound: unknown): string | undefined {
  if (typeof bound === 'string' && bound) return bound
  if (Array.isArray(bound)) {
    const names = bound.filter((name): name is string => typeof name === 'string' && !!name)
    return names.length > 0 ? names.join(', ') : undefined
  }
  return undefined
}

/** One value in words: a paint by its variable or hex, a number plainly, nothing as `none`. */
export function readable(value: unknown): string {
  if (value === null || value === undefined || value === '') return 'none'
  if (typeof value === 'number') return formatCount(value)
  if (typeof value === 'string') return value
  if (typeof value === 'boolean') return value ? 'yes' : 'no'
  if (Array.isArray(value))
    return value.length === 0 ? 'none' : value.map(item => readable(item)).join(', ')
  if (!isRecord(value)) return typeof value === 'bigint' ? value.toString() : 'none'
  if (value.visible === false) return 'hidden'
  const bound = boundName(value.bound)
  if (bound) return bound
  if (isColor(value.color))
    return hex(value.color, typeof value.opacity === 'number' ? value.opacity : 1)
  if (isColor(value)) return hex(value)
  if (isRecord(value.font)) return readable(value.font)
  if (typeof value.family === 'string' && typeof value.style === 'string')
    return `${value.family} ${value.style}`
  if (typeof value.width === 'number' && typeof value.height === 'number')
    return `${formatCount(value.width)} × ${formatCount(value.height)}`
  if ('value' in value) return readable(value.value)
  if ('bound' in value) return 'none'
  const entries = Object.entries(value).filter(([, item]) => item !== undefined)
  return entries.length === 0
    ? 'none'
    : entries.map(([key, item]) => `${key} ${readable(item)}`).join(', ')
}

/**
 * A reported value in words. The engine sends JSON, cut at 120 characters;
 * a cut one keeps its variable name if it shows one, or reads as its text
 * without JSON punctuation.
 */
export function readableValue(text: string | undefined): string {
  if (text === undefined) return 'none'
  try {
    return readable(JSON.parse(text) as unknown)
  } catch {
    const bound = /"bound":"([^"]+)"/.exec(text)
    if (bound) return bound[1]
    const words = text
      .replace(/[{}[\]"]/g, ' ')
      .replace(/\s*:\s*/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/ ,/g, ',')
      .trim()
    return words || 'none'
  }
}

/** One difference as a line: the component, the variant's values, the property and both values. */
export function differenceLine(component: string, difference: Difference): string {
  const { variant, what, actual, expected } = difference
  const values =
    actual !== undefined || expected !== undefined
      ? `: ${readableValue(actual)} → ${readableValue(expected)}`
      : ''
  return `${component} · ${variantName(variant)} — ${propertyName(variant, what)}${values}`
}
