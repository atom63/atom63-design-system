import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Spinner } from './spinner'

describe('Spinner', () => {
  it('renders an svg with the spinner slot + class + role/label', () => {
    const { container } = render(<Spinner />)
    const el = container.querySelector('.a63-Spinner')
    expect(el).not.toBeNull()
    expect(el?.tagName.toLowerCase()).toBe('svg')
    expect(el).toHaveAttribute('data-slot', 'spinner')
    expect(el).toHaveAttribute('role', 'status')
    expect(el).toHaveAttribute('aria-label', 'Loading')
  })

  it('merges a passed className', () => {
    const { container } = render(<Spinner className="size-6" />)
    expect(container.querySelector('.a63-Spinner')).toHaveClass('size-6')
  })
})
