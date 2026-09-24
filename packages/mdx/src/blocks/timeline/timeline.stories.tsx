import { Timeline } from '@atom63/mdx/blocks'
import '@atom63/ui-react/styles.css'
import '@atom63/mdx/styles/index.css'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'MDX/Blocks/Timeline',
  tags: ['!autodocs'],
  component: Timeline,
  parameters: {
    layout: 'padded',
  },
  decorators: [
    Story => (
      <div style={{ maxWidth: '48rem' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Timeline>

export default meta

type Story = StoryObj<typeof meta>

export const ReleaseHistory: Story = {
  args: {
    children: null,
  },
  render: () => (
    <Timeline>
      <Timeline.Item date="2024" title="Primitive layer">
        <p>Raw tokens land: color ramps, the type scale, spacing, and radius.</p>
      </Timeline.Item>
      <Timeline.Item date="2025 Q1" title="Semantic layer">
        <p>Semantic tokens map primitives to intent, unlocking multi-theme support.</p>
      </Timeline.Item>
      <Timeline.Item date="2025 Q3" title="Block library">
        <p>Composable MDX blocks ship, letting authors build docs without raw values.</p>
      </Timeline.Item>
      <Timeline.Item date="Now" title="P3 composites">
        <p>Tabs, Accordion, Steps, Timeline, and stat cards round out the toolkit.</p>
      </Timeline.Item>
    </Timeline>
  ),
}
