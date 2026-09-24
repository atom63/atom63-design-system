import { MediaPlaceholder } from '@atom63/mdx/blocks'
import '@atom63/ui-react/styles.css'
import '@atom63/mdx/styles/index.css'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'MDX/Blocks/MediaPlaceholder',
  tags: ['!autodocs'],
  component: MediaPlaceholder,
  parameters: {
    layout: 'padded',
  },
  args: {
    label: 'A diagram of the token → component → framework system.',
  },
  decorators: [
    Story => (
      <div style={{ maxWidth: '48rem' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MediaPlaceholder>

export default meta

type Story = StoryObj<typeof meta>

export const Image: Story = {}

export const Video: Story = {
  args: {
    kind: 'video',
    label: 'Screen recording of the agent workflow in motion.',
  },
}

export const Diagram: Story = {
  args: {
    kind: 'diagram',
    label: 'One-off page vs. a reusable system.',
  },
}

export const Square: Story = {
  args: {
    aspectRatio: '1 / 1',
    label: 'A square crop.',
  },
}
