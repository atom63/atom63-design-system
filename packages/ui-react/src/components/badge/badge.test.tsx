import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Badge } from './badge'

describe('Badge', () => {
  it('renders a span with default variant + size', () => {
    const { container } = render(<Badge>New</Badge>)
    const el = container.querySelector('.a63-Badge')
    expect(el?.tagName).toBe('SPAN')
    expect(el).toHaveAttribute('data-slot', 'badge')
    expect(el).toHaveAttribute('data-variant', 'default')
    expect(el).toHaveAttribute('data-size', 'md')
    expect(el).toHaveTextContent('New')
  })

  it('applies variant + size', () => {
    const { container } = render(
      <Badge size="lg" variant="success">
        Live
      </Badge>
    )
    const el = container.querySelector('.a63-Badge')
    expect(el).toHaveAttribute('data-variant', 'success')
    expect(el).toHaveAttribute('data-size', 'lg')
  })

  it('is polymorphic via render (interactive badge)', () => {
    render(<Badge render={<a href="/tags/design">Design</a>} />)
    const link = screen.getByRole('link', { name: 'Design' })
    expect(link).toHaveClass('a63-Badge')
  })

  it('draws a decorative leading dot, colored when a hue is given', () => {
    const { container, rerender } = render(<Badge dot>Live</Badge>)
    const dot = () => container.querySelector('[data-slot="badge-dot"]')
    expect(dot()).toHaveAttribute('aria-hidden')
    expect(dot()).not.toHaveAttribute('data-color')
    expect(container.querySelector('.a63-Badge')).toHaveTextContent('Live')
    rerender(<Badge dot="green">Research</Badge>)
    expect(dot()).toHaveAttribute('data-color', 'green')
    rerender(<Badge>Plain</Badge>)
    expect(dot()).toBeNull()
  })
})
