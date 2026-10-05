/**
 * oklch() colors, absolute (`oklch(62% 0.2 30)`) and relative
 * (`oklch(from <color> l c h / alpha)`), computed in Node: OKLCH to sRGB, each
 * channel clipped to 0–1 as the plugin's browser resolver clips. The plugin
 * tries this before the browser, so the plugin and the CLI write the same
 * numbers; Chrome's own conversion differs by about 1e-4.
 */
import type { SyncColor } from './plan'
import { oklchToRgb, rgbToOklch } from './ramp'

type Channels = Readonly<Record<string, number>>

/** Splits on whitespace and `/` outside parentheses; `/` stays as its own word. */
function words(source: string): string[] | null {
  const out: string[] = []
  let depth = 0
  let current = ''
  for (const char of source) {
    if (char === '(') depth += 1
    if (char === ')') depth -= 1
    if (depth < 0) return null
    if (depth === 0 && (/\s/.test(char) || char === '/')) {
      if (current) out.push(current)
      current = ''
      if (char === '/') out.push('/')
    } else current += char
  }
  if (depth !== 0) return null
  if (current) out.push(current)
  return out
}

/**
 * A channel value: a number (`%` scaled by `percent`, `deg` dropped), a channel
 * keyword (`l`, `c`, `h`, `alpha`), `none`, or calc(), clamp(), min() and max()
 * over + - * / and parentheses. Null for anything else.
 */
export function evaluateChannel(
  source: string,
  channels: Channels,
  percent: number
): number | null {
  const text = source.trim().toLowerCase()
  let index = 0
  const skip = () => {
    while (/\s/.test(text[index] ?? '')) index += 1
  }
  const args = (): number[] | null => {
    const values: number[] = []
    for (;;) {
      const value = sum()
      if (value === null) return null
      values.push(value)
      skip()
      if (text[index] === ',') index += 1
      else if (text[index] === ')') {
        index += 1
        return values
      } else return null
    }
  }
  const primary = (): number | null => {
    skip()
    const func = /^(calc|clamp|min|max)\(/.exec(text.slice(index))
    if (func) {
      index += func[0].length
      const values = args()
      if (!values) return null
      if (func[1] === 'calc') return values.length === 1 ? values[0] : null
      if (func[1] === 'clamp')
        return values.length === 3 ? Math.max(values[0], Math.min(values[1], values[2])) : null
      return func[1] === 'min' ? Math.min(...values) : Math.max(...values)
    }
    if (text[index] === '(') {
      index += 1
      const value = sum()
      skip()
      if (value === null || text[index] !== ')') return null
      index += 1
      return value
    }
    const number = /^(?:\d+\.?\d*|\.\d+)(?:e-?\d+)?(%|deg)?/.exec(text.slice(index))
    if (number) {
      index += number[0].length
      const value = Number.parseFloat(number[0])
      return number[1] === '%' ? (value / 100) * percent : value
    }
    const word = /^[a-z]+/.exec(text.slice(index))?.[0]
    if (word === 'none') {
      index += word.length
      return 0
    }
    if (word && word in channels) {
      index += word.length
      return channels[word]
    }
    return null
  }
  const unary = (): number | null => {
    skip()
    if (text[index] === '-') {
      index += 1
      const value = unary()
      return value === null ? null : -value
    }
    return primary()
  }
  const product = (): number | null => {
    let left = unary()
    for (;;) {
      skip()
      const operator = text[index]
      if (left === null || (operator !== '*' && operator !== '/')) return left
      index += 1
      const right = unary()
      if (right === null) return null
      left = operator === '*' ? left * right : left / right
    }
  }
  const sum = (): number | null => {
    let left = product()
    for (;;) {
      skip()
      const operator = text[index]
      if (left === null || (operator !== '+' && operator !== '-')) return left
      index += 1
      const right = product()
      if (right === null) return null
      left = operator === '+' ? left + right : left - right
    }
  }
  const value = sum()
  skip()
  return value !== null && index === text.length && Number.isFinite(value) ? value : null
}

export function parseOklch(
  expression: string,
  parseBase: (expression: string) => SyncColor | null
): SyncColor | null {
  const match = /^oklch\((.*)\)$/.exec(expression.trim().toLowerCase().replace(/\s+/g, ' '))
  let parts = match ? words(match[1]) : null
  if (!parts) return null
  let channels: Channels = {}
  if (parts[0] === 'from') {
    const base = parts[1] ? parseBase(parts[1]) : null
    if (!base) return null
    const { l, c, h } = rgbToOklch([base.r, base.g, base.b])
    channels = { l, c, h, alpha: base.a }
    parts = parts.slice(2)
  }
  const slash = parts.indexOf('/')
  const main = slash === -1 ? parts : parts.slice(0, slash)
  const alpha = slash === -1 ? [] : parts.slice(slash + 1)
  if (main.length !== 3 || (slash !== -1 && alpha.length !== 1)) return null
  const l = evaluateChannel(main[0], channels, 1)
  const c = evaluateChannel(main[1], channels, 0.4)
  const h = evaluateChannel(main[2], channels, 1)
  const a = alpha.length > 0 ? evaluateChannel(alpha[0], channels, 1) : (channels.alpha ?? 1)
  if (l === null || c === null || h === null || a === null) return null
  const [r, g, b] = oklchToRgb({ l, c: Math.max(0, c), h })
  return { r, g, b, a: Math.min(1, Math.max(0, a)) }
}
