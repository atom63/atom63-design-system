import { afterEach, describe, expect, it } from 'vitest'
import { root } from '../test/apply-styles'

/**
 * Chrome-signature guards for the widget surface.
 *
 * Every regression these cover shipped green through unit tests, typecheck,
 * lint and build, and was caught only by eye or by measuring a live browser:
 *
 * 1. `--a63-widget-shadow` composed `var(--a63-overlay-inner-shadow), …`, which
 *    resolves to `box-shadow: none, <shadow>` — invalid CSS, dropped whole. No
 *    theme's widget edge rendered at all.
 * 2. The Storybook audit stamped the theme on a NESTED cell, so every theme
 *    inherited the frozen `:root` string and rendered identically.
 * 3. The rim shipped alongside the face's border, producing two concentric
 *    rings on every tile.
 *
 * The theme goes on `documentElement` — which IS `:root` — so contract
 * declarations re-resolve per theme with no re-emission needed.
 */

const THEMES = ['modern', 'aqua', 'retro', 'terminal'] as const

/** Mirrors the shell/face split in WIDGET_RIM_SHELL_CLASS + WIDGET_CARD_SURFACE_CLASS. */
function renderSurface(kind?: 'weather') {
  const shell = document.createElement('div')
  shell.style.borderRadius = 'var(--a63-widget-radius)'
  // The rim is a BORDER, not padding — only a border follows border-radius, so a
  // per-side bevel mitres around the corner arc at any radius scale.
  shell.style.borderStyle = 'solid'
  shell.style.borderWidth = 'var(--a63-widget-rim-width)'
  shell.style.borderColor = 'var(--a63-widget-rim-border-color)'
  shell.style.backgroundColor = 'var(--a63-widget-rim-color)'
  shell.style.backgroundImage = 'var(--a63-widget-rim-image)'
  shell.style.backgroundOrigin = 'border-box'
  shell.style.boxShadow = 'var(--a63-widget-shadow)'

  const face = document.createElement('div')
  face.style.borderRadius =
    'calc(var(--a63-widget-radius, var(--radius-xl)) - var(--a63-widget-rim-width))'
  face.style.borderStyle = 'var(--a63-widget-border-style)'
  face.style.borderWidth = 'var(--a63-widget-border-width)'
  face.style.borderColor = 'var(--a63-widget-border-color)'

  if (kind) shell.setAttribute('data-widget-kind', kind)
  shell.appendChild(face)
  document.body.appendChild(shell)
  return { face, shell }
}

function signature(kind?: 'weather') {
  const { face, shell } = renderSurface(kind)
  const s = getComputedStyle(shell)
  const f = getComputedStyle(face)
  const sig = {
    boxShadow: s.boxShadow,
    faceBorderWidth: f.borderWidth,
    rimColor: s.borderColor,
    rimImage: s.backgroundImage,
    // The rim is a border, so its width lives here — NOT in padding.
    rimWidth: s.borderTopWidth,
  }
  shell.remove()
  return sig
}

function px(value: string): number {
  return Number.parseFloat(value) || 0
}

const RADIUS_SCALES = ['none', 'subtle', 'default', 'round'] as const

afterEach(() => {
  root().removeAttribute('data-a63-radius')
  root().removeAttribute('data-a63-theme')
  root().removeAttribute('data-a63-mode')
  root().classList.remove('dark', 'light')
  document.body.replaceChildren()
})

function useTheme(theme: string) {
  root().setAttribute('data-a63-theme', theme)
  root().setAttribute('data-a63-mode', 'dark')
  root().classList.add('dark')
}

describe('widget chrome signature', () => {
  it('renders a real box-shadow whenever the widget token defines one', () => {
    // Guards regression 1: `box-shadow: none, <shadow>` is invalid and drops the
    // whole declaration, so a themed edge silently disappears.
    //
    // Read --a63-widget-shadow, NOT --a63-overlay-shadow. The widget default is
    // deliberately flat (the rim is the tile's edge), so an overlay shadow does
    // not imply a widget shadow. What must never happen is the token carrying a
    // real value that computes to `none` — that is the composition bug.
    for (const theme of THEMES) {
      useTheme(theme)
      const token = getComputedStyle(root()).getPropertyValue('--a63-widget-shadow').trim()
      if (!token || token === 'none') continue
      expect(
        signature().boxShadow,
        `${theme}: --a63-widget-shadow is set but the widget resolved no shadow — check for a \`none\` composed into the list`
      ).not.toBe('none')
    }
  })

  it('gives each theme a distinct chrome signature', () => {
    // Guards regression 2: a frozen token makes every theme render identically.
    const seen = new Map<string, string>()
    for (const theme of THEMES) {
      useTheme(theme)
      const key = JSON.stringify(signature())
      const clash = seen.get(key)
      expect(clash, `${theme} and ${clash} resolve identical chrome — a token is frozen`).toBe(
        undefined
      )
      seen.set(key, theme)
    }
    expect(seen.size).toBe(THEMES.length)
  })

  it('draws exactly one edge — a rim or a border, never both', () => {
    // Guards regression 3: rim + face border read as two concentric rings.
    for (const theme of THEMES) {
      useTheme(theme)
      const { faceBorderWidth, rimWidth } = signature()
      expect(
        px(rimWidth) > 0 && px(faceBorderWidth) > 0,
        `${theme}: rim ${rimWidth} AND border ${faceBorderWidth} both paint — that is a double ring`
      ).toBe(false)
      expect(
        px(rimWidth) > 0 || px(faceBorderWidth) > 0,
        `${theme}: neither a rim nor a border — the tile has no edge`
      ).toBe(true)
    }
  })

  it('keeps the standard rim and shared shadow for weather', () => {
    // Weather specializes the FACE (condition artwork + foreground) but outer
    // chrome stays on the shared system — same rim and drop shadow as every
    // other tile.
    for (const theme of THEMES) {
      useTheme(theme)
      const standard = signature()
      const weather = signature('weather')
      expect(px(weather.rimWidth), `${theme}: weather must keep the shared rim`).toBe(
        px(standard.rimWidth)
      )
      expect(px(weather.rimWidth), `${theme}: weather rim must be present`).toBeGreaterThan(0)
      expect(
        px(weather.faceBorderWidth),
        `${theme}: weather with a rim must not also paint a face border`
      ).toBe(0)
      expect(weather.boxShadow, `${theme}: weather must keep the shared drop shadow`).toBe(
        standard.boxShadow
      )
    }
  })

  it('keeps the standard rim for location even when a weather tone is set', () => {
    // Location reuses weather FACE material via data-weather-tone; outer chrome
    // stays on the shared system for both Location and Weather.
    for (const theme of THEMES) {
      useTheme(theme)
      const { face, shell } = renderSurface()
      shell.setAttribute('data-widget-kind', 'location')
      shell.setAttribute('data-weather-tone', 'clear-day')
      const rimWidth = getComputedStyle(shell).borderTopWidth
      const faceBorderWidth = getComputedStyle(face).borderWidth
      shell.remove()

      expect(px(rimWidth), `${theme}: location must keep the shared rim`).toBeGreaterThan(0)
      expect(
        px(faceBorderWidth),
        `${theme}: location with a rim must not also paint a face border`
      ).toBe(0)
    }
  })

  it('keeps the rim concentric across the whole radius axis', () => {
    // Radius is a personalization control, so chrome must CONSUME the radius
    // tokens rather than assume each theme's default. Retro previously used
    // rectangular edge strips, which a rounded corner exposed as a broken frame —
    // and previewing retro only at its square default hid that.
    for (const theme of THEMES) {
      for (const scale of RADIUS_SCALES) {
        useTheme(theme)
        root().setAttribute('data-a63-radius', scale)

        const { face, shell } = renderSurface()
        const outer = px(getComputedStyle(shell).borderTopLeftRadius)
        const inner = px(getComputedStyle(face).borderTopLeftRadius)
        const rim = px(getComputedStyle(shell).borderTopWidth)
        const pad = px(getComputedStyle(shell).paddingTop)
        shell.remove()

        expect(
          rim,
          `${theme}/${scale}: the rim must be a border — only a border follows border-radius`
        ).toBeGreaterThan(0)
        expect(pad, `${theme}/${scale}: the rim must not be padding`).toBe(0)
        expect(
          inner,
          `${theme}/${scale}: face radius ${inner} should be outer ${outer} less the ${rim} rim`
        ).toBeCloseTo(Math.max(0, outer - rim), 1)
      }
    }
  })

  it("mitres retro's bevel per side so it survives a rounded corner", () => {
    useTheme('retro')
    root().setAttribute('data-a63-radius', 'round')
    const { shell } = renderSurface()
    const cs = getComputedStyle(shell)
    const top = cs.borderTopColor
    const bottom = cs.borderBottomColor
    shell.remove()

    expect(top, 'retro: the bevel needs a lit top edge').not.toBe('rgba(0, 0, 0, 0)')
    expect(
      top,
      'retro: top and bottom must differ — that difference IS the bevel, and as a border it mitres around the arc'
    ).not.toBe(bottom)
  })
})
