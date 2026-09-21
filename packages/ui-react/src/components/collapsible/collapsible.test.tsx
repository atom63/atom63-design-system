import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleIndicator,
  CollapsibleTrigger,
} from './collapsible'

describe('Collapsible', () => {
  it('renders the parts with their slots', () => {
    const { container } = render(
      <Collapsible defaultOpen>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>Hidden content</CollapsibleContent>
      </Collapsible>
    )
    expect(container.querySelector('[data-slot="collapsible"]')).not.toBeNull()
    expect(container.querySelector('[data-slot="collapsible"]')).toHaveClass('a63-Collapsible')
    const trigger = container.querySelector('[data-slot="collapsible-trigger"]')
    expect(trigger).toHaveClass('a63-Collapsible-trigger')
    expect(container.querySelector('[data-slot="collapsible-content"]')).toHaveClass(
      'a63-Collapsible-content'
    )
  })

  it('renders an aria-hidden state indicator', () => {
    const { container } = render(<CollapsibleIndicator />)
    expect(container.querySelector('[data-slot="collapsible-indicator"]')).toHaveAttribute(
      'aria-hidden',
      'true'
    )
  })

  it('toggles open state on trigger click', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <Collapsible>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>Hidden content</CollapsibleContent>
      </Collapsible>
    )
    const trigger = screen.getByText('Toggle')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await user.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(container.querySelector('[data-slot="collapsible-content"]')).toHaveAttribute(
      'data-open'
    )
  })

  it('supports the trigger render prop for polymorphism', () => {
    render(
      <Collapsible>
        <CollapsibleTrigger render={<span data-testid="custom">Custom trigger</span>} />
        <CollapsibleContent>Body</CollapsibleContent>
      </Collapsible>
    )
    const custom = screen.getByTestId('custom')
    expect(custom.tagName).toBe('SPAN')
    expect(custom).toHaveAttribute('data-slot', 'collapsible-trigger')
  })
})
