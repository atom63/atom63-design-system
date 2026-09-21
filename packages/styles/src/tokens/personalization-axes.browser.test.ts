import { afterEach, describe, expect, it } from 'vitest'
import { cssVar, resetRoot, root } from '../test/apply-styles'

afterEach(resetRoot)

describe('@atom63/styles cascade harness', () => {
  it('applies the foundation: --radius-multiplier defaults to 1', () => {
    expect(cssVar('--radius-multiplier')).toBe('1')
  })
})

describe('radius scale axis', () => {
  it('maps each [data-a63-radius] value to --radius-multiplier', () => {
    const el = root()
    const cases: Array<[string, string]> = [
      ['none', '0'],
      ['subtle', '0.5'],
      ['default', '1'],
      ['round', '1.5'],
    ]
    for (const [value, expected] of cases) {
      el.setAttribute('data-a63-radius', value)
      expect(cssVar('--radius-multiplier')).toBe(expected)
    }
  })

  it('re-resolves the derived --radius-lg when the multiplier changes', () => {
    root().setAttribute('data-a63-radius', 'none')
    // Custom properties are only substituted, not calc-evaluated, until consumed
    // by a real property — so resolve --radius-lg through an element's border-radius.
    const probe = document.createElement('div')
    probe.style.borderRadius = 'var(--radius-lg)'
    document.body.appendChild(probe)
    // --radius-lg = corner-radius(10px) * multiplier(0) => 0px
    expect(getComputedStyle(probe).borderRadius).toBe('0px')
    probe.remove()
  })

  it('keeps --radius-full on the scale curve (2× xl), not a fixed 9999px pill', () => {
    const probe = document.createElement('div')
    probe.style.borderRadius = 'var(--radius-full)'
    document.body.appendChild(probe)

    // default: xl = 10 * 1.4 * 1 = 14px → full = 28px
    expect(getComputedStyle(probe).borderRadius).toBe('28px')

    root().setAttribute('data-a63-radius', 'none')
    expect(getComputedStyle(probe).borderRadius).toBe('0px')

    root().setAttribute('data-a63-radius', 'round')
    // xl = 10 * 1.4 * 1.5 = 21px → full = 42px
    expect(getComputedStyle(probe).borderRadius).toBe('42px')
    probe.remove()
  })

  it('keeps avatar radius circular by default while still following the radius axis', () => {
    const probe = document.createElement('div')
    probe.style.borderRadius = 'var(--a63-avatar-radius)'
    document.body.appendChild(probe)

    expect(getComputedStyle(probe).borderRadius).toBe('50%')

    root().setAttribute('data-a63-radius', 'none')
    expect(getComputedStyle(probe).borderRadius).toBe('0px')

    root().setAttribute('data-a63-radius', 'subtle')
    expect(getComputedStyle(probe).borderRadius).toBe('14px')

    root().setAttribute('data-a63-radius', 'round')
    expect(getComputedStyle(probe).borderRadius).toBe('50%')
    probe.remove()
  })
})

describe('type scale axis', () => {
  it('maps each [data-a63-type-scale] value to --typography-scale', () => {
    const el = root()
    const cases: Array<[string, string]> = [
      ['compact', '0.9'],
      ['normal', '1'],
      ['comfortable', '1.1'],
      ['large', '1.2'],
    ]
    for (const [value, expected] of cases) {
      el.setAttribute('data-a63-type-scale', value)
      expect(cssVar('--typography-scale')).toBe(expected)
    }
  })

  it('re-resolves a derived type token when the scale changes', () => {
    root().setAttribute('data-a63-type-scale', 'compact')
    // Custom props aren't calc-evaluated until consumed by a real property, so
    // resolve --typography-base-font-size through an element's font-size.
    const probe = document.createElement('div')
    probe.style.fontSize = 'var(--typography-base-font-size)'
    document.body.appendChild(probe)
    // base font-size 15px * 0.9 = 13.5px
    expect(getComputedStyle(probe).fontSize).toBe('13.5px')
    probe.remove()
  })
})

describe('font family axis', () => {
  it('defaults --a63-font-app to the sans stack', () => {
    expect(cssVar('--a63-font-app')).toContain('Geist')
  })

  it('remaps --a63-font-app per [data-a63-font]', () => {
    const el = root()
    el.setAttribute('data-a63-font', 'serif')
    expect(cssVar('--a63-font-app')).toContain('Brawler')

    el.setAttribute('data-a63-font', 'mono')
    expect(cssVar('--a63-font-app')).toContain('Geist Mono')

    el.setAttribute('data-a63-font', 'pixel')
    // Pixel resolves to Doto (Google Fonts) — the self-hosted Geist Pixel faces
    // were retired when the apps moved their pixel axis to Doto.
    expect(cssVar('--a63-font-app')).toContain('Doto')
  })
})

describe('os axis', () => {
  it('defaults to macOS window-action geometry on :root', () => {
    expect(cssVar('--a63-os-window-action-width')).toBe('1.5rem')
    expect(cssVar('--a63-os-window-action-gap')).toBe('0.5rem')
    expect(cssVar('--a63-os-window-control-style')).toBe('traffic')
    // Compat alias for OS63 chrome
    expect(cssVar('--os-window-action-width')).toBe('1.5rem')
  })

  it('applies Windows caption geometry under [data-a63-os=windows]', () => {
    const el = root()
    el.setAttribute('data-a63-os', 'windows')
    expect(cssVar('--a63-os-window-action-width')).toBe('2.875rem')
    expect(cssVar('--a63-os-window-action-height')).toBe('100%')
    expect(cssVar('--a63-os-window-action-gap')).toBe('0rem')
    expect(cssVar('--a63-os-window-action-indicator-size')).toBe('100%')
    expect(cssVar('--a63-os-window-control-style')).toBe('caption')
    expect(cssVar('--os-window-action-width')).toBe('2.875rem')
    expect(cssVar('--os-launcher-height')).toBe('3rem')
    expect(cssVar('--a63-os-flyout-width-start-menu')).toBe('42rem')
    expect(cssVar('--os-flyout-width-start-menu')).toBe('42rem')
    expect(cssVar('--a63-os-caption-close-foreground')).not.toBe('')
  })

  it('restates macOS under [data-a63-os=macos]', () => {
    const el = root()
    el.setAttribute('data-a63-os', 'windows')
    el.setAttribute('data-a63-os', 'macos')
    expect(cssVar('--a63-os-window-action-width')).toBe('1.5rem')
    expect(cssVar('--a63-os-control-side')).toBe('left')
  })
})

describe('auto brand ramp', () => {
  it('falls back to the b1 ramp when no --color-auto-* is set', () => {
    const el = root()
    el.setAttribute('data-a63-brand', 'auto')
    // --a63-action-primary = --a63-brand-500 = var(--color-auto-500, var(--color-b1-500))
    const primary = cssVar('--a63-action-primary')
    const b1 = getComputedStyle(el).getPropertyValue('--color-b1-500').trim()
    expect(primary).toBe(b1)
    expect(primary).not.toBe('')
  })

  it('uses the extracted --color-auto ramp when present', () => {
    const el = root()
    el.setAttribute('data-a63-brand', 'auto')
    el.style.setProperty('--color-auto-500', 'rgb(10, 20, 30)')
    expect(cssVar('--a63-action-primary')).toBe('rgb(10, 20, 30)')
  })
})

describe('design language axis', () => {
  /**
   * Resolve a control token through a real property — custom properties are
   * substituted, not calc-evaluated, until something consumes them.
   */
  function resolvedHeight(size: string): string {
    const probe = document.createElement('div')
    probe.style.height = `var(--a63-control-height-${size})`
    document.body.appendChild(probe)
    const value = getComputedStyle(probe).height
    probe.remove()
    return value
  }

  it('leaves the control ramp on the web defaults when unset', () => {
    expect(resolvedHeight('xs')).toBe('24px')
    expect(resolvedHeight('md')).toBe('32px')
    expect(cssVar('--a63-control-font-weight')).toBe('500')
  })

  it('actually applies the iOS control ramp', () => {
    // Regression guard: [data-a63-design-language] and control.css's `:root`
    // have the SAME (0,1,0) specificity, so this only works while contracts/
    // index.css imports control.css BEFORE environment.css. When that order was
    // reversed the entire iOS design language was silently inert.
    root().setAttribute('data-a63-design-language', 'ios')

    expect(resolvedHeight('xs')).toBe('36px')
    expect(resolvedHeight('sm')).toBe('40px')
    expect(resolvedHeight('md')).toBe('44px')
    expect(resolvedHeight('lg')).toBe('48px')
    expect(resolvedHeight('xl')).toBe('52px')
    expect(cssVar('--a63-control-font-weight')).toBe('600')
    expect(cssVar('--a63-control-press-transform')).toBe('scale(0.97)')
  })

  it('tightens row block padding so rows land on the control ramp', () => {
    // Web rows pad their way to height; iOS rows let the ramp floor them, which
    // lands rows on the heights measured in shipping iOS apps (~44pt single
    // line, ~59pt two-line). Apple publishes no iOS row height.
    const probe = document.createElement('div')
    probe.style.height = 'var(--a63-row-padding-block-md)'
    document.body.appendChild(probe)
    expect(getComputedStyle(probe).height).toBe('16px')

    root().setAttribute('data-a63-design-language', 'ios')
    expect(getComputedStyle(probe).height).toBe('8px')
    probe.remove()
  })
})

describe('input axis', () => {
  it('separates the rendered floor from the interaction floor on touch', () => {
    // Raising rendered geometry to the touch target is what collapsed xs/sm/md
    // to a single 44px rung on every phone. See web-ios-token-parity.md.
    root().setAttribute('data-a63-input', 'touch')
    expect(cssVar('--a63-control-min-size')).toBe('2rem')
    expect(cssVar('--a63-control-min-target')).toBe('2.75rem')
  })

  it('drops both floors back to the pointer minimum', () => {
    root().setAttribute('data-a63-input', 'pointer')
    expect(cssVar('--a63-control-min-size')).toBe('1.5rem')
    expect(cssVar('--a63-control-min-target')).toBe('1.5rem')
  })
})
