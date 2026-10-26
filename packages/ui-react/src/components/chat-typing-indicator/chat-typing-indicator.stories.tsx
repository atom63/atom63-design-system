import { ChatMessage, ChatTypingIndicator } from '@atom63/ui-react'
import '@atom63/ui-react/styles.css'
import type { Meta, StoryObj } from '@storybook/react-vite'

import { ThemeMatrix } from '../story-probes'

const meta = {
  title: 'UI React/ChatTypingIndicator',
  component: ChatTypingIndicator,
  args: { label: 'Assistant is typing' },
} satisfies Meta<typeof ChatTypingIndicator>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/* In place of the assistant's message until its first text arrives. */
export const InMessage: Story = {
  render: args => (
    <div style={{ maxWidth: 480 }}>
      <ChatMessage from="assistant" streaming>
        <ChatTypingIndicator {...args} />
      </ChatMessage>
    </div>
  ),
}

export const Themes: Story = {
  render: args => (
    <ThemeMatrix>
      <ChatTypingIndicator {...args} />
    </ThemeMatrix>
  ),
}
