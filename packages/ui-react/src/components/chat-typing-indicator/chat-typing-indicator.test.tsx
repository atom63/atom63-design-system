import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ChatMessage } from '../chat-message/chat-message'
import { ChatTypingIndicator } from './chat-typing-indicator'

describe('ChatTypingIndicator', () => {
  it('mounts an empty polite status, then fills it with the label as text', async () => {
    const { container } = render(<ChatTypingIndicator />)
    const status = screen.getByRole('status')
    expect(status).not.toHaveAttribute('aria-label')
    // The region exists before its text, so the text arrives as a change to announce.
    expect(status).not.toHaveTextContent('Assistant is typing')
    expect(await screen.findByText('Assistant is typing')).toBeInTheDocument()
    expect(status).toHaveTextContent('Assistant is typing')
    const dots = container.querySelectorAll('[data-slot="chat-typing-indicator-dot"]')
    expect(dots).toHaveLength(3)
    for (const dot of dots) expect(dot).toHaveAttribute('aria-hidden', 'true')
  })

  it('takes a custom label', async () => {
    render(<ChatTypingIndicator label="Sidekick is writing" />)
    expect(await screen.findByText('Sidekick is writing')).toBeInTheDocument()
  })

  it('is not held back by a streaming ChatMessage around it', () => {
    render(
      <ChatMessage from="assistant" streaming>
        {null}
        <ChatTypingIndicator />
      </ChatMessage>
    )
    expect(screen.getByRole('article')).not.toHaveAttribute('aria-busy')
  })

  it('leaves aria-busy on a streaming ChatMessage once text replaces the indicator', () => {
    render(
      <ChatMessage from="assistant" streaming>
        <p>Partial reply</p>
      </ChatMessage>
    )
    expect(screen.getByRole('article')).toHaveAttribute('aria-busy', 'true')
  })
})
