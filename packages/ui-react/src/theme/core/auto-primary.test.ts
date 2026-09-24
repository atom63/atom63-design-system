import { beforeEach, describe, expect, it } from 'vitest'
import {
  AUTO_FALLBACK_COLOR,
  AUTO_PRIMARY_ID,
  applyAutoColorRamp,
  clearAutoColorRamp,
  isAutoPrimary,
} from './auto-primary'
import { relativeLuminance } from './auto-contrast'

describe('auto-primary', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('style')
  })

  it('identifies the auto brand id', () => {
    expect(AUTO_PRIMARY_ID).toBe('auto')
    expect(isAutoPrimary('auto')).toBe(true)
    expect(isAutoPrimary('b2')).toBe(false)
  })

  it('writes the full --color-auto-* ramp + foreground', () => {
    const root = document.documentElement
    applyAutoColorRamp(root, AUTO_FALLBACK_COLOR)
    for (const step of [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]) {
      expect(root.style.getPropertyValue(`--color-auto-${step}`)).not.toBe('')
    }
    expect(root.style.getPropertyValue('--color-auto-foreground')).not.toBe('')
  })

  it('clears the entire ramp', () => {
    const root = document.documentElement
    applyAutoColorRamp(root, AUTO_FALLBACK_COLOR)
    clearAutoColorRamp(root)
    for (const step of [50, 500, 950]) {
      expect(root.style.getPropertyValue(`--color-auto-${step}`)).toBe('')
    }
    expect(root.style.getPropertyValue('--color-auto-foreground')).toBe('')
  })

  it('meets WCAG AA for every hue and saturation', () => {
    const root = document.documentElement
    const rgb = (step: number) => {
      const match = root.style
        .getPropertyValue(`--color-auto-${step}`)
        .match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i)
      return match!.slice(1).map(Number) as [number, number, number]
    }
    const luminance = (c: [number, number, number]) => relativeLuminance(...c)
    const contrast = (a: number, b: number) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
    // The light and dark page surfaces (--color-n1-light-2, --color-n1-dark-1).
    const lightPage = luminance([249, 249, 249])
    const darkPage = luminance([17, 17, 17])
    const failures: string[] = []
    for (const saturation of [0.3, 0.6, 0.9, 1]) {
      for (let hue = 0; hue < 360; hue += 10) {
        applyAutoColorRamp(root, { hue, saturation })
        const fill = luminance(rgb(600))
        const checks = {
          // White label on the primary action (brand-600).
          'white on 600': contrast(1, fill),
          // Brand as text on the light page (brand-text = 600).
          '600 on light page': contrast(fill, lightPage),
          // Brand as text on the dark page (text-accent = 400).
          '400 on dark page': contrast(luminance(rgb(400)), darkPage),
        }
        for (const [name, ratio] of Object.entries(checks)) {
          if (ratio < 4.5)
            failures.push(`hue ${hue} sat ${saturation}: ${name} ${ratio.toFixed(2)}`)
        }
      }
    }
    expect(failures).toEqual([])
  })

  it('keeps a light auto-foreground for default blue', () => {
    const root = document.documentElement
    applyAutoColorRamp(root, AUTO_FALLBACK_COLOR)
    const fg = root.style.getPropertyValue('--color-auto-foreground')
    const match = fg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i)
    expect(match).not.toBeNull()
    const [, r, g, b] = match!
    const avg = (Number(r) + Number(g) + Number(b)) / 3
    expect(avg).toBeGreaterThan(200)
  })
})
