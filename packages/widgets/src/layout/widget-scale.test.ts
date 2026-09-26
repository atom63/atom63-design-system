import { describe, expect, it } from 'vitest'
import { widgetPresentationStyle, widgetSizeStyle, widgetUnitStyle } from './widget-scale'

describe('widgetSizeStyle', () => {
  it('spans one column and one row for small', () => {
    const style = widgetSizeStyle('small')
    expect(style.gridColumn).toBe('span 1')
    expect(style.gridRow).toBe('span 1')
    expect(style['--widget-span']).toBe('1')
    expect(style['--widget-rows']).toBe('1')
  })

  it('spans two columns and one row for medium', () => {
    const style = widgetSizeStyle('medium')
    expect(style.gridColumn).toBe('span 2')
    expect(style.gridRow).toBe('span 1')
    expect(style['--widget-span']).toBe('2')
  })

  it('spans two columns and two rows for large', () => {
    const style = widgetSizeStyle('large')
    expect(style.gridColumn).toBe('span 2')
    expect(style.gridRow).toBe('span 2')
    expect(style['--widget-rows']).toBe('2')
  })

  it('derives the cell width by dividing out the span and inter-cell gaps', () => {
    expect(widgetSizeStyle('medium')['--widget-cell']).toBe(
      'calc((100cqi - (var(--widget-span) - 1) * var(--widget-gap, 0px)) / var(--widget-span))'
    )
  })

  it('allows proportional enlargement above the canonical OS63 cell', () => {
    expect(widgetSizeStyle('small')['--widget-raw-u']).toBe(
      'min(calc(var(--widget-cell) / 256 * var(--widget-scale, 1)), 1.009765625px)'
    )
    expect(widgetSizeStyle('small')['--widget-u']).toBe('var(--widget-raw-u)')
  })

  it('adds a lower bound only when minScale is supplied', () => {
    expect(widgetSizeStyle('small', { minScale: 0.7 })['--widget-raw-u']).toBe(
      'clamp(0.7px, calc(var(--widget-cell) / 256 * var(--widget-scale, 1)), 1.009765625px)'
    )
  })

  it('fills its grid row with a percentage height, never a cqi-derived one', () => {
    const style = widgetSizeStyle('large')
    expect(style.height).toBe('100%')
    // A cqi-derived height would resolve against the tile's own @container and break.
    expect(String(style.height)).not.toContain('cqi')
  })

  it('applies the density preset and the scale multiplier independently', () => {
    expect(widgetSizeStyle('small', { density: 'compact' })['--widget-scale']).toBe('0.9')
    expect(widgetSizeStyle('small', { scale: 2 })['--widget-scale']).toBe('2')
  })

  it('keeps the resolved scale free of floating-point artifacts', () => {
    expect(widgetSizeStyle('small', { density: 'comfortable', scale: 3 })['--widget-scale']).toBe(
      '3.3'
    )
  })
})

describe('widgetUnitStyle', () => {
  it('publishes the design unit from a known cell width, with no grid placement', () => {
    const style = widgetUnitStyle(188)
    expect(style['--widget-cell']).toBe('188px')
    expect(style['--widget-raw-u']).toBe(
      'min(calc(var(--widget-cell) / 256 * var(--widget-scale, 1)), 1.009765625px)'
    )
    expect(style['--widget-u']).toBe('var(--widget-raw-u)')
    // The desktop owns the tile box; emitting span/placement would fight it.
    expect(style).not.toHaveProperty('gridColumn')
    expect(style).not.toHaveProperty('gridRow')
    expect(style).not.toHaveProperty('--widget-span')
  })

  it('resolves the same unit expression widgetSizeStyle uses', () => {
    expect(widgetUnitStyle(188)['--widget-raw-u']).toBe(widgetSizeStyle('small')['--widget-raw-u'])
  })

  it('applies density and scale the same way', () => {
    expect(widgetUnitStyle(188, { density: 'compact' })['--widget-scale']).toBe('0.9')
    expect(widgetUnitStyle(188, { scale: 2 })['--widget-scale']).toBe('2')
  })
})

describe('widgetPresentationStyle', () => {
  it('keeps the canonical cell at 100% canvas scale', () => {
    expect(widgetPresentationStyle(188)['--widget-presentation-scale']).toBe('1')
  })

  it('shrinks sub-canonical cells proportionally', () => {
    expect(widgetPresentationStyle(165)['--widget-presentation-scale']).toBe('0.8776595744680851')
  })

  it('enlarges the atom63.io reference cell proportionally', () => {
    expect(widgetPresentationStyle(258)['--widget-presentation-scale']).toBe('1.372340425531915')
  })

  it('defaults to the canonical scale until WidgetViewport measures its host', () => {
    const style = widgetPresentationStyle()
    expect(style['--widget-presentation-scale']).toBe('1')
    expect(style['--widget-interaction-target']).toBe(
      'calc(44px / var(--widget-presentation-scale))'
    )
  })

  // A host whose viewport element is a flex container would otherwise shrink the
  // canvas to the host box BEFORE the transform scales it, so a sub-canonical
  // cell rendered a 1×1 tile as cell × scale instead of square.
  it('refuses to be shrunk by a flex host', () => {
    expect(widgetPresentationStyle(165).flexShrink).toBe(0)
  })
})

describe('in-widget control ergonomics', () => {
  // A coarse pointer raises the shared floor to 44px, which control recipes
  // apply to RENDERED height. Inside a fixed-proportion tile that inflation is
  // taken out of the composition, so every widget root pins the floor back to
  // the 24px minimum and reaches 44 through --widget-interaction-target.
  it('pins the control floor to the physical minimum on every widget root', () => {
    for (const style of [widgetSizeStyle('small'), widgetUnitStyle(188)]) {
      expect(style['--a63-control-min-target']).toBe('24px')
      expect(style['--a63-control-min-target-lg']).toBe('24px')
      expect(style['--a63-control-min-target-xl']).toBe('24px')
    }
  })

  it('divides the floor out of the presentation transform so 24px stays physical', () => {
    const style = widgetPresentationStyle(258)
    expect(style['--a63-control-min-target']).toBe('calc(24px / var(--widget-presentation-scale))')
    expect(style['--a63-control-min-target-xl']).toBe(
      'calc(24px / var(--widget-presentation-scale))'
    )
  })
})
