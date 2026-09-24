import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { StatGrid } from './stat-grid'

describe('StatGrid', () => {
  it('renders children inside a responsive grid container', () => {
    const { container } = render(
      <StatGrid>
        <div>first</div>
        <div>second</div>
      </StatGrid>
    )
    const grid = container.querySelector('.mdx-block')
    expect(grid).not.toBeNull()
    expect(grid).toHaveClass('not-mdx', 'grid', 'grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-3')
    expect(screen.getByText('first')).toBeInTheDocument()
    expect(screen.getByText('second')).toBeInTheDocument()
  })

  it('merges a custom className', () => {
    const { container } = render(<StatGrid className="custom-x">{null}</StatGrid>)
    expect(container.querySelector('.mdx-block')).toHaveClass('custom-x')
  })
})
