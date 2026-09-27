import type { Meta, StoryObj } from '@storybook/react-vite'

import { phoneGlobals, ThemeMatrix, themeMatrixParameters } from '../../story-matrix'
import { ActivityList } from './activity-list'

const meta = {
  title: 'Templates/Blocks/Activity list',
  component: ActivityList,
} satisfies Meta<typeof ActivityList>

export default meta

type Story = StoryObj<typeof meta>

const args = {
  items: [
    {
      action: 'paid',
      actor: 'Northwind Traders',
      dateTime: '2026-09-27T09:12:00Z',
      id: '1',
      target: 'INV-1042',
      time: '2 hours ago',
    },
    {
      action: 'sent',
      actor: 'Ada Park',
      dateTime: '2026-09-27T07:40:00Z',
      id: '2',
      target: 'INV-1049',
      time: '4 hours ago',
    },
    {
      action: 'added the customer',
      actor: 'Ada Park',
      dateTime: '2026-09-26T16:05:00Z',
      id: '3',
      target: 'Summit Outfitters',
      time: 'Yesterday',
    },
  ],
  label: 'Recent activity',
}

export const Desktop: Story = { args }

export const Phone: Story = { args, globals: phoneGlobals }

export const Themes: Story = {
  args,
  parameters: themeMatrixParameters,
  render: props => (
    <ThemeMatrix>
      <ActivityList {...props} />
    </ThemeMatrix>
  ),
}
