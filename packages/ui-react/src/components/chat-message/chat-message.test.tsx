import { chatMessageContract } from '@atom63/ui-foundation'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ChatMessage, ChatMessageList } from './chat-message'

describe('ChatMessage', () => {
  it('renders an article named after who is speaking', () => {
    render(
      <ChatMessageList aria-label="Conversation">
        <ChatMessage from="user">Hello</ChatMessage>
        <ChatMessage from="assistant">Hi, how can I help?</ChatMessage>
      </ChatMessageList>
    )
    expect(screen.getByRole('log', { name: 'Conversation' })).toBeInTheDocument()
    expect(screen.getByRole('article', { name: 'You' })).toHaveTextContent('Hello')
    expect(screen.getByRole('article', { name: 'Assistant' })).toHaveTextContent(
      'Hi, how can I help?'
    )
  })

  it('draws the user as a bubble and the assistant plain by default', () => {
    render(
      <>
        <ChatMessage appearance="plain" from="user">
          Hello
        </ChatMessage>
        <ChatMessage from="assistant">Hi</ChatMessage>
        <ChatMessage appearance="bubble" from="assistant">
          Hi again
        </ChatMessage>
      </>
    )
    const [user, plain, bubble] = screen.getAllByRole('article')
    expect(user).toHaveAttribute('data-role', 'user')
    expect(user).toHaveAttribute('data-appearance', 'bubble')
    expect(plain).toHaveAttribute('data-appearance', chatMessageContract.defaultAppearance)
    expect(bubble).toHaveAttribute('data-appearance', 'bubble')
  })

  it('renders the avatar and actions slots only when given', () => {
    const { container, rerender } = render(<ChatMessage from="assistant">Hi</ChatMessage>)
    expect(container.querySelector('[data-slot="chat-message-avatar"]')).toBeNull()
    expect(container.querySelector('[data-slot="chat-message-actions"]')).toBeNull()

    rerender(
      <ChatMessage actions={<button type="button">Copy</button>} avatar="A" from="assistant">
        Hi
      </ChatMessage>
    )
    expect(container.querySelector('[data-slot="chat-message-avatar"]')).toHaveTextContent('A')
    expect(screen.getByRole('button', { name: 'Copy' })).toBeInTheDocument()
  })

  it('marks a streaming reply busy and takes a custom label', () => {
    render(
      <ChatMessage label="Sidekick" from="assistant" streaming>
        Thinking
      </ChatMessage>
    )
    const message = screen.getByRole('article', { name: 'Sidekick' })
    expect(message).toHaveAttribute('aria-busy', 'true')
    expect(message).toHaveAttribute('data-streaming', '')
  })
})
