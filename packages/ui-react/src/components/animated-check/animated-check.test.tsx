import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { AnimatedCheck } from './animated-check'

describe('AnimatedCheck', () => {
  it('renders an aria-hidden svg with the class + slot + passed className', () => {
    const { container } = render(<AnimatedCheck className="h-4 w-4" />)
    const el = container.querySelector('.a63-AnimatedCheck')
    expect(el).not.toBeNull()
    expect(el?.tagName.toLowerCase()).toBe('svg')
    expect(el).toHaveAttribute('data-slot', 'animated-check')
    expect(el).toHaveAttribute('aria-hidden')
    expect(el).toHaveClass('h-4', 'w-4')
  })

  it('renders the checkmark path', () => {
    const { container } = render(<AnimatedCheck />)
    const path = container.querySelector('.a63-AnimatedCheck path')
    expect(path).not.toBeNull()
    expect(path).toHaveAttribute('d', 'M4 12l5 5L20 6')
    expect(path).toHaveAttribute('data-slot', 'animated-check-path')
  })

  it('renders a static check when animate is false', () => {
    const { container } = render(<AnimatedCheck animate={false} />)
    expect(container.querySelector('.a63-AnimatedCheck path')).not.toBeNull()
  })

  it('forwards native SVG props while remaining decorative', () => {
    const { container } = render(<AnimatedCheck data-testid="check" style={{ fontSize: 24 }} />)
    const check = container.querySelector('[data-testid="check"]')
    expect(check).toHaveStyle({ fontSize: '24px' })
    expect(check).toHaveAttribute('aria-hidden')
  })
})
