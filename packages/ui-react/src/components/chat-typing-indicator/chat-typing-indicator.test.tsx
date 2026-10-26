import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ChatTypingIndicator } from './chat-typing-indicator'

describe('ChatTypingIndicator', () => {
  it('is a polite status with a label and three hidden dots', () => {
    const { container } = render(<ChatTypingIndicator />)
    expect(screen.getByRole('status', { name: 'Assistant is typing' })).toBeInTheDocument()
    const dots = container.querySelectorAll('[data-slot="chat-typing-indicator-dot"]')
    expect(dots).toHaveLength(3)
    for (const dot of dots) expect(dot).toHaveAttribute('aria-hidden', 'true')
  })

  it('takes a custom label', () => {
    render(<ChatTypingIndicator label="Sidekick is writing" />)
    expect(screen.getByRole('status', { name: 'Sidekick is writing' })).toBeInTheDocument()
  })
})
