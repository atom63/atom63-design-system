import { describe, expect, it } from 'vitest'
import {
  AUTO_CONTRAST_CSS_OKLCH_L_STEP,
  AUTO_CONTRAST_WCAG_Y_THRESHOLD,
  relativeLuminance,
  shouldUseLightForeground,
} from './auto-contrast'

describe('auto-contrast', () => {
  it('exports thresholds paired with brand.css', () => {
    expect(AUTO_CONTRAST_WCAG_Y_THRESHOLD).toBe(0.3)
    expect(AUTO_CONTRAST_CSS_OKLCH_L_STEP).toBe(0.665)
  })

  it('picks dark fg for mustard gold (screenshot regression)', () => {
    // rgb(202, 144, 61) — sampled primary; Y≈0.328 → dark
    expect(shouldUseLightForeground(202, 144, 61)).toBe(false)
    expect(relativeLuminance(202, 144, 61)).toBeGreaterThan(0.3)
  })

  it('picks light fg for default b1 blue', () => {
    expect(shouldUseLightForeground(44, 127, 255)).toBe(true)
  })
})
