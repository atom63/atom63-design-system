import { type ColorResolver, parseColor } from '@atom63/figma'

/**
 * Resolves any CSS color the UI's browser understands (oklch(), relative
 * colors, color-mix()) to sRGB channels, by letting the browser convert it:
 * `color(from <color> srgb r g b / alpha)` computes to `color(srgb r g b / a)`.
 * Simple literals skip the round trip.
 */
export function createBrowserColorResolver(): ColorResolver {
  const probe = document.createElement('i')
  probe.style.display = 'none'
  document.body.append(probe)

  return expression => {
    const literal = parseColor(expression)
    if (literal) return literal
    probe.style.color = ''
    probe.style.color = `color(from ${expression} srgb r g b / alpha)`
    if (!probe.style.color) return null
    const match = /color\(srgb ([\d.e+-]+) ([\d.e+-]+) ([\d.e+-]+)(?: \/ ([\d.e+-]+))?\)/.exec(
      getComputedStyle(probe).color
    )
    if (!match) return null
    const clamp = (value: string) => Math.min(1, Math.max(0, Number(value)))
    return {
      r: clamp(match[1]),
      g: clamp(match[2]),
      b: clamp(match[3]),
      a: match[4] === undefined ? 1 : clamp(match[4]),
    }
  }
}
