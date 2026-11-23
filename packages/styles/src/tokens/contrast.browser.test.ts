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
  // The third grey paints placeholders, meta and timestamps: on the page and the
  // panel, in a field (the control fill) and in a filled field (the muted fill).
  { fg: '--a63-text-tertiary', bg: '--a63-surface-page', min: AA_TEXT },
  { fg: '--a63-text-tertiary', bg: '--a63-surface-panel', min: AA_TEXT },
  { fg: '--a63-text-tertiary', bg: '--a63-surface-control', min: AA_TEXT },
  { fg: '--a63-text-tertiary', bg: '--a63-surface-muted', min: AA_TEXT },
  { fg: '--a63-text-primary', bg: '--a63-surface-panel', min: AA_TEXT },
  { fg: '--a63-text-accent', bg: '--a63-surface-page', min: AA_TEXT },
  { fg: '--a63-text-accent', bg: '--a63-surface-panel', min: AA_TEXT },
  { fg: '--a63-text-danger', bg: '--a63-surface-page', min: AA_TEXT },
  { fg: '--a63-text-danger', bg: '--a63-surface-panel', min: AA_TEXT },
  // Status text (Alert action labels, tinted badges) uses the -subtle-foreground
  // step, not the 3:1 status accent.
  { fg: '--a63-status-info-subtle-foreground', bg: '--a63-surface-page', min: AA_TEXT },
  { fg: '--a63-status-info-subtle-foreground', bg: '--a63-surface-panel', min: AA_TEXT },
  { fg: '--a63-status-success-subtle-foreground', bg: '--a63-surface-page', min: AA_TEXT },
  { fg: '--a63-status-success-subtle-foreground', bg: '--a63-surface-panel', min: AA_TEXT },
  { fg: '--a63-status-warning-subtle-foreground', bg: '--a63-surface-page', min: AA_TEXT },
  { fg: '--a63-status-warning-subtle-foreground', bg: '--a63-surface-panel', min: AA_TEXT },
] as const

const actionPairs = [
  // Button labels are normal-size text, so the primary pair meets AA text, not 3:1.
  { fg: '--a63-action-primary-foreground', bg: '--a63-action-primary', min: AA_TEXT },
  { fg: '--a63-action-neutral-foreground', bg: '--a63-action-neutral', min: AA_UI },
  { fg: '--a63-action-danger-foreground', bg: '--a63-action-danger', min: AA_UI },
  // A pressed toggle carries its state in its fill (WCAG 1.4.11), so the fill
  // reaches 3:1 against the page and the panel, and its label stays legible.
  { fg: '--a63-toggle-on-background', bg: '--a63-surface-page', min: AA_UI },
  { fg: '--a63-toggle-on-background', bg: '--a63-surface-panel', min: AA_UI },
  { fg: '--a63-toggle-on-foreground', bg: '--a63-toggle-on-background', min: AA_TEXT },
  // WCAG exempts disabled controls from 4.5:1, but the muted label stays legible.
  { fg: '--a63-action-disabled-foreground', bg: '--a63-action-disabled-background', min: 2.5 },
] as const

// Status accents paint icons and borders (alerts, copy check, load more), so
// they meet WCAG's 3:1 for graphics against the page.
const statusPairs = [
  { fg: '--a63-status-info', bg: '--a63-surface-page', min: AA_UI },
  { fg: '--a63-status-success', bg: '--a63-surface-page', min: AA_UI },
  { fg: '--a63-status-warning', bg: '--a63-surface-page', min: AA_UI },
  { fg: '--a63-status-danger', bg: '--a63-surface-page', min: AA_UI },
  // The danger accent also draws a focused invalid field's border and ring, and
  // the error icon on a panel (LoadMoreTrigger, FeedbackState).
  { fg: '--a63-status-danger', bg: '--a63-surface-panel', min: AA_UI },
  { fg: '--a63-status-danger', bg: '--a63-surface-control', min: AA_UI },
] as const

// WCAG 1.4.11: an invalid control's border is how a person finds the error, so it
// reaches 3:1 against the page, the panel and the field fill in both modes.
const edgePairs = [
  { fg: '--a63-border-danger', bg: '--a63-surface-page', min: AA_UI },
  { fg: '--a63-border-danger', bg: '--a63-surface-panel', min: AA_UI },
  { fg: '--a63-border-danger', bg: '--a63-surface-control', min: AA_UI },
] as const

// Rating stars (rating.css) carry the score as graphics: an on star is filled in
// the warning accent, an off star is an outline in the input border colour.
// Both reach 3:1 against the page and the panel they sit on.
const ratingPairs = [
  { fg: '--a63-status-warning', bg: '--a63-surface-panel', min: AA_UI },
  { fg: '--a63-border-input', bg: '--a63-surface-page', min: AA_UI },
  { fg: '--a63-border-input', bg: '--a63-surface-panel', min: AA_UI },
] as const

const pairs = [...textPairs, ...actionPairs, ...statusPairs, ...edgePairs, ...ratingPairs] as const

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

function resolvePaintedColor(
  cssVar: string,
  as: 'color' | 'background',
  parent: HTMLElement = document.body
): string {
  const probe = document.createElement('div')
  if (as === 'color') {
    probe.style.color = `var(${cssVar})`
  } else {
    probe.style.backgroundColor = `var(${cssVar})`
  }
  parent.appendChild(probe)
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

  /* A custom property resolves its var() reads on the element that declares it,
     and descendants inherit the result. A UIProvider sets theme and mode on a
     nested element, so a token declared only on :root would keep the root's
     mode there. Resolve every pair inside such a scope, under a light root. */
  it('holds the same pairs inside a nested theme and mode scope', () => {
    const failures: string[] = []

    for (const theme of themes) {
      for (const mode of modes) {
        const scope = document.createElement('div')
        scope.setAttribute('data-a63-theme', theme)
        scope.setAttribute('data-a63-mode', mode)
        document.body.replaceChildren(scope)

        for (const { fg, bg, min } of pairs) {
          const fgCss = resolvePaintedColor(fg, 'color', scope)
          const bgCss = resolvePaintedColor(bg, 'background', scope)
          const ratio = contrastRatio(parseCssColor(fgCss), parseCssColor(bgCss))
          if (ratio < min) {
            failures.push(
              `${theme}/${mode} (nested) ${fg} on ${bg}: ${ratio.toFixed(2)}:1 < ${min}:1`
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
  // On-media labels in the dark zone of --a63-gradient-brand-fade: its lightest
  // color there is brand 700, the stop at the end of the zone.
  { fg: '--a63-on-media-foreground', bg: '--a63-brand-800', min: AA_TEXT },
  { fg: '--a63-on-media-foreground', bg: '--a63-brand-700', min: AA_TEXT },
  { fg: '--a63-text-accent', bg: '--a63-surface-page', min: AA_TEXT },
  // WCAG 1.4.11: a focus ring is the graphic that shows focus, so it reaches 3:1
  // against the field it surrounds and the page around it.
  { fg: '--a63-focus-ring', bg: '--a63-surface-page', min: AA_UI },
  { fg: '--a63-focus-ring', bg: '--a63-surface-panel', min: AA_UI },
  { fg: '--a63-focus-ring', bg: '--a63-surface-control', min: AA_UI },
  // WCAG 1.4.11: a form control's border is how a person finds the control, so it
  // reaches 3:1 against the page, the panel and the field fill.
  { fg: '--a63-border-input', bg: '--a63-surface-page', min: AA_UI },
  { fg: '--a63-border-input', bg: '--a63-surface-panel', min: AA_UI },
  { fg: '--a63-border-input', bg: '--a63-surface-control', min: AA_UI },
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

  it('keeps a selected item readable on every brand ramp', () => {
    const failures: string[] = []
    // The neutral selection (the default) and the opt-in accent selection.
    const pairs = [
      ['selected', '--a63-selected-background', '--a63-selected-foreground'],
      ['selected-accent', '--a63-selected-accent-background', '--a63-selected-accent-foreground'],
    ] as const
    for (const brand of brands) {
      root().setAttribute('data-a63-brand', brand)
      for (const theme of themes) {
        for (const mode of modes) {
          applyThemeMode(theme, mode)
          for (const [label, bgVar, fgVar] of pairs) {
            // A selection wash may be translucent: paint it over the page first.
            const page = parseCssColor(resolvePaintedColor('--a63-surface-page', 'background'))
            const washCss = resolvePaintedColor(bgVar, 'background')
            const wash = parseCssColor(washCss)
            const fill: Rgb = {
              r: wash.r * wash.a + page.r * (1 - wash.a),
              g: wash.g * wash.a + page.g * (1 - wash.a),
              b: wash.b * wash.a + page.b * (1 - wash.a),
              a: 1,
            }
            const fgCss = resolvePaintedColor(fgVar, 'color')
            const ratio = contrastRatio(parseCssColor(fgCss), fill)
            if (ratio < AA_TEXT) {
              failures.push(
                `${brand} ${theme}/${mode} ${label}: ${ratio.toFixed(2)}:1 < ${AA_TEXT}:1 (fg=${fgCss}, bg=${washCss})`
              )
            }
          }
        }
      }
    }
    expect(failures, failures.join('\n')).toEqual([])
  })
})

/* A UIProvider that passes only `brand` or only `surface` stamps that one
   attribute, under a mode set further up. Every role that reads the brand ramp or
   the neutral ramp must resolve there as it does on a scope that also sets the
   mode, and keep its contrast. */
const scopedRoles = [
  '--a63-text-accent',
  '--a63-focus-ring',
  '--a63-selected-accent-background',
  '--a63-choice-card-checked-border',
  '--a63-choice-card-checked-background',
  '--a63-surface-page',
  '--a63-surface-panel',
  '--a63-surface-control',
  '--a63-text-primary',
  '--a63-text-secondary',
  '--a63-border-subtle',
  '--a63-border-input',
] as const
const nestedAxes = [
  ['data-a63-brand', 'b3'],
  ['data-a63-surface', 'n3'],
] as const

describe('nested brand-only and surface-only scopes', () => {
  it('resolve the brand and neutral roles as a scope that also sets the mode', () => {
    const failures: string[] = []
    for (const theme of themes) {
      for (const mode of modes) {
        applyThemeMode(theme, mode)
        for (const [attribute, value] of nestedAxes) {
          const nested = document.createElement('div')
          nested.setAttribute(attribute, value)
          const reference = document.createElement('div')
          reference.setAttribute(attribute, value)
          reference.setAttribute('data-a63-theme', theme)
          reference.setAttribute('data-a63-mode', mode)
          document.body.replaceChildren(nested, reference)
          for (const role of scopedRoles) {
            const got = resolvePaintedColor(role, 'color', nested)
            const want = resolvePaintedColor(role, 'color', reference)
            if (got !== want) {
              failures.push(
                `${theme}/${mode} [${attribute}=${value}] ${role}: ${got}, want ${want}`
              )
            }
          }
        }
      }
    }
    expect(failures, failures.join('\n')).toEqual([])
  })

  it('hold the core pairs inside a nested brand-only and surface-only scope', () => {
    const failures: string[] = []
    for (const theme of themes) {
      for (const mode of modes) {
        applyThemeMode(theme, mode)
        for (const [attribute, value] of nestedAxes) {
          const scope = document.createElement('div')
          scope.setAttribute(attribute, value)
          document.body.replaceChildren(scope)
          for (const { fg, bg, min } of [...pairs, ...brandPairs]) {
            const fgCss = resolvePaintedColor(fg, 'color', scope)
            const bgCss = resolvePaintedColor(bg, 'background', scope)
            const ratio = contrastRatio(parseCssColor(fgCss), parseCssColor(bgCss))
            if (ratio < min) {
              failures.push(
                `${theme}/${mode} [${attribute}=${value}] ${fg} on ${bg}: ${ratio.toFixed(2)}:1 < ${min}:1`
              )
            }
          }
        }
      }
    }
    expect(failures, failures.join('\n')).toEqual([])
  })
})

/* The surface-tint slider (0-100%) bends the page, panel and muted surfaces toward
   the brand. The second and third text greys keep 4.5:1 on all three at every
   tint, on every brand, theme and mode. */
const tints = ['0%', '50%', '100%'] as const
const tintTextPairs = [
  ['--a63-text-secondary', '--a63-surface-page'],
  ['--a63-text-secondary', '--a63-surface-panel'],
  ['--a63-text-secondary', '--a63-surface-muted'],
  ['--a63-text-tertiary', '--a63-surface-page'],
  ['--a63-text-tertiary', '--a63-surface-panel'],
  ['--a63-text-tertiary', '--a63-surface-muted'],
] as const

describe('surface tint contrast (WCAG AA)', () => {
  afterEach(() => {
    root().removeAttribute('data-a63-brand')
    root().style.removeProperty('--a63-surface-tint')
  })

  it('keeps the secondary and tertiary text at 4.5:1 on tinted surfaces', () => {
    const failures: string[] = []
    for (const tint of tints) {
      root().style.setProperty('--a63-surface-tint', tint)
      for (const brand of brands) {
        root().setAttribute('data-a63-brand', brand)
        for (const theme of themes) {
          for (const mode of modes) {
            applyThemeMode(theme, mode)
            for (const [fg, bg] of tintTextPairs) {
              const fgCss = resolvePaintedColor(fg, 'color')
              const bgCss = resolvePaintedColor(bg, 'background')
              const ratio = contrastRatio(parseCssColor(fgCss), parseCssColor(bgCss))
              if (ratio < AA_TEXT) {
                failures.push(
                  `tint ${tint} ${brand} ${theme}/${mode} ${fg} on ${bg}: ${ratio.toFixed(2)}:1 < ${AA_TEXT}:1`
                )
              }
            }
          }
        }
      }
    }
    expect(failures, failures.join('\n')).toEqual([])
  })
})

/* A placeholder paints in the third text colour; it must read clearly below the
   value (primary text) in the same field, or an empty field reads as filled.
   Checked as the ratio of the two contrasts against the field fill, in every
   theme and mode and, for the brand-derived terminal ink, on every brand. */
const PLACEHOLDER_STEP = 1.3

describe('placeholder sits below the value', () => {
  afterEach(() => root().removeAttribute('data-a63-brand'))

  it('keeps text-tertiary a clear step below text-primary on the field fill', () => {
    const failures: string[] = []
    for (const brand of [undefined, ...brands]) {
      if (brand) root().setAttribute('data-a63-brand', brand)
      for (const theme of themes) {
        if (brand && theme !== 'terminal') continue
        for (const mode of modes) {
          /* Terminal dark is a single phosphor ink whose value text sits near
             4.5:1 on some brands, so no AA placeholder can sit a step below it. */
          if (theme === 'terminal' && mode === 'dark') continue
          applyThemeMode(theme, mode)
          for (const bg of ['--a63-surface-control', '--a63-surface-muted']) {
            const field = parseCssColor(resolvePaintedColor(bg, 'background'))
            const value = contrastRatio(
              parseCssColor(resolvePaintedColor('--a63-text-primary', 'color')),
              field
            )
            const placeholder = contrastRatio(
              parseCssColor(resolvePaintedColor('--a63-text-tertiary', 'color')),
              field
            )
            const where = `${brand ?? 'default'}/${theme}/${mode} on ${bg}`
            if (placeholder < AA_TEXT)
              failures.push(`${where}: placeholder ${placeholder.toFixed(2)}:1 < ${AA_TEXT}:1`)
            if (value / placeholder < PLACEHOLDER_STEP)
              failures.push(
                `${where}: value ${value.toFixed(2)}:1 vs placeholder ${placeholder.toFixed(2)}:1, step ${(value / placeholder).toFixed(2)} < ${PLACEHOLDER_STEP}`
              )
          }
        }
      }
    }
    expect(failures, failures.join('\n')).toEqual([])
  })
})
