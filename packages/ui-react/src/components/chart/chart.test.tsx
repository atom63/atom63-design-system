import { chartContract } from '@atom63/ui-foundation'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { Chart, chartTicks } from './chart'

const categories = ['Jan', 'Feb', 'Mar']
const series = [
  { label: 'New', values: [10, 20, 30] },
  { label: 'Churned', values: [5, 5, 10] },
]

describe('Chart', () => {
  it('renders a named figure with the contract defaults', () => {
    const { container } = render(
      <Chart
        categories={categories}
        description="New revenue grows every month."
        label="MRR movement"
        series={series}
      />
    )
    const figure = screen.getByRole('figure', { name: 'MRR movement' })
    expect(figure).toHaveAttribute('data-type', chartContract.defaultType)
    expect(figure).toHaveAttribute('data-size', chartContract.defaultSize)
    expect(figure).toHaveAccessibleDescription('New revenue grows every month.')
    expect(container.querySelectorAll('[data-slot="chart-legend"] li')).toHaveLength(2)
  })

  it('carries a data table with the same numbers', () => {
    render(
      <Chart
        categories={categories}
        categoryLabel="Month"
        formatValue={value => `$${value}`}
        label="MRR movement"
        series={series}
      />
    )
    const table = screen.getByRole('table', { name: 'MRR movement' })
    expect(table).toHaveTextContent('Month')
    expect(screen.getByRole('rowheader', { name: 'Feb' })).toBeInTheDocument()
    expect(screen.getAllByRole('cell').map(cell => cell.textContent)).toEqual([
      '$10',
      '$5',
      '$20',
      '$5',
      '$30',
      '$10',
    ])
  })

  it('moves between categories with the arrow keys and announces each one', () => {
    const { container } = render(
      <Chart categories={categories} label="MRR movement" series={series} />
    )
    const plot = screen.getByRole('group', { name: 'Plot' })
    expect(plot).toHaveAttribute('tabindex', '0')
    fireEvent.keyDown(plot, { key: 'ArrowRight' })
    expect(container.querySelector('[data-slot="chart-tooltip"]')).toHaveTextContent('Jan')
    fireEvent.keyDown(plot, { key: 'End' })
    const tooltip = container.querySelector('[data-slot="chart-tooltip"]')
    expect(tooltip).toHaveTextContent('Mar')
    expect(tooltip).toHaveTextContent('Churned10')
    expect(container.querySelector('[aria-live="polite"]')).toHaveTextContent(
      'Mar: New 30, Churned 10'
    )
    expect(screen.getByRole('figure')).toHaveAttribute('data-state', 'current')
    fireEvent.keyDown(plot, { key: 'Escape' })
    expect(container.querySelector('[data-slot="chart-tooltip"]')).toBeNull()
  })

  it('stacks bars on each other', () => {
    const { container } = render(
      <Chart categories={categories} label="Stacked" layout="stacked" series={series} type="bar" />
    )
    const [newBars, churnedBars] = [...container.querySelectorAll('.a63-Chart-series')]
    const top = (rect: Element | undefined) => Number(rect?.getAttribute('y'))
    const bottom = (rect: Element | undefined) =>
      Number(rect?.getAttribute('y')) + Number(rect?.getAttribute('height'))
    // The churned bar of each category starts where the new bar ends.
    const newRects = [...(newBars?.querySelectorAll('rect') ?? [])]
    const churnedRects = [...(churnedBars?.querySelectorAll('rect') ?? [])]
    newRects.forEach((rect, index) => {
      expect(bottom(churnedRects[index])).toBeCloseTo(top(rect))
    })
  })

  it('colours series in order unless a series names its colour', () => {
    const { container } = render(
      <Chart
        categories={categories}
        label="Colours"
        series={[...series, { label: 'Net', values: [1, 2, 3], color: 5 }]}
      />
    )
    const colors = [...container.querySelectorAll('.a63-Chart-series')].map(group =>
      group.getAttribute('data-color')
    )
    expect(colors).toEqual(['1', '2', '5'])
  })

  it('names the plot briefly, not with the chart label again', () => {
    render(<Chart categories={categories} label="MRR movement" series={series} />)
    expect(screen.getAllByLabelText('MRR movement')).toHaveLength(1)
    expect(screen.getByRole('group', { name: 'Plot' })).toBeInTheDocument()
  })

  it('picks a category under the pointer, mirrored in RTL', () => {
    const { container } = render(<Chart categories={categories} label="Pointer" series={series} />)
    const plot = screen.getByRole('group', { name: 'Plot' })
    plot.getBoundingClientRect = () => ({ left: 0, width: 300 }) as DOMRect
    fireEvent.pointerMove(plot, { clientX: 250, pointerType: 'mouse' })
    expect(container.querySelector('[data-slot="chart-tooltip"]')).toHaveTextContent('Mar')
    fireEvent.pointerLeave(plot, { pointerType: 'mouse' })
    expect(container.querySelector('[data-slot="chart-tooltip"]')).toBeNull()
    const spy = vi
      .spyOn(window, 'getComputedStyle')
      .mockReturnValue({ direction: 'rtl' } as CSSStyleDeclaration)
    fireEvent.pointerMove(plot, { clientX: 250, pointerType: 'mouse' })
    expect(container.querySelector('[data-slot="chart-tooltip"]')).toHaveTextContent('Jan')
    spy.mockRestore()
  })

  it('reverses the arrow keys in RTL and clears on blur', () => {
    const { container } = render(<Chart categories={categories} label="RTL" series={series} />)
    const plot = screen.getByRole('group', { name: 'Plot' })
    const spy = vi
      .spyOn(window, 'getComputedStyle')
      .mockReturnValue({ direction: 'rtl' } as CSSStyleDeclaration)
    fireEvent.keyDown(plot, { key: 'End' })
    fireEvent.keyDown(plot, { key: 'ArrowLeft' })
    expect(container.querySelector('[data-slot="chart-tooltip"]')).toHaveTextContent('Mar')
    fireEvent.keyDown(plot, { key: 'ArrowRight' })
    expect(container.querySelector('[data-slot="chart-tooltip"]')).toHaveTextContent('Feb')
    spy.mockRestore()
    fireEvent.blur(plot)
    expect(container.querySelector('[data-slot="chart-tooltip"]')).toBeNull()
  })

  it('keeps a touch reading after the finger lifts until a press outside', () => {
    const { container } = render(
      <>
        <Chart categories={categories} label="Touch" series={series} />
        <button type="button">Elsewhere</button>
      </>
    )
    const plot = screen.getByRole('group', { name: 'Plot' })
    plot.getBoundingClientRect = () => ({ left: 0, width: 300 }) as DOMRect
    fireEvent.pointerDown(plot, { clientX: 150, pointerType: 'touch' })
    fireEvent.pointerUp(plot, { pointerType: 'touch' })
    fireEvent.pointerLeave(plot, { pointerType: 'touch' })
    expect(container.querySelector('[data-slot="chart-tooltip"]')).toHaveTextContent('Feb')
    fireEvent.pointerDown(screen.getByRole('button', { name: 'Elsewhere' }))
    expect(container.querySelector('[data-slot="chart-tooltip"]')).toBeNull()
  })

  it('shows an empty message and no tab stop without data', () => {
    const { container } = render(
      <Chart categories={[]} label="Empty" labels={{ empty: 'Nothing yet' }} series={series} />
    )
    expect(container.querySelector('[data-slot="chart-empty"]')).toHaveTextContent('Nothing yet')
    expect(screen.getByRole('group', { name: 'Plot' })).not.toHaveAttribute('tabindex')
    expect(screen.getByRole('figure')).toHaveAttribute('data-empty')
  })

  it('draws values below zero at zero but tables and reads them as given', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { container } = render(
      <Chart
        categories={['Jan', 'Feb']}
        label="Net"
        series={[{ label: 'Net', values: [-5, 10] }]}
        type="bar"
      />
    )
    expect(screen.getAllByRole('cell').map(cell => cell.textContent)).toEqual(['-5', '10'])
    expect(container.querySelector('rect.a63-Chart-bar')).toHaveAttribute('height', '0')
    expect(warn).toHaveBeenCalledTimes(1)
    warn.mockRestore()
  })

  it('stacks with layout="stacked" and keys duplicate labels apart', () => {
    const { container } = render(
      <Chart
        categories={['Q1', 'Q1']}
        label="Duplicates"
        layout="stacked"
        series={[
          { label: 'A', values: [1, 2] },
          { label: 'A', values: [3, 4] },
        ]}
        type="area"
      />
    )
    expect(screen.getByRole('figure')).toHaveAttribute('data-layout', 'stacked')
    expect(container.querySelectorAll('tbody tr')).toHaveLength(2)
    expect(container.querySelectorAll('[data-slot="chart-legend"] li')).toHaveLength(2)
  })

  it('names every slot and state it renders in its contract', () => {
    const { container } = render(
      <>
        <Chart categories={categories} label="Slots" series={series} table="toggle" />
        <Chart categories={[]} label="Empty" series={series} />
      </>
    )
    const slots = new Set(
      [...container.querySelectorAll('[data-slot^="chart"]')].map(node =>
        node.getAttribute('data-slot')
      )
    )
    for (const slot of slots) expect(chartContract.slots).toContain(slot)
    expect(chartContract.states).toContain('empty')
  })

  it('takes layout, not the removed stacked boolean', () => {
    // Type-level only: the typecheck fails if `stacked` comes back.
    const old = () => (
      // @ts-expect-error `stacked` was removed in favour of `layout="stacked"`.
      <Chart categories={categories} label="Old" series={series} stacked type="bar" />
    )
    expect(typeof old).toBe('function')
  })

  it('shows the table with the toggle', () => {
    const { container } = render(
      <Chart categories={categories} label="Toggle" series={series} table="toggle" />
    )
    const toggle = screen.getByRole('button', { name: 'Show data table' })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(toggle)
    expect(screen.getByRole('button', { name: 'Hide data table' })).toHaveAttribute(
      'aria-expanded',
      'true'
    )
    expect(container.querySelector('[data-slot="chart-table"]')).toHaveAttribute('data-visible')
  })
})

describe('chartTicks', () => {
  it('rounds the top tick up to a tidy number', () => {
    expect(chartTicks(9400, 5)).toEqual([0, 2500, 5000, 7500, 10000])
    expect(chartTicks(109900, 3)).toEqual([0, 60000, 120000])
    expect(chartTicks(109900, 5)).toEqual([0, 30000, 60000, 90000, 120000])
    expect(chartTicks(0, 3)).toEqual([0, 1, 2])
    expect(chartTicks(0, 5)).toEqual([0, 1, 2, 3, 4])
    expect(chartTicks(0.35, 5)).toEqual([0, 0.1, 0.2, 0.3, 0.4])
  })
})
