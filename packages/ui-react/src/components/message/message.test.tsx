import { messageContract } from '@atom63/ui-foundation'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Message, MessageEvent, MessageList } from './message'

const slot = (container: HTMLElement, name: string) =>
  container.querySelector(`[data-slot="${name}"]`)

describe('Message', () => {
  it('renders an incoming single message by default, named after its sender', () => {
    const { container } = render(<Message label="Ada">Hello</Message>)
    const message = screen.getByRole('article', { name: 'Ada' })
    expect(message).toHaveAttribute('data-direction', messageContract.defaultDirection)
    expect(message).toHaveAttribute('data-position', messageContract.defaultPosition)
    expect(slot(container, 'message-content')).toHaveTextContent('Hello')
  })

  it('names the delivery status and lets the host translate it', () => {
    render(
      <>
        <Message direction="outgoing" label="You" status="read" time="12:04">
          Hi
        </Message>
        <Message
          direction="outgoing"
          label="You"
          status="failed"
          statusLabels={{ failed: '发送失败' }}
        >
          Hi
        </Message>
      </>
    )
    expect(screen.getByRole('img', { name: 'Read' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: '发送失败' })).toBeInTheDocument()
  })

  it('shows the avatar on incoming messages only', () => {
    const { container, rerender } = render(
      <Message avatar="A" label="Ada">
        Hi
      </Message>
    )
    expect(slot(container, 'message-avatar')).toHaveTextContent('A')
    rerender(
      <Message avatar="A" direction="outgoing" label="You">
        Hi
      </Message>
    )
    expect(slot(container, 'message-avatar')).toBeNull()
  })

  it('puts media above the text and marks the message', () => {
    const { container } = render(
      <Message label="Ada" media={<img alt="Campsite" src="data:," />}>
        The view
      </Message>
    )
    const bubble = slot(container, 'message-bubble') as HTMLElement
    expect(bubble.firstElementChild).toBe(slot(container, 'message-media'))
    expect(slot(container, 'message')).toHaveAttribute('data-media', '')
  })

  it('renders a photo with no text and no content slot', () => {
    const { container } = render(
      <Message label="Ada" media={<img alt="Campsite" src="data:," />} />
    )
    expect(slot(container, 'message-content')).toBeNull()
  })
})

describe('MessageList and MessageEvent', () => {
  it('is a named log region with events between messages', () => {
    render(
      <MessageList aria-label="Messages with Ada">
        <MessageEvent>Today</MessageEvent>
        <Message label="Ada">Hi</Message>
      </MessageList>
    )
    const log = screen.getByRole('log', { name: 'Messages with Ada' })
    expect(log).toHaveTextContent('Today')
    expect(log).toContainElement(screen.getByRole('article', { name: 'Ada' }))
  })

  it('hides the event icon from assistive technology', () => {
    const { container } = render(<MessageEvent icon={<svg />}>Missed call</MessageEvent>)
    expect(container.querySelector('.a63-MessageEvent-icon')).toHaveAttribute('aria-hidden', 'true')
  })
})
