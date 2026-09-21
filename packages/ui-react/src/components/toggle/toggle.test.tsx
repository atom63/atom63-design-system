import { toggleContract } from '@atom63/ui-foundation'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Toggle } from './toggle'

describe('Toggle', () => {
  it('renders a button with the default size + tone', () => {
    render(<Toggle>Grid</Toggle>)
    const el = screen.getByRole('button', { name: 'Grid' })
    expect(el).toHaveAttribute('data-slot', 'toggle')
    expect(el).toHaveAttribute('data-size', toggleContract.defaultSize)
    expect(el).toHaveAttribute('data-tone', toggleContract.defaultTone)
  })

  it('reflects the pressed state', () => {
    render(<Toggle defaultPressed>Grid</Toggle>)
    expect(screen.getByRole('button', { name: 'Grid' })).toHaveAttribute('data-pressed', '')
  })

  it('applies size and accent tone', () => {
    render(
      <Toggle size="lg" tone="accent">
        Grid
      </Toggle>
    )
    const el = screen.getByRole('button', { name: 'Grid' })
    expect(el).toHaveAttribute('data-size', 'lg')
    expect(el).toHaveAttribute('data-tone', 'accent')
  })

  it('fires onPressedChange on click', async () => {
    const onPressedChange = vi.fn()
    render(<Toggle onPressedChange={onPressedChange}>Grid</Toggle>)
    await userEvent.click(screen.getByRole('button', { name: 'Grid' }))
    expect(onPressedChange).toHaveBeenCalled()
    expect(onPressedChange.mock.calls[0][0]).toBe(true)
  })

  it('does not fire when disabled', async () => {
    const onPressedChange = vi.fn()
    render(
      <Toggle disabled onPressedChange={onPressedChange}>
        Grid
      </Toggle>
    )
    const el = screen.getByRole('button', { name: 'Grid' })
    expect(el).toHaveAttribute('data-disabled', '')
    await userEvent.click(el)
    expect(onPressedChange).not.toHaveBeenCalled()
  })
})
