import { ExampleContainer } from '@atom63/mdx/blocks'
import '@atom63/ui-react/styles.css'
import { Button } from '@atom63/ui-react'
import '@atom63/mdx/styles/index.css'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'MDX/Prose/ExampleContainer',
  tags: ['!autodocs'],
  component: ExampleContainer,
  parameters: {
    layout: 'padded',
  },
  args: {
    children: <Button type="button">Button</Button>,
  },
  decorators: [
    Story => (
      <div style={{ maxWidth: '48rem' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ExampleContainer>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithTitle: Story = {
  args: {
    title: 'Primary variant',
    children: (
      <Button type="button" variant="primary">
        Primary
      </Button>
    ),
  },
}

export const WithDescription: Story = {
  args: {
    title: 'Destructive actions',
    description: 'Use destructive variants for irreversible operations like deleting data.',
    children: (
      <div className="flex gap-3">
        <Button type="button" variant="destructive">
          Delete
        </Button>
        <Button type="button" variant="destructive-outline">
          Delete
        </Button>
      </div>
    ),
  },
}

export const LeftAligned: Story = {
  args: {
    align: 'left',
    title: 'Left-aligned example',
    children: <Button type="button">Action</Button>,
  },
}

export const Embedded: Story = {
  args: {
    embedded: true,
    children: (
      <Button type="button" variant="secondary">
        Embedded
      </Button>
    ),
  },
}
