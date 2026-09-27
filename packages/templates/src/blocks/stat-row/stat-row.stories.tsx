import type { Meta, StoryObj } from '@storybook/react-vite'

import { phoneGlobals, ThemeMatrix, themeMatrixParameters } from '../../story-matrix'
import { StatRow } from './stat-row'

const meta = {
  title: 'Templates/Blocks/Stat row',
  component: StatRow,
} satisfies Meta<typeof StatRow>

export default meta

type Story = StoryObj<typeof meta>

const args = {
  comparison: 'vs. August',
  stats: [
    { change: { direction: 'up', text: '12%', tone: 'good' }, label: 'Revenue', value: '$48,200' },
    { change: { direction: 'down', text: '3', tone: 'good' }, label: 'Open invoices', value: '14' },
    { change: { direction: 'up', text: '2', tone: 'bad' }, label: 'Overdue', value: '5' },
    { label: 'Customers', value: '128' },
  ],
} as const

export const Desktop: Story = { args }

export const Phone: Story = { args, globals: phoneGlobals }

export const Themes: Story = {
  args,
  parameters: themeMatrixParameters,
  render: props => (
    <ThemeMatrix>
      <StatRow {...props} />
    </ThemeMatrix>
  ),
}
