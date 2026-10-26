import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ChatStep, ChatSteps } from './chat-steps'

describe('ChatSteps', () => {
  it('folds the steps under a disclosure button', () => {
    render(
      <ChatSteps label="Used 2 tools">
        <ChatStep>Searched</ChatStep>
        <ChatStep status="running">Drafting</ChatStep>
      </ChatSteps>
    )
    const trigger = screen.getByRole('button', { name: 'Used 2 tools' })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
  })

  it('gives every step its status as text', () => {
    render(
      <ChatSteps defaultOpen label="Steps">
        <ChatStep>Searched</ChatStep>
        <ChatStep status="error">Fetched rates</ChatStep>
        <ChatStep status="pending" statusLabel="Waiting">
          Summarise
        </ChatStep>
      </ChatSteps>
    )
    const [done, failed, waiting] = screen.getAllByRole('listitem')
    expect(done).toHaveTextContent('Done: Searched')
    expect(done).toHaveAttribute('data-status', 'complete')
    expect(failed).toHaveTextContent('Failed: Fetched rates')
    expect(waiting).toHaveTextContent('Waiting: Summarise')
  })

  it('takes a replacement icon and a description', () => {
    const { container } = render(
      <ChatSteps defaultOpen label="Steps">
        <ChatStep description="query: restaurants" icon={<svg data-testid="custom" />}>
          Searched
        </ChatStep>
      </ChatSteps>
    )
    expect(screen.getByTestId('custom')).toBeInTheDocument()
    expect(container.querySelector('[data-slot="chat-step-description"]')).toHaveTextContent(
      'query: restaurants'
    )
  })
})
