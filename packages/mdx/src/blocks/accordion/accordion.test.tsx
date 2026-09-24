import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Accordion } from './accordion'

describe('Accordion', () => {
  it('renders items with accordion trigger roles (inherited from @atom63/ui-react)', () => {
    render(
      <Accordion type="single" defaultValue="a">
        <Accordion.Item value="a">
          <Accordion.Trigger>First</Accordion.Trigger>
          <Accordion.Content>First content</Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="b">
          <Accordion.Trigger>Second</Accordion.Trigger>
          <Accordion.Content>Second content</Accordion.Content>
        </Accordion.Item>
      </Accordion>
    )
    expect(screen.getByRole('button', { name: 'First' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Second' })).toBeInTheDocument()
    expect(screen.getByText('First content')).toBeInTheDocument()
  })

  it('expands a trigger to reveal its content', () => {
    render(
      <Accordion type="single">
        <Accordion.Item value="a">
          <Accordion.Trigger>First</Accordion.Trigger>
          <Accordion.Content>First content</Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="b">
          <Accordion.Trigger>Second</Accordion.Trigger>
          <Accordion.Content>Second content</Accordion.Content>
        </Accordion.Item>
      </Accordion>
    )
    const trigger = screen.getByRole('button', { name: 'Second' })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
  })

  it('applies not-mdx mdx-block block-spacing wrapper class', () => {
    const { container } = render(
      <Accordion>
        <Accordion.Item value="a">
          <Accordion.Trigger>First</Accordion.Trigger>
          <Accordion.Content>First content</Accordion.Content>
        </Accordion.Item>
      </Accordion>
    )
    const root = container.querySelector('.mdx-block')
    expect(root).not.toBeNull()
    expect(root).toHaveClass('not-mdx')
  })
})
