import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Checkbox } from './checkbox'

describe('Checkbox', () => {
  it('renders the box with default size + slot', () => {
    const { container } = render(<Checkbox />)
    const el = container.querySelector('.a63-Checkbox')
    expect(el).not.toBeNull()
    expect(el).toHaveAttribute('data-slot', 'checkbox')
    expect(el).toHaveAttribute('data-size', 'md')
    expect(el).toHaveAttribute('role', 'checkbox')
  })

  it('applies the given size', () => {
    const { container } = render(<Checkbox size="sm" />)
    expect(container.querySelector('.a63-Checkbox')).toHaveAttribute('data-size', 'sm')
  })

  it('reflects defaultChecked as data-checked + shows the indicator', () => {
    const { container } = render(<Checkbox defaultChecked />)
    const el = container.querySelector('.a63-Checkbox')
    expect(el).toHaveAttribute('data-checked')
    expect(container.querySelector('[data-slot="checkbox-indicator"]')).not.toBeNull()
  })

  it('reflects the indeterminate state', () => {
    const { container } = render(<Checkbox indeterminate />)
    expect(container.querySelector('.a63-Checkbox')).toHaveAttribute('data-indeterminate')
  })

  it('reflects the disabled state', () => {
    const { container } = render(<Checkbox disabled />)
    expect(container.querySelector('.a63-Checkbox')).toHaveAttribute('data-disabled')
  })
})
