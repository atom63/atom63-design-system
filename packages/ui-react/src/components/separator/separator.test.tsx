import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Separator } from './separator'

describe('Separator', () => {
  it('renders a horizontal default separator', () => {
    const { container } = render(<Separator />)
    const el = container.querySelector('.a63-Separator')
    expect(el).toHaveAttribute('data-slot', 'separator')
    expect(el).toHaveAttribute('data-variant', 'default')
    expect(el).toHaveAttribute('data-orientation', 'horizontal')
  })

  it('applies the gradient variant + vertical orientation', () => {
    const { container } = render(<Separator orientation="vertical" variant="gradient" />)
    const el = container.querySelector('.a63-Separator')
    expect(el).toHaveAttribute('data-variant', 'gradient')
    expect(el).toHaveAttribute('data-orientation', 'vertical')
  })

  it('can expose a semantic separator to assistive technology', () => {
    const { getByRole } = render(<Separator orientation="vertical" />)
    expect(getByRole('separator')).toHaveAttribute('aria-orientation', 'vertical')
  })

  it('hides a decorative separator from assistive technology', () => {
    const { container, queryByRole } = render(<Separator decorative />)
    expect(queryByRole('separator')).toBeNull()
    expect(container.querySelector('.a63-Separator')).toHaveAttribute('aria-hidden', 'true')
  })
})
