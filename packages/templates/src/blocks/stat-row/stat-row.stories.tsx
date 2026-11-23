import { UIProvider } from '@atom63/ui-react'
import type { Meta, StoryObj } from '@storybook/react-vite'

import {
  compactGlobals,
  inMain,
  landmarkParameters,
  phoneGlobals,
  tabletGlobals,
  ThemeMatrix,
  themeMatrixParameters,
  wideGlobals,
} from '../../story-matrix'
import { type Stat, StatRow } from './stat-row'

const meta = {
  title: 'Templates/Blocks/Stat row',
  component: StatRow,
  parameters: landmarkParameters,
  decorators: [inMain],
} satisfies Meta<typeof StatRow>

export default meta

type Story = StoryObj<typeof meta>

const stats: readonly Stat[] = [
  { change: { direction: 'up', text: '12%', tone: 'good' }, label: 'Revenue', value: '$48,200' },
  { change: { direction: 'down', text: '3', tone: 'good' }, label: 'Open invoices', value: '14' },
  { change: { direction: 'up', text: '2', tone: 'bad' }, label: 'Overdue', value: '5' },
  { label: 'Customers', value: '128' },
]

const args = { comparison: 'vs. August', stats }

export const Desktop: Story = { args }

export const Phone: Story = { args, globals: phoneGlobals }

export const Tablet: Story = { args, globals: tabletGlobals }

export const Compact: Story = { args, globals: compactGlobals }

export const Wide: Story = { args, globals: wideGlobals }

/* Fails when a card's content is wider than the card. */
const checkNoOverflow = (canvasElement: HTMLElement) => {
  for (const card of canvasElement.querySelectorAll<HTMLElement>('[data-slot="card"]')) {
    if (card.scrollWidth > card.clientWidth + 1) throw new Error('A stat overflows its card')
  }
}

/* Three stats fill the row. */
export const ThreeStats: Story = {
  args: { ...args, stats: stats.slice(0, 3) },
  play: ({ canvasElement }) => checkNoOverflow(canvasElement),
}

/* Five stats, two with the same label: each renders once. */
export const FiveStats: Story = {
  args: { ...args, stats: [...stats, { label: 'Customers', value: '12 new' }] },
  play: ({ canvasElement }) => {
    if (canvasElement.querySelectorAll('[data-slot="card"]').length !== 5)
      throw new Error('Expected five stat cards')
    checkNoOverflow(canvasElement)
  },
}

const longArgs = {
  comparison: 'vs. the same quarter last year',
  stats: [
    {
      change: { direction: 'up', text: '12.4%', tone: 'good' },
      label: 'Revenue this quarter',
      value: '$1,248,200.00',
    },
    { label: 'Outstanding across every region', value: '$312,904.17' },
    { change: { direction: 'up', text: '2', tone: 'bad' }, label: 'Overdue', value: '5' },
    { label: 'Customers', value: '12,840' },
  ],
} satisfies { comparison: string; stats: readonly Stat[] }

/* Long values and labels wrap inside their cards. */
export const LongValues: Story = {
  args: longArgs,
  play: ({ canvasElement }) => checkNoOverflow(canvasElement),
}

/* The same at a phone width, where a 2-up card is narrowest. */
export const LongValuesPhone: Story = {
  args: longArgs,
  globals: phoneGlobals,
  play: ({ canvasElement }) => checkNoOverflow(canvasElement),
}

/* Placeholder cards while the numbers load, announced once as busy. */
export const Loading: Story = {
  args: { ...args, loading: true },
  play: ({ canvasElement }) => {
    const status = canvasElement.querySelector('[role="status"][aria-busy="true"]')
    if (status?.getAttribute('aria-label') !== 'Loading metrics')
      throw new Error('The loading row is not announced')
    if (status.querySelectorAll('[data-slot="card"]').length !== 4)
      throw new Error('Expected one placeholder per stat')
  },
}

/* Right-to-left with Arabic, then Chinese. */
export const RightToLeft: Story = {
  args,
  render: () => (
    <div className="flex flex-col gap-8">
      <UIProvider dir="rtl" lang="ar">
        <StatRow
          comparison="مقارنة بأغسطس"
          stats={[
            {
              change: { direction: 'up', text: '12%', tone: 'good' },
              label: 'الإيرادات',
              value: '48,200 $',
            },
            { label: 'الفواتير المفتوحة', value: '14' },
            { change: { direction: 'up', text: '2', tone: 'bad' }, label: 'متأخرة', value: '5' },
            { label: 'العملاء', value: '128' },
          ]}
        />
      </UIProvider>
      <UIProvider lang="zh-CN">
        <StatRow
          comparison="与八月相比"
          stats={[
            {
              change: { direction: 'up', text: '12%', tone: 'good' },
              label: '收入',
              value: '¥48,200',
            },
            { label: '未结发票', value: '14' },
            { label: '逾期', value: '5' },
            { label: '客户', value: '128' },
          ]}
        />
      </UIProvider>
    </div>
  ),
}

export const Themes: Story = {
  args,
  parameters: themeMatrixParameters,
  render: props => (
    <ThemeMatrix>
      <StatRow {...props} />
    </ThemeMatrix>
  ),
}
