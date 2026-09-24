import { StatCard, StatGrid } from '@atom63/mdx/blocks'
import '@atom63/ui-react/styles.css'
import '@atom63/mdx/styles/index.css'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'MDX/Blocks/StatCard',
  tags: ['!autodocs'],
  component: StatCard,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    trend: {
      control: 'select',
      options: ['up', 'down', 'neutral'],
    },
  },
  args: {
    label: 'Active themes',
    value: '4',
    change: '+1 this quarter',
    trend: 'up',
  },
  decorators: [
    Story => (
      <div style={{ maxWidth: '48rem' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof StatCard>

export default meta

type Story = StoryObj<typeof meta>

export const Standalone: Story = {}

export const Grid: Story = {
  name: 'StatGrid with trends',
  args: {
    label: '',
    value: '',
  },
  render: () => (
    <StatGrid>
      <StatCard label="Blocks shipped" value="24" change="+7" trend="up" />
      <StatCard label="Open issues" value="3" change="-5" trend="down" />
      <StatCard label="Themes" value="4" change="No change" trend="neutral" />
      <StatCard label="Bundle size" value="18 kb" change="-2 kb" trend="down" />
      <StatCard label="Contrast passes" value="100%" change="WCAG AA" trend="up" />
      <StatCard label="Runtime cost" value="0" change="SSR-safe" trend="neutral" />
    </StatGrid>
  ),
}
