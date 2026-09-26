import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useWidgetSize } from './widget-grid'
import { WidgetViewport } from './widget-viewport'

describe('WidgetViewport', () => {
  it('publishes canonical footprint geometry and design units', () => {
    render(
      <WidgetViewport data-testid="viewport" size="medium">
        <div />
      </WidgetViewport>
    )

    const viewport = screen.getByTestId('viewport')
    expect(viewport).toHaveAttribute('data-widget-viewport-size', 'medium')
    expect(viewport.style.gridColumn).toBe('span 2')
    expect(viewport.style.gridRow).toBe('span 1')
    expect(viewport.style.getPropertyValue('--widget-span')).toBe('2')
    expect(viewport.style.getPropertyValue('--widget-raw-u')).toContain('var(--widget-cell)')
    expect(viewport.style.getPropertyValue('--widget-u')).toBe('var(--widget-raw-u)')
    expect(viewport.querySelector('[data-widget-presentation-canvas]')).toHaveStyle({
      transform: 'scale(var(--widget-presentation-scale))',
    })
  })

  it('publishes the footprint to descendants', () => {
    function Probe() {
      return <span>{useWidgetSize()}</span>
    }

    render(
      <WidgetViewport size="large">
        <Probe />
      </WidgetViewport>
    )

    expect(screen.getByText('large')).toBeInTheDocument()
  })

  it('lets explicit host styles extend the canonical geometry', () => {
    render(
      <WidgetViewport data-testid="viewport" size="small" style={{ opacity: 0.5 }}>
        <div />
      </WidgetViewport>
    )

    expect(screen.getByTestId('viewport')).toHaveStyle({ opacity: '0.5' })
    expect(screen.getByTestId('viewport').style.gridColumn).toBe('span 1')
  })
})
