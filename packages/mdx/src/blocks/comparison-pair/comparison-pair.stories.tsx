import { ComparisonPair } from '@atom63/mdx/blocks'
import '@atom63/ui-react/styles.css'
import '@atom63/mdx/styles/index.css'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'MDX/Blocks/ComparisonPair',
  tags: ['!autodocs'],
  component: ComparisonPair,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    label: { control: 'text' },
    speedControl: { control: 'boolean' },
    slowMotionLabel: { control: 'text' },
  },
  args: {
    label: 'Spacing scale',
    speedControl: false,
    children: null,
  },
  decorators: [
    Story => (
      <div style={{ maxWidth: '40rem' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ComparisonPair>

export default meta

type Story = StoryObj<typeof meta>

const BeforePanel = (
  <div className="border-border text-muted-foreground flex size-full items-center justify-center rounded-lg border p-4 text-sm">
    Cramped 4px gaps
  </div>
)

const AfterPanel = (
  <div className="border-border text-foreground flex size-full items-center justify-center rounded-lg border p-4 text-sm">
    Comfortable 16px gaps
  </div>
)

export const BeforeAfter: Story = {
  render: args => (
    <ComparisonPair {...args}>
      <ComparisonPair.Before label="Before">{BeforePanel}</ComparisonPair.Before>
      <ComparisonPair.After label="After">{AfterPanel}</ComparisonPair.After>
    </ComparisonPair>
  ),
}

export const WithSpeedControl: Story = {
  args: {
    label: 'Transition timing',
    speedControl: true,
    slowMotionLabel: 'Slow motion',
    children: null,
  },
  render: args => (
    <ComparisonPair {...args}>
      <ComparisonPair.Before label="Before">{BeforePanel}</ComparisonPair.Before>
      <ComparisonPair.After label="After">{AfterPanel}</ComparisonPair.After>
    </ComparisonPair>
  ),
}
