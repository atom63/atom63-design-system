import { Reveal } from '@atom63/mdx/primitives'
import '@atom63/ui-react/styles.css'
import '@atom63/mdx/styles/index.css'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'MDX/Primitives/Reveal',
  tags: ['!autodocs'],
  component: Reveal,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    delay: {
      control: { type: 'number', min: 0, max: 1, step: 0.1 },
    },
  },
  args: {
    children: (
      <div className="border-border text-secondary-foreground rounded-lg border p-4 text-sm">
        This block fades and slides up when it scrolls into view (respects reduced motion).
      </div>
    ),
  },
  decorators: [
    Story => (
      <div style={{ maxWidth: '48rem' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Reveal>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Delayed: Story = {
  args: {
    delay: 0.3,
    children: (
      <div className="border-border text-secondary-foreground rounded-lg border p-4 text-sm">
        Same entrance with a 0.3s delay.
      </div>
    ),
  },
}

export const Sequenced: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      {[0, 0.1, 0.2, 0.3].map(delay => (
        <Reveal key={delay} delay={delay}>
          <div className="border-border text-secondary-foreground rounded-lg border p-4 text-sm">
            delay={delay}s
          </div>
        </Reveal>
      ))}
    </div>
  ),
}
