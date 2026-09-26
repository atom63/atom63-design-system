import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './accordion'

function Example() {
  return (
    <Accordion defaultValue="a">
      <AccordionItem value="a">
        <AccordionTrigger>First</AccordionTrigger>
        <AccordionContent>First content</AccordionContent>
      </AccordionItem>
      <AccordionItem value="b">
        <AccordionTrigger icon="plus-minus">Second</AccordionTrigger>
        <AccordionContent>Second content</AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

describe('Accordion', () => {
  it('renders the root, items, triggers and expanded content', () => {
    const { container } = render(<Example />)
    expect(container.querySelector('[data-slot="accordion"]')).toHaveClass('a63-Accordion')
    expect(container.querySelectorAll('[data-slot="accordion-item"]')).toHaveLength(2)
    expect(container.querySelectorAll('[data-slot="accordion-trigger"]')).toHaveLength(2)
    expect(screen.getByText('First content')).toBeInTheDocument()
  })

  it('reflects the trigger icon variant', () => {
    render(<Example />)
    expect(screen.getByText('Second').closest('[data-slot="accordion-trigger"]')).toHaveAttribute(
      'data-icon',
      'plus-minus'
    )
  })

  it('expands a panel on click', async () => {
    const user = userEvent.setup()
    render(<Example />)
    const second = screen.getByText('Second')
    expect(second).toHaveAttribute('aria-expanded', 'false')
    await user.click(second)
    expect(second).toHaveAttribute('aria-expanded', 'true')
  })

  it('points every header at its panel, keeping collapsed panels mounted and hidden', () => {
    const { container } = render(<Example />)
    const second = screen.getByText('Second').closest('button')!
    expect(second).toHaveAttribute('aria-expanded', 'false')
    const panel = container.querySelector(`#${CSS.escape(second.getAttribute('aria-controls')!)}`)
    expect(panel).toHaveAttribute('data-slot', 'accordion-content')
    expect(panel).toHaveAttribute('hidden')
    expect(panel).toHaveTextContent('Second content')
  })

  it('keeps a custom panel id in aria-controls', () => {
    render(
      <Accordion>
        <AccordionItem value="a">
          <AccordionTrigger>First</AccordionTrigger>
          <AccordionContent id="custom-panel">First content</AccordionContent>
        </AccordionItem>
      </Accordion>
    )
    expect(screen.getByText('First').closest('button')).toHaveAttribute(
      'aria-controls',
      'custom-panel'
    )
  })

  it('drops aria-controls from a collapsed header whose panel unmounts', () => {
    render(
      <Accordion defaultValue="a">
        <AccordionItem value="a">
          <AccordionTrigger>First</AccordionTrigger>
          <AccordionContent>First content</AccordionContent>
        </AccordionItem>
        <AccordionItem value="b">
          <AccordionTrigger>Second</AccordionTrigger>
          <AccordionContent keepMounted={false}>Second content</AccordionContent>
        </AccordionItem>
      </Accordion>
    )
    expect(screen.getByText('First').closest('button')).toHaveAttribute('aria-controls')
    expect(screen.getByText('Second').closest('button')).not.toHaveAttribute('aria-controls')
    expect(screen.queryByText('Second content')).not.toBeInTheDocument()
  })
})
