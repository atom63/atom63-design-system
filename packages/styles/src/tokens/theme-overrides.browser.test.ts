import { afterEach, describe, expect, it } from 'vitest'
import { cssVar, root } from '../test/apply-styles'

afterEach(() => {
  document.documentElement.removeAttribute('data-a63-theme')
  document.documentElement.removeAttribute('data-a63-mode')
  document.documentElement.removeAttribute('data-a63-brand')
  document.documentElement.classList.remove('dark', 'light')
})

describe('weather widget contract', () => {
  it('defaults to the live semantic condition material', () => {
    const probe = document.createElement('div')
    probe.dataset.widgetKind = 'weather'
    probe.dataset.weatherTone = 'clear-night'
    document.body.appendChild(probe)

    expect(getComputedStyle(probe).getPropertyValue('--a63-widget-background-image')).toContain(
      'linear-gradient'
    )
    probe.remove()
  })

  it('adjusts the same live condition for light and dark modes', () => {
    const shell = document.createElement('div')
    const probe = document.createElement('div')
    probe.dataset.widgetKind = 'weather'
    probe.dataset.weatherTone = 'clear-night'
    shell.appendChild(probe)
    document.body.appendChild(shell)

    shell.className = 'light'
    const light = getComputedStyle(probe).getPropertyValue(
      '--a63-weather-condition-background-image'
    )
    shell.className = 'dark'
    const dark = getComputedStyle(probe).getPropertyValue(
      '--a63-weather-condition-background-image'
    )

    expect(light).not.toBe(dark)
    shell.remove()
  })

  it('gives each expressive theme an authored weather material', () => {
    const values = new Set<string>()

    for (const theme of ['aqua', 'retro', 'terminal']) {
      root().setAttribute('data-a63-theme', theme)
      root().setAttribute('data-a63-mode', 'dark')
      root().classList.add('dark')
      values.add(cssVar('--a63-weather-background-image'))
    }

    expect(values.size).toBe(3)
    expect(values).not.toContain('')
  })
})

describe('theme archetype overrides win over the base contract', () => {
  it('a theme sets --a63-control-shadow (not clobbered to none by contracts)', () => {
    root().setAttribute('data-a63-theme', 'aqua')
    const shadow = cssVar('--a63-control-shadow')
    expect(shadow).not.toBe('none')
    expect(shadow).not.toBe('')
  })

  it('terminal overrides --a63-control-shadow distinctly from aqua', () => {
    root().setAttribute('data-a63-theme', 'aqua')
    const aqua = cssVar('--a63-control-shadow')
    root().setAttribute('data-a63-theme', 'terminal')
    const terminal = cssVar('--a63-control-shadow')
    expect(terminal).not.toBe(aqua)
  })
})

describe('theme-private material under data-a63-theme', () => {
  it('exposes the shared blur ladder on the foundation path', () => {
    expect(cssVar('--blur-lg')).toBe('16px')
    expect(cssVar('--blur-xl')).toBe('24px')
  })

  it('aqua backdrops use shared frost blur and skin-only gel blur', () => {
    root().setAttribute('data-a63-theme', 'aqua')
    expect(cssVar('--a63-surface-backdrop')).toContain('16px')
    expect(cssVar('--a63-overlay-backdrop')).toContain('20px')
    expect(cssVar('--a63-widget-rim-backdrop')).toContain('20px')
    expect(cssVar('--a63-surface-backdrop')).toContain('saturate(1.4)')
    expect(cssVar('--a63-overlay-backdrop')).toContain('saturate(1.6)')
  })

  it('modern sets tactile inset control/field shadows', () => {
    root().setAttribute('data-a63-theme', 'modern')
    expect(cssVar('--a63-control-shadow')).toContain('inset')
    expect(cssVar('--a63-control-shadow-active')).toContain('inset')
    expect(cssVar('--a63-field-shadow')).toContain('inset')
    expect(cssVar('--a63-segment-selected-shadow')).toContain('inset')
  })

  it('aqua sets gel control shadows and a wide focus ring', () => {
    root().setAttribute('data-a63-theme', 'aqua')
    expect(cssVar('--a63-control-focus-ring-width')).toBe('4px')
    expect(cssVar('--a63-control-shadow')).toContain('inset')
    expect(cssVar('--a63-field-shadow')).toContain('inset')
    expect(cssVar('--a63-overlay-shadow')).toContain('12px')
    expect(cssVar('--a63-segment-selected-shadow')).toContain('inset')
  })

  it('aqua dark mode uses a quieter segment press stack', () => {
    root().setAttribute('data-a63-theme', 'aqua')
    const lightSelected = cssVar('--a63-segment-selected-shadow')
    root().setAttribute('data-a63-mode', 'dark')
    root().classList.add('dark')
    const darkSelected = cssVar('--a63-segment-selected-shadow')
    expect(darkSelected).not.toBe(lightSelected)
    expect(darkSelected).toContain('inset')
  })

  it('retro sets chunky bevel chrome', () => {
    root().setAttribute('data-a63-theme', 'retro')
    expect(cssVar('--a63-control-border-width')).toBe('2px')
    expect(cssVar('--a63-control-focus-ring-width')).toBe('2px')
    expect(cssVar('--a63-control-shadow')).toContain('inset')
    expect(cssVar('--a63-widget-shadow')).toContain('3px')
    expect(cssVar('--a63-surface-border-style')).toBe('outset')
  })

  it('terminal CRT glows track brand on the theme scope', () => {
    root().setAttribute('data-a63-theme', 'terminal')
    root().setAttribute('data-a63-brand', 'b1')
    const b1Control = cssVar('--a63-control-shadow')
    expect(b1Control).toContain('inset')
    expect(cssVar('--a63-field-shadow')).toContain('inset')
    expect(cssVar('--a63-widget-shadow')).toContain('20px')

    root().setAttribute('data-a63-brand', 'b3')
    const b3Control = cssVar('--a63-control-shadow')
    expect(b3Control).not.toBe(b1Control)
  })
})
