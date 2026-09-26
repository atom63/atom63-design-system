import { describe, expect, it } from 'vitest'

import { declarations, readStylesheet, STYLESHEETS } from './test/css'

describe('@atom63/widgets/styles.css', () => {
  it('imports every stylesheet into the components layer', () => {
    const entry = readStylesheet('styles.css')

    for (const name of STYLESHEETS) {
      expect(entry).toContain(`@import './${name}.css' layer(components);`)
    }
  })

  it('draws the surface from the widget contract tokens', () => {
    expect(declarations('.a63-WidgetSurface')).toMatchObject({
      'border-width': 'var(--a63-widget-rim-width)',
      'border-color': 'var(--a63-widget-rim-border-color)',
      'border-radius': 'var(--a63-widget-radius)',
      'background-color': 'var(--a63-widget-rim-color)',
      'background-image': 'var(--a63-widget-rim-image)',
      'background-origin': 'border-box',
      'box-shadow': 'var(--a63-widget-shadow)',
      'backdrop-filter': 'var(--a63-widget-rim-backdrop)',
    })
    expect(declarations('.a63-WidgetSurface-face')).toMatchObject({
      'border-radius':
        'calc(var(--a63-widget-radius, var(--radius-xl)) - var(--a63-widget-rim-width))',
      color: 'var(--a63-widget-foreground)',
    })
    expect(declarations('.a63-WidgetSurface-face::before')).toMatchObject({
      'background-color': 'var(--a63-widget-background-color)',
      'backdrop-filter': 'var(--a63-widget-backdrop)',
      'z-index': 'var(--z-layer-below)',
    })
  })

  it('keeps the face unpositioned, so a host can position it', () => {
    expect(declarations('.a63-WidgetSurface-face').position).toBeUndefined()
    expect(declarations('.a63-WidgetSurface-body').position).toBe('relative')
  })

  it('resets the margins and button chrome it cannot inherit from a preflight', () => {
    expect(declarations('.a63-WidgetStateFeedback-title').margin).toBe('0')
    expect(declarations('.a63-WidgetStateFeedback-description').margin).toBe('0')
    expect(declarations('.a63-WidgetAvatar-shuffle')).toMatchObject({
      margin: '0',
      padding: '0',
      border: '0',
    })
  })

  it('draws focus rings on :focus-visible only', () => {
    for (const name of STYLESHEETS) {
      expect(readStylesheet(`${name}.css`)).not.toMatch(/:focus(?![-\w])/)
    }
    expect(declarations('.a63-WidgetAvatar-shuffle:focus-visible').outline).toContain(
      'var(--a63-on-media-ring)'
    )
  })

  it('stops the spinners under reduced motion', () => {
    expect(readStylesheet('runtime/widget-runtime.css')).toMatch(
      /prefers-reduced-motion: reduce\)\s*\{\s*\.a63-Widget-spin\s*\{\s*animation: none;/
    )
  })
})
