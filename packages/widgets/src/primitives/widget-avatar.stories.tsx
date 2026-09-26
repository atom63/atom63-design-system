import { WidgetAvatar } from '@atom63/widgets/primitives'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'Widgets/Avatar',
  component: WidgetAvatar,
  args: { fallback: 'YZ', size: 'md' },
} satisfies Meta<typeof WidgetAvatar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Sizes: Story = {
  render: args => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--a63-space-4)' }}>
      <WidgetAvatar {...args} size="sm" />
      <WidgetAvatar {...args} size="md" />
      <WidgetAvatar {...args} size="lg" />
      <WidgetAvatar {...args} size="xl" />
    </div>
  ),
}

/** The presence dot sits on the circle's lower-end arc. */
export const WithStatus: Story = { args: { size: 'lg', status: true } }

/** Hover or focus the avatar to reveal the shuffle control. */
export const Shuffle: Story = {
  args: { size: 'lg', onShuffle: () => undefined, showOutline: true },
}

export const Busy: Story = {
  args: { busy: true, size: 'lg', onShuffle: () => undefined },
}

export const Dark: Story = {
  render: Sizes.render,
  args: { status: true },
  globals: { mode: 'dark' },
}
