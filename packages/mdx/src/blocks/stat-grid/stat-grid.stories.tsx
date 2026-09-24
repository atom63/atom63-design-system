import { StatCard, StatGrid } from '@atom63/mdx/blocks'
import '@atom63/ui-react/styles.css'
import '@atom63/mdx/styles/index.css'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'MDX/Blocks/Stat Grid',
  tags: ['!autodocs'],
  component: StatGrid,
  parameters: { layout: 'padded' },
  decorators: [
    Story => (
      <div style={{ maxWidth: '48rem' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof StatGrid>

export default meta

// Every story renders its own grid, so `children` is not an arg.
type Story = StoryObj<typeof StatGrid>

export const Default: Story = {
  render: () => (
    <StatGrid>
      <StatCard change="+12.4%" label="Monthly visitors" trend="up" value="48.2k" />
      <StatCard change="-2.1%" label="Bounce rate" trend="down" value="31%" />
      <StatCard label="Avg. session" value="4m 12s" />
    </StatGrid>
  ),
}

export const TwoCards: Story = {
  name: 'Two cards',
  render: () => (
    <StatGrid>
      <StatCard change="+8" label="Open PRs" trend="up" value="24" />
      <StatCard change="No change" label="Contributors" trend="neutral" value="7" />
    </StatGrid>
  ),
}

export const SixCards: Story = {
  name: 'Six cards',
  render: () => (
    <StatGrid>
      <StatCard change="+12.4%" label="Visitors" trend="up" value="48.2k" />
      <StatCard change="-2.1%" label="Bounce rate" trend="down" value="31%" />
      <StatCard label="Avg. session" value="4m 12s" />
      <StatCard change="+3.0%" label="Conversions" trend="up" value="1,204" />
      <StatCard change="-0.4%" label="Errors" trend="down" value="0.12%" />
      <StatCard change="Stable" label="Uptime" trend="neutral" value="99.98%" />
    </StatGrid>
  ),
}
