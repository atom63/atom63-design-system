import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { Slider } from './slider'

describe('Slider', () => {
  it('renders a slider thumb with the current value', () => {
    render(<Slider aria-label="Tint" max={100} min={0} onValueChange={() => {}} value={40} />)
    const thumb = screen.getByRole('slider', { name: 'Tint' })
    expect(thumb).toBeInTheDocument()
    expect(thumb).toHaveAttribute('aria-valuenow', '40')
  })

  it('exposes the a63-Slider recipe root + track slots', () => {
    const { container } = render(<Slider aria-label="Tint" onValueChange={() => {}} value={10} />)
    expect(container.querySelector('.a63-Slider')).not.toBeNull()
    expect(container.querySelector('[data-slot="slider-track"]')).not.toBeNull()
    expect(container.querySelector('[data-slot="slider-thumb"]')).not.toBeNull()
  })

  it('delivers a plain number (not an array) to onValueChange on keyboard step', () => {
    const onValueChange = vi.fn()
    render(<Slider aria-label="Tint" max={100} min={0} onValueChange={onValueChange} value={40} />)
    const thumb = screen.getByRole('slider', { name: 'Tint' })
    thumb.focus()
    fireEvent.keyDown(thumb, { key: 'ArrowRight' })
    expect(onValueChange).toHaveBeenCalledTimes(1)
    expect(onValueChange).toHaveBeenCalledWith(41)
    expect(typeof onValueChange.mock.calls[0][0]).toBe('number')
  })

  it('marks the slider disabled', () => {
    const { container } = render(
      <Slider aria-label="Tint" disabled onValueChange={() => {}} value={20} />
    )
    expect(container.querySelector('.a63-Slider')).toHaveAttribute('data-disabled')
  })

  it('supports vertical orientation and distinct range thumb labels', () => {
    const { container } = render(
      <Slider
        defaultValue={[25, 75]}
        getThumbAriaLabel={index => (index === 0 ? 'Minimum' : 'Maximum')}
        orientation="vertical"
      />
    )
    expect(container.querySelector('.a63-Slider')).toHaveAttribute('data-orientation', 'vertical')
    expect(screen.getByRole('slider', { name: 'Minimum' })).toBeInTheDocument()
    expect(screen.getByRole('slider', { name: 'Maximum' })).toBeInTheDocument()
  })
})
