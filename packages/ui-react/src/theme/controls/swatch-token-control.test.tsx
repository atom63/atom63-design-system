import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { BRAND_OPTIONS } from '../core/options'
import { SwatchTokenControl } from './swatch-token-control'

const brandSwatch = (id: string) =>
  id === 'auto' ? 'linear-gradient(135deg, red, blue)' : `var(--color-${id}-500)`

describe('SwatchTokenControl', () => {
  it('renders a swatch segment per option and calls onChange with the id', () => {
    const onChange = vi.fn()
    render(
      <SwatchTokenControl
        onChange={onChange}
        options={BRAND_OPTIONS}
        swatch={brandSwatch}
        value="b1"
      />
    )
    // aria-label is the option name (b2), even though the visible content is a swatch
    fireEvent.click(screen.getByRole('tab', { name: 'b2' }))
    expect(onChange).toHaveBeenCalledWith('b2')
  })
})
