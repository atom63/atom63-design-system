import { render, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { declarations } from '../test/css'
import { useWidgetSurfaceSize, WidgetSurface } from './widget-surface'
import { WIDGET_CARD_SURFACE_CLASS, WIDGET_RIM_SHELL_CLASS } from './widget-surface-classes'

function surface(container: HTMLElement): Element | null {
  return container.querySelector('[data-widget-surface]')
}

/**
 * Every surface nests a face inside the rim shell. The face is where the
 * material and the consumer className live.
 */
function face(container: HTMLElement): Element | null {
  return surface(container)?.firstElementChild ?? null
}

describe('WidgetSurface', () => {
  it('applies the themed widget chrome on the face', () => {
    const { container } = render(<WidgetSurface size="large">x</WidgetSurface>)
    const el = face(container)
    expect(el).toHaveClass(WIDGET_CARD_SURFACE_CLASS, 'a63-WidgetSurface-body')
    expect(declarations('.a63-WidgetSurface-face::before')['background-color']).toBe(
      'var(--a63-widget-background-color)'
    )
  })

  it('wraps the face in a rim shell carrying the rim border and drop shadow', () => {
    const { container } = render(<WidgetSurface size="large">x</WidgetSurface>)
    const shell = surface(container)
    expect(shell).toHaveClass(WIDGET_RIM_SHELL_CLASS)
    expect(declarations('.a63-WidgetSurface')).toMatchObject({
      'border-width': 'var(--a63-widget-rim-width)',
      'background-color': 'var(--a63-widget-rim-color)',
      'background-image': 'var(--a63-widget-rim-image)',
      'box-shadow': 'var(--a63-widget-shadow)',
    })
    expect(face(container)).not.toBe(shell)
  })

  it('exports the stylesheet class names as the surface class constants', () => {
    expect(WIDGET_RIM_SHELL_CLASS).toBe('a63-WidgetSurface')
    expect(WIDGET_CARD_SURFACE_CLASS).toBe('a63-WidgetSurface-face')
  })

  it('routes consumer className to the face, not the shell', () => {
    const { container } = render(
      <WidgetSurface size="large" className="custom-class">
        x
      </WidgetSurface>
    )
    expect(face(container)).toHaveClass('custom-class')
    expect(surface(container)).not.toHaveClass('custom-class')
  })

  it('echoes overflow escape hatches onto the shell so content can spill', () => {
    const { container } = render(
      <WidgetSurface size="large" className="overflow-visible">
        x
      </WidgetSurface>
    )
    expect(surface(container)).toHaveClass('overflow-visible')
    expect(surface(container)).not.toHaveClass('overflow-hidden')
    expect(face(container)).toHaveClass('overflow-visible')
  })

  it('moves box-sizing classes to the shell so the widget itself is sized', () => {
    // Regression: `w-80` left on the face constrained the material to 320px while
    // the shell still stretched to its parent, leaving dead space along one edge.
    const { container } = render(
      <WidgetSurface size="large" className="w-80">
        x
      </WidgetSurface>
    )
    expect(surface(container)).toHaveClass('w-80')
    expect(face(container)).not.toHaveClass('w-80')
  })

  it('splits a mixed className between the boxes each part belongs to', () => {
    const { container } = render(
      <WidgetSurface size="large" className="flex size-full min-h-0 flex-col">
        x
      </WidgetSurface>
    )
    // Box sizing goes out to the shell. The face always fills the shell through
    // its own stylesheet class, so the meaningful assertion is that the shell
    // gained it.
    expect(surface(container)).toHaveClass('size-full')
    // ...display and direction stay with the children...
    expect(face(container)).toHaveClass('flex', 'flex-col')
    expect(surface(container)).not.toHaveClass('flex-col')
    // ...and flex-item sizing applies to both, since each box is an item of the
    // one above it and `min-h-0` on the face is load-bearing for inner scrolling.
    expect(surface(container)).toHaveClass('min-h-0')
    expect(face(container)).toHaveClass('min-h-0')
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <WidgetSurface size="medium">
        <p>Surface content</p>
      </WidgetSurface>
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('stamps the provided size', () => {
    const { container } = render(<WidgetSurface size="medium">x</WidgetSurface>)
    expect(surface(container)?.getAttribute('data-widget-surface-size')).toBe('medium')
  })

  it('passes through arbitrary data attributes', () => {
    const { container } = render(
      <WidgetSurface size="large" data-foo="bar">
        x
      </WidgetSurface>
    )
    expect(surface(container)?.getAttribute('data-foo')).toBe('bar')
  })

  it('does not leak size/variant props onto the DOM', () => {
    const { container } = render(<WidgetSurface size="large">x</WidgetSurface>)
    const el = surface(container)
    expect(el?.hasAttribute('size')).toBe(false)
    expect(el?.hasAttribute('variant')).toBe(false)
  })
})

describe('useWidgetSurfaceSize', () => {
  it('returns the surrounding surface size', () => {
    const { result } = renderHook(() => useWidgetSurfaceSize(), {
      wrapper: ({ children }) => <WidgetSurface size="large">{children}</WidgetSurface>,
    })
    expect(result.current).toBe('large')
  })

  it('returns undefined outside a surface', () => {
    const { result } = renderHook(() => useWidgetSurfaceSize())
    expect(result.current).toBeUndefined()
  })
})
