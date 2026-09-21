import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Calendar } from './calendar'

describe('Calendar', () => {
  it('renders the a63-Calendar root with the calendar slot', () => {
    const { container } = render(<Calendar mode="single" />)
    const root = container.querySelector('.a63-Calendar')
    expect(root).not.toBeNull()
    expect(root).toHaveAttribute('data-slot', 'calendar')
  })

  it('renders a month grid with day cells', () => {
    const { container } = render(<Calendar mode="single" />)
    // react-day-picker renders the weeks as a table grid.
    expect(container.querySelector('[role="grid"]')).not.toBeNull()
    expect(container.querySelectorAll('.a63-Calendar-day-button').length).toBeGreaterThan(0)
  })

  it('applies user classNames on top of the a63-Calendar-* recipe classes', () => {
    const { container } = render(
      <Calendar classNames={{ day_button: 'extra-day' }} mode="single" />
    )
    const dayButton = container.querySelector('.a63-Calendar-day-button')
    expect(dayButton).not.toBeNull()
    expect(dayButton).toHaveClass('extra-day')
  })
})
