import { afterEach, describe, expect, it } from 'vitest'
import { root } from '../test/apply-styles'

/** WCAG AA normal-text minimum (body / secondary on surfaces). */
const AA_TEXT = 4.5
/** WCAG 1.4.11 / large-text minimum for solid action fills (matches auto-contrast intent). */
const AA_UI = 3

const themes = ['modern', 'aqua', 'retro', 'terminal'] as const
const modes = ['light', 'dark'] as const

const textPairs = [
  { fg: '--a63-text-primary', bg: '--a63-surface-page', min: AA_TEXT },
  { fg: '--a63-text-secondary', bg: '--a63-surface-page', min: AA_TEXT },
  { fg: '--a63-text-primary', bg: '--a63-surface-panel', min: AA_TEXT },
  { fg: '--a63-text-accent', bg: '--a63-surface-page', min: AA_TEXT },
  { fg: '--a63-text-accent', bg: '--a63-surface-panel', min: AA_TEXT },
] as const

const actionPairs = [
  // Button labels are normal-size text, so the primary pair meets AA text, not 3:1.
  { fg: '--a63-action-primary-foreground', bg: '--a63-action-primary', min: AA_TEXT },
  { fg: '--a63-action-neutral-foreground', bg: '--a63-action-neutral', min: AA_UI },
  { fg: '--a63-action-danger-foreground', bg: '--a63-action-danger', min: AA_UI },
] as const

// Status accents paint icons and borders (alerts, copy check, load more), so
// they meet WCAG's 3:1 for graphics against the page.
const statusPairs = [
  { fg: '--a63-status-info', bg: '--a63-surface-page', min: AA_UI },
  { fg: '--a63-status-success', bg: '--a63-surface-page', min: AA_UI },
  { fg: '--a63-status-warning', bg: '--a63-surface-page', min: AA_UI },
] as const

const pairs = [...textPairs, ...actionPairs, ...statusPairs] as const

afterEach(() => {
  document.documentElement.removeAttribute('data-a63-theme')
  document.documentElement.removeAttribute('data-a63-mode')
  document.documentElement.classList.remove('dark', 'light')
  document.body.replaceChildren()
})

interface Rgb {
  r: number
  g: number
  b: number
  a: number
}

function parseCssColor(color: string): Rgb {
  const trimmed = color.trim()
  if (trimmed === 'transparent') return { r: 0, g: 0, b: 0, a: 0 }

  // Paint one pixel and read sRGB — works for oklch/lab/color-mix computed values.
  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = 1
  const ctx = canvas.getContext('2d', { colorSpace: 'srgb' })
  if (!ctx) throw new Error('2d canvas unavailable for contrast parsing')
  ctx.clearRect(0, 0, 1, 1)
  ctx.fillStyle = trimmed
  ctx.fillRect(0, 0, 1, 1)
  const data = ctx.getImageData(0, 0, 1, 1).data
  return {
    r: data[0] ?? 0,
    g: data[1] ?? 0,
    b: data[2] ?? 0,
    a: (data[3] ?? 0) / 255,
  }
}

function relativeLuminance({ r, g, b }: Rgb): number {
  const toLinear = (c: number) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)
}

function contrastRatio(fg: Rgb, bg: Rgb): number {
  // Composite translucent foreground over opaque background (CSS painting).
  const a = Math.min(1, Math.max(0, fg.a))
  const composite: Rgb = {
    r: fg.r * a + bg.r * (1 - a),
    g: fg.g * a + bg.g * (1 - a),
    b: fg.b * a + bg.b * (1 - a),
    a: 1,
  }
  const L1 = relativeLuminance(composite)
  const L2 = relativeLuminance(bg)
  const lighter = Math.max(L1, L2)
  const darker = Math.min(L1, L2)
  return (lighter + 0.05) / (darker + 0.05)
}

function resolvePaintedColor(cssVar: string, as: 'color' | 'background'): string {
  const probe = document.createElement('div')
  if (as === 'color') {
    probe.style.color = `var(${cssVar})`
  } else {
    probe.style.backgroundColor = `var(${cssVar})`
  }
  document.body.appendChild(probe)
  const style = getComputedStyle(probe)
  const value = as === 'color' ? style.color : style.backgroundColor
  probe.remove()
  return value
}

function applyThemeMode(theme: (typeof themes)[number], mode: (typeof modes)[number]): void {
  root().setAttribute('data-a63-theme', theme)
  root().setAttribute('data-a63-mode', mode)
  root().classList.remove('dark', 'light')
  root().classList.add(mode)
}

describe('core semantic contrast (WCAG AA)', () => {
  it('meets AA text 4.5:1 on surfaces and the primary fill, and 3:1 on other action fills', () => {
    const failures: string[] = []

    for (const theme of themes) {
      for (const mode of modes) {
        applyThemeMode(theme, mode)

        for (const { fg, bg, min } of pairs) {
          const fgCss = resolvePaintedColor(fg, 'color')
          const bgCss = resolvePaintedColor(bg, 'background')
          const fgRgb = parseCssColor(fgCss)
          const bgRgb = parseCssColor(bgCss)

          if (bgRgb.a < 0.98) {
            failures.push(
              `${theme}/${mode} ${fg} on ${bg}: background is translucent (a=${bgRgb.a}); core pairs must be opaque fills`
            )
            continue
          }

          const ratio = contrastRatio(fgRgb, bgRgb)
          if (ratio < min) {
            failures.push(
              `${theme}/${mode} ${fg} on ${bg}: ${ratio.toFixed(2)}:1 < ${min}:1 (fg=${fgCss}, bg=${bgCss})`
            )
          }
        }
      }
    }

    expect(failures, failures.join('\n')).toEqual([])
  })
})

const brands = ['b1', 'b2', 'b3', 'b4', 'b5', 'b6'] as const
const brandPairs = [
  { fg: '--a63-action-primary-foreground', bg: '--a63-action-primary', min: AA_TEXT },
  { fg: '--a63-text-accent', bg: '--a63-surface-page', min: AA_TEXT },
] as const

describe('brand contrast (WCAG AA)', () => {
  afterEach(() => root().removeAttribute('data-a63-brand'))

  it('keeps the primary action and brand text readable on every brand ramp', () => {
    const failures: string[] = []
    for (const brand of brands) {
      root().setAttribute('data-a63-brand', brand)
      for (const theme of themes) {
        for (const mode of modes) {
          applyThemeMode(theme, mode)
          for (const { fg, bg, min } of brandPairs) {
            const fgCss = resolvePaintedColor(fg, 'color')
            const bgCss = resolvePaintedColor(bg, 'background')
            const ratio = contrastRatio(parseCssColor(fgCss), parseCssColor(bgCss))
            if (ratio < min) {
              failures.push(
                `${brand} ${theme}/${mode} ${fg} on ${bg}: ${ratio.toFixed(2)}:1 < ${min}:1 (fg=${fgCss}, bg=${bgCss})`
              )
            }
          }
        }
      }
    }
    expect(failures, failures.join('\n')).toEqual([])
  })
})
