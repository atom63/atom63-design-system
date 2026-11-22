import { chartContract } from '@atom63/ui-foundation'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

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
    const plot = screen.getByRole('group', { name: 'MRR movement' })
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
      <Chart categories={categories} label="Stacked" series={series} stacked type="bar" />
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
    expect(chartTicks(0, 3)).toEqual([0, 0.5, 1])
    expect(chartTicks(0.35, 5)).toEqual([0, 0.1, 0.2, 0.3, 0.4])
  })
})
