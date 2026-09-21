import { beforeEach, describe, expect, it } from 'vitest'
import {
  AUTO_FALLBACK_COLOR,
  AUTO_PRIMARY_ID,
  applyAutoColorRamp,
  clearAutoColorRamp,
  isAutoPrimary,
} from './auto-primary'

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

  it('picks a dark auto-foreground for saturated gold / mustard hues', () => {
    const root = document.documentElement
    // Wallpaper-extracted golds land near hue 45–55; ramp 500 is bright enough
    // that light-on-primary fails large-text 3:1 and must use near-black fg.
    applyAutoColorRamp(root, { hue: 48, saturation: 0.92 })
    const fg = root.style.getPropertyValue('--color-auto-foreground')
    const match = fg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i)
    expect(match).not.toBeNull()
    const [, r, g, b] = match!
    const avg = (Number(r) + Number(g) + Number(b)) / 3
    expect(avg).toBeLessThan(80)
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
