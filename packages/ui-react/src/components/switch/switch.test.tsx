import { switchContract } from '@atom63/ui-foundation'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Switch } from './switch'

describe('Switch', () => {
  it('renders a switch role', () => {
    render(<Switch aria-label="Wifi" />)
    expect(screen.getByRole('switch', { name: 'Wifi' })).toBeInTheDocument()
  })

  it('falls back to the contract default size', () => {
    render(<Switch aria-label="Wifi" />)
    expect(screen.getByRole('switch', { name: 'Wifi' })).toHaveAttribute(
      'data-size',
      switchContract.defaultSize
    )
  })

  it('reflects the checked state', () => {
    render(<Switch aria-label="Wifi" defaultChecked />)
    expect(screen.getByRole('switch', { name: 'Wifi' })).toBeChecked()
  })

  it('renders thumb children', () => {
    render(
      <Switch aria-label="Appearance">
        <span data-testid="thumb-icon">☀</span>
      </Switch>
    )
    expect(screen.getByTestId('thumb-icon')).toBeInTheDocument()
  })
})
