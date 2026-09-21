import { describe, expect, it } from 'vitest'
import { capColorForContrast, TINT_MAX_LUMINANCE } from './extract-color'

function srgbToLinear(channel: number): number {
  const c = channel / 255
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

function luminance(rgb: string): number {
  const [r, g, b] = rgb.split(' ').map(Number) as [number, number, number]
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b)
}

function hue(rgb: string): number {
  const [r, g, b] = rgb.split(' ').map(Number) as [number, number, number]
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  if (max === min) return 0
  const d = max - min
  if (max === r) return (((g - b) / d + (g < b ? 6 : 0)) / 6) * 360
  if (max === g) return (((b - r) / d + 2) / 6) * 360
  return (((r - g) / d + 4) / 6) * 360
}

describe('capColorForContrast', () => {
  /**
   * The contract the tinted card overlay depends on. Clamping HSL *lightness*
   * instead passes this for blue and fails it for yellow: at L=0.13 a saturated
   * yellow resolves to rgb(63 65 1), roughly 4x the luminance of an equally
   * "light" blue — which is what put white copy under AA on bright cards.
   */
  it.each([
    ['yellow', 255, 255, 0],
    ['cyan', 0, 255, 255],
    ['magenta', 255, 0, 255],
    ['red', 255, 0, 0],
    ['blue', 0, 0, 255],
    ['green', 0, 255, 0],
    ['white', 255, 255, 255],
    ['mid grey', 128, 128, 128],
    ['olive', 98, 101, 1],
  ])('caps %s to the luminance ceiling', (_name, r, g, b) => {
    const capped = capColorForContrast(r, g, b)
    expect(luminance(capped)).toBeLessThanOrEqual(TINT_MAX_LUMINANCE * 1.02)
  })

  it('keeps hue while darkening, so a yellow reads as deep gold not grey', () => {
    const capped = capColorForContrast(255, 255, 0)
    expect(hue(capped)).toBeGreaterThan(45)
    expect(hue(capped)).toBeLessThan(75)
  })

  it('keeps a blue blue', () => {
    const [r, g, b] = capColorForContrast(4, 60, 98).split(' ').map(Number) as [
      number,
      number,
      number,
    ]
    expect(b).toBeGreaterThan(r)
    expect(b).toBeGreaterThan(g)
  })

  it('leaves colors already under the ceiling untouched', () => {
    expect(capColorForContrast(8, 10, 12)).toBe('8 10 12')
  })

  it('maps pure black to black', () => {
    expect(capColorForContrast(0, 0, 0)).toBe('0 0 0')
  })
})
