import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { WidgetGrid, WidgetSizeProvider, useWidgetSize } from './widget-grid'

describe('WidgetGrid', () => {
  it('publishes column count and gap as custom properties', () => {
    render(
      <WidgetGrid data-testid="grid">
        <div />
      </WidgetGrid>
    )
    const grid = screen.getByTestId('grid').firstElementChild as HTMLElement
    expect(grid.style.getPropertyValue('--widget-cols')).toBe('2')
    expect(grid.style.getPropertyValue('--widget-gap')).toBe('12px')
  })

  it('honours explicit columns and gap', () => {
    render(
      <WidgetGrid columns={3} gap={8} data-testid="grid">
        <div />
      </WidgetGrid>
    )
    const grid = screen.getByTestId('grid').firstElementChild as HTMLElement
    expect(grid.style.getPropertyValue('--widget-cols')).toBe('3')
    expect(grid.style.getPropertyValue('--widget-gap')).toBe('8px')
  })

  it('uses explicit tracks so a span can never exceed the column count', () => {
    render(
      <WidgetGrid data-testid="grid">
        <div />
      </WidgetGrid>
    )
    const grid = screen.getByTestId('grid').firstElementChild as HTMLElement
    expect(grid.style.gridTemplateColumns).toBe('repeat(var(--widget-cols), minmax(0, 1fr))')
  })

  it('wraps the grid in a container so grid-auto-rows can resolve cqi', () => {
    render(
      <WidgetGrid data-testid="grid">
        <div />
      </WidgetGrid>
    )
    const wrapper = screen.getByTestId('grid')
    expect(wrapper.style.containerType).toBe('inline-size')
    expect((wrapper.firstElementChild as HTMLElement).style.gridAutoRows).toBe(
      'calc((100cqi - (var(--widget-cols) - 1) * var(--widget-gap)) / var(--widget-cols))'
    )
  })

  it('forwards ref to the grid element', () => {
    const ref = { current: null as HTMLDivElement | null }
    render(
      <WidgetGrid ref={ref}>
        <div />
      </WidgetGrid>
    )
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })
})

describe('useWidgetSize', () => {
  function Probe() {
    return <span>{useWidgetSize()}</span>
  }

  it('reports the provided size', () => {
    render(
      <WidgetSizeProvider size="medium">
        <Probe />
      </WidgetSizeProvider>
    )
    expect(screen.getByText('medium')).toBeInTheDocument()
  })

  it('defaults to small outside a provider', () => {
    render(<Probe />)
    expect(screen.getByText('small')).toBeInTheDocument()
  })
})
