import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { RangeTokenControl } from './range-token-control'

describe('RangeTokenControl', () => {
  it('shows the label + a percent value and renders the slider at that value', () => {
    render(<RangeTokenControl label="Surface tint" onChange={() => {}} value={40} />)
    expect(screen.getByText('Surface tint')).toBeInTheDocument()
    expect(screen.getByText('40%')).toBeInTheDocument()
    expect(screen.getByRole('slider', { name: 'Surface tint' })).toHaveAttribute(
      'aria-valuenow',
      '40'
    )
  })

  it('shows "Off" at the minimum', () => {
    render(<RangeTokenControl label="Surface tint" onChange={() => {}} value={0} />)
    expect(screen.getByText('Off')).toBeInTheDocument()
  })
})
