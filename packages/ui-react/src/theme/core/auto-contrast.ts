/**
 * Auto-contrast contract for primary-on-fill foregrounds.
 *
 * JS uses WCAG relative luminance (Y). CSS in
 * `packages/styles/src/tokens/brand.css` uses an oklch `l` step of
 * {@link AUTO_CONTRAST_CSS_OKLCH_L_STEP} for `--a63-action-primary-foreground`.
 * Keep both aligned when tuning (mustard golds must get dark text).
 */

/** Large-text white 3:1 boundary — light fg only when Y is below this. */
export const AUTO_CONTRAST_WCAG_Y_THRESHOLD = 0.3

/**
 * Documentation mirror of the CSS clamp step
 * `oklch(from … clamp(0.15, (0.665 - l) * 1000, 0.985) …)`.
 * Not evaluated in JS — components use the CSS token.
 */
export const AUTO_CONTRAST_CSS_OKLCH_L_STEP = 0.665

export function relativeLuminance(r: number, g: number, b: number): number {
  const toLinear = (c: number) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)
}

/** True when near-white (tinted) text should sit on this solid fill. */
export function shouldUseLightForeground(r: number, g: number, b: number): boolean {
  return relativeLuminance(r, g, b) < AUTO_CONTRAST_WCAG_Y_THRESHOLD
}
