import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Calendar } from './calendar'

describe('Calendar', () => {
  const september2026 = new Date(2026, 8, 1)

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

  it('marks the selected date and reports a new date selection', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    const selected = new Date(2026, 8, 15)
    render(
      <Calendar
        defaultMonth={september2026}
        mode="single"
        onSelect={onSelect}
        selected={selected}
      />
    )

    expect(document.querySelector('[data-day="2026-09-15"]')).toHaveAttribute(
      'aria-selected',
      'true'
    )
    await user.click(screen.getByRole('button', { name: /Wednesday, September 16, 2026/i }))
    expect(onSelect).toHaveBeenCalledWith(
      new Date(2026, 8, 16),
      expect.any(Date),
      expect.any(Object),
      expect.any(Object)
    )
  })

  it('disables matching dates and does not select them', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    const disabled = new Date(2026, 8, 20)
    render(
      <Calendar
        defaultMonth={september2026}
        disabled={disabled}
        mode="single"
        onSelect={onSelect}
      />
    )

    const disabledDay = screen.getByRole('button', {
      name: /Sunday, September 20, 2026/i,
    })
    expect(disabledDay).toBeDisabled()
    expect(disabledDay.closest('[role="gridcell"]')).toHaveAttribute('data-disabled', 'true')
    await user.click(disabledDay)
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('renders adjacent-month dates at the month grid boundary', () => {
    render(<Calendar defaultMonth={september2026} mode="single" />)

    const previousMonthDay = document.querySelector('[data-day="2026-08-30"]')
    const nextMonthDay = document.querySelector('[data-day="2026-10-03"]')
    expect(previousMonthDay).toHaveAttribute('data-outside', 'true')
    expect(nextMonthDay).toHaveAttribute('data-outside', 'true')
  })

  it('names each day with a full date that contains the number shown', () => {
    render(<Calendar defaultMonth={new Date(2026, 8, 1)} mode="single" />)
    const day = screen.getByRole('button', { name: /^Wednesday, September 16, 2026$/ })
    expect(day).toHaveTextContent('16')
  })

  it('shows weekday headers without an aria-label that hides the visible name', () => {
    // react-day-picker hides the header row from assistive technology (each day button names its
    // weekday); without an aria-label the header no longer fails WCAG 2.5.3 checks.
    const { container } = render(<Calendar defaultMonth={new Date(2026, 8, 1)} mode="single" />)
    const header = container.querySelector('th.a63-Calendar-weekday')
    expect(header).not.toHaveAttribute('aria-label')
    expect(header).toHaveTextContent(/^Su$/)
  })

  it('keeps the day names when the caller passes other labels', () => {
    render(
      <Calendar
        defaultMonth={new Date(2026, 8, 1)}
        labels={{ labelNext: () => 'Following month' }}
        mode="single"
      />
    )
    expect(screen.getByRole('button', { name: 'Following month' })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /^Wednesday, September 16, 2026$/ })
    ).toBeInTheDocument()
  })
})
