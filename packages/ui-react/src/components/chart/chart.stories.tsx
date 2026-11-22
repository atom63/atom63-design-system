import { chartSizes, chartTypes, themes } from '@atom63/ui-foundation'
import { UIProvider } from '@atom63/ui-react'
import { Chart } from '@atom63/ui-react/chart'
import '@atom63/ui-react/styles.css'
import type { Meta, StoryObj } from '@storybook/react-vite'

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const usd = new Intl.NumberFormat('en-US', {
  currency: 'USD',
  maximumFractionDigits: 0,
  style: 'currency',
})
const compact = new Intl.NumberFormat('en-US', {
  currency: 'USD',
  maximumFractionDigits: 1,
  notation: 'compact',
  style: 'currency',
})

const mrr = [42, 44, 47, 46, 51, 55, 58, 61, 60, 66, 71, 74].map(value => value * 1000)
const movement = [
  { label: 'New', values: [6, 5, 7, 4, 8, 7, 6, 8, 5, 9, 8, 7].map(value => value * 1000) },
  { label: 'Expansion', values: [2, 3, 2, 3, 3, 4, 3, 2, 4, 3, 4, 5].map(value => value * 1000) },
  { label: 'Churned', values: [3, 2, 4, 5, 3, 3, 3, 2, 6, 3, 3, 4].map(value => value * 1000) },
]
const plans = [
  { label: 'Starter', values: [8, 9, 9, 10] },
  { label: 'Growth', values: [12, 13, 15, 16] },
  { label: 'Scale', values: [9, 10, 10, 12] },
  { label: 'Enterprise', values: [14, 14, 16, 19] },
  { label: 'Partner', values: [3, 4, 4, 5] },
]

const meta = {
  title: 'UI React/Chart',
  component: Chart,
  argTypes: {
    size: { control: 'inline-radio', options: chartSizes },
    type: { control: 'inline-radio', options: chartTypes },
    stacked: { control: 'boolean' },
    table: { control: 'inline-radio', options: ['hidden', 'toggle'] },
  },
  args: {
    categories: months,
    categoryLabel: 'Month',
    description: 'New revenue outpaces churn in every month but September.',
    formatTick: compact.format,
    formatValue: usd.format,
    label: 'MRR movement by month',
    series: movement,
    size: 'md',
    type: 'bar',
  },
  decorators: [
    Story => (
      <div style={{ maxWidth: 640 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Chart>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/* Line, area, grouped bars and stacked bars, each from the same contract. */
export const Types: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 32 }}>
      <Chart
        categories={months}
        formatTick={compact.format}
        formatValue={usd.format}
        label="MRR by month"
        series={[{ label: 'MRR', values: mrr }]}
        type="line"
      />
      <Chart
        categories={months}
        formatTick={compact.format}
        formatValue={usd.format}
        label="MRR by month, as an area"
        series={[{ label: 'MRR', values: mrr }]}
        type="area"
      />
      <Chart
        categories={months}
        formatTick={compact.format}
        formatValue={usd.format}
        label="MRR movement by month"
        series={movement}
        type="bar"
      />
      <Chart
        categories={['Q1', 'Q2', 'Q3', 'Q4']}
        label="Accounts by plan and quarter"
        series={plans}
        size="sm"
        stacked
        type="bar"
      />
    </div>
  ),
}

/* Pressing an arrow key on the plot picks a category and shows its tooltip. */
export const Keyboard: Story = {
  args: { type: 'line', series: movement.slice(0, 2) },
  play: ({ canvasElement }) => {
    const plot = canvasElement.querySelector<HTMLElement>('[data-slot="chart-plot"]')
    if (!plot) throw new Error('The chart has no plot')
    plot.focus()
    plot.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'End' }))
    return new Promise<void>(resolve => requestAnimationFrame(() => resolve())).then(() => {
      const tooltip = canvasElement.querySelector('[data-slot="chart-tooltip"]')
      if (!tooltip?.textContent?.includes('Dec')) {
        throw new Error(`Expected the tooltip to show Dec, got "${tooltip?.textContent ?? ''}"`)
      }
    })
  },
}

/* The data table, shown with the toggle. */
export const DataTable: Story = {
  args: { categories: months.slice(0, 4), series: movement, table: 'toggle' },
}

/* Five series on each brand: series 2 to 5 turn from the brand's hue, so none
   of them lands on it, the violet brand (b5) included. */
export const Brands: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      {(['b1', 'b2', 'b3', 'b4', 'b5', 'b6'] as const).map(brand => (
        <UIProvider brand={brand} key={brand}>
          <div style={{ background: 'var(--a63-surface-panel)', padding: '0.75rem' }}>
            <Chart
              categories={['Q1', 'Q2', 'Q3', 'Q4']}
              label={`Accounts by plan, brand ${brand}`}
              series={plans}
              size="sm"
              type="bar"
            />
          </div>
        </UIProvider>
      ))}
    </div>
  ),
}

export const Themes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      {themes.map(theme =>
        (['light', 'dark'] as const).map(mode => (
          <UIProvider key={`${theme}-${mode}`} mode={mode} theme={theme}>
            <div style={{ background: 'var(--a63-surface-panel)', padding: '0.75rem' }}>
              <Chart
                categories={months.slice(0, 6)}
                label={`MRR movement, ${theme} ${mode}`}
                series={movement}
                size="sm"
                type="bar"
              />
              <Chart
                categories={months.slice(0, 6)}
                label={`MRR, ${theme} ${mode}`}
                series={[{ label: 'MRR', values: mrr.slice(0, 6) }, movement[0]!]}
                size="sm"
                type="area"
              />
            </div>
          </UIProvider>
        ))
      )}
    </div>
  ),
}

/* Forced colours drop the series colours; lines dash and bars outline in a
   different pattern per series, and the legend keys follow. */
export const ForcedColors: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 24 }}>
      <Chart
        categories={months.slice(0, 6)}
        label="MRR movement"
        series={movement}
        size="sm"
        type="line"
      />
      <Chart
        categories={['Q1', 'Q2', 'Q3', 'Q4']}
        label="Accounts by plan"
        series={plans}
        size="sm"
        type="bar"
      />
    </div>
  ),
}

/* Right to left: the categories run from the right, and the arrow keys follow. */
export const RightToLeft: Story = {
  render: args => (
    <UIProvider dir="rtl">
      <Chart {...args} />
    </UIProvider>
  ),
}
