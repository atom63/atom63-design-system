import { describe, expect, it } from 'vitest'
import {
  AUTO_CONTRAST_CSS_OKLCH_L_STEP,
  AUTO_CONTRAST_WCAG_Y_THRESHOLD,
  relativeLuminance,
  shouldUseLightForeground,
} from './auto-contrast'

describe('auto-contrast', () => {
  it('exports thresholds paired with brand.css', () => {
    expect(AUTO_CONTRAST_WCAG_Y_THRESHOLD).toBe(0.18)
    expect(AUTO_CONTRAST_CSS_OKLCH_L_STEP).toBe(0.57)
  })

  it('picks dark fg for mustard gold (screenshot regression)', () => {
    // rgb(202, 144, 61) — sampled primary; Y≈0.328 → dark
    expect(shouldUseLightForeground(202, 144, 61)).toBe(false)
    expect(relativeLuminance(202, 144, 61)).toBeGreaterThan(0.3)
  })

  it('picks light fg for the default b1 primary fill (600)', () => {
    expect(shouldUseLightForeground(5, 93, 210)).toBe(true)
  })

  it('picks dark fg for a mid-lightness fill where white is below 4.5:1', () => {
    // rgb(44, 127, 255) — b1 500; white on it is about 3.9:1
    expect(shouldUseLightForeground(44, 127, 255)).toBe(false)
  })
})
