import { DestinationIndicator, DestinationLink } from '@atom63/ui-react'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'UI React/Destination Link',
  component: DestinationLink,
} satisfies Meta<typeof DestinationLink>

export default meta
type Story = StoryObj<typeof meta>

export const Internal: Story = {
  args: {
    children: (
      <>
        View project
        <DestinationIndicator className="size-4" kind="internal" />
      </>
    ),
    href: '#internal',
    kind: 'internal',
  },
}

export const External: Story = {
  args: {
    children: (
      <>
        View source
        <DestinationIndicator className="size-4" kind="external" />
      </>
    ),
    href: 'https://example.com',
    kind: 'external',
  },
}
