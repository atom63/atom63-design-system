import { fireEvent, render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { TextTicker } from './text-ticker'

describe('TextTicker', () => {
  it('renders its children as a static truncated line by default', () => {
    const { getByText, container } = render(<TextTicker>Now playing — A Side</TextTicker>)
    expect(getByText('Now playing — A Side')).not.toBeNull()
    const el = container.querySelector('.a63-TextTicker')
    expect(el).not.toBeNull()
    expect(el).toHaveAttribute('data-slot', 'text-ticker')
    expect(el).toHaveAttribute('data-static')
  })

  it('takes the contract variant: truncate by default, marquee with variant="marquee"', () => {
    const { container } = render(
      <>
        <TextTicker>Short</TextTicker>
        <TextTicker variant="marquee">A very long track title</TextTicker>
      </>
    )
    const [truncate, marquee] = container.querySelectorAll('[data-slot="text-ticker"]')
    expect(truncate).toHaveAttribute('data-variant', 'truncate')
    expect(marquee).toHaveAttribute('data-variant', 'marquee')
    expect(marquee).toHaveClass('a63-TextTicker--marquee')
  })

  it('renders the marquee variant when animationType="marquee"', () => {
    const { container } = render(
      <TextTicker animationType="marquee" autoPlay>
        A very long track title that should overflow its container
      </TextTicker>
    )
    const el = container.querySelector('.a63-TextTicker')
    expect(el).not.toBeNull()
    expect(el?.classList.contains('a63-TextTicker--marquee')).toBe(true)
    // The measurement probe is always present in marquee mode.
    expect(container.querySelector('.a63-TextTicker-measure')).not.toBeNull()
    // The static content copy renders the text.
    expect(container.querySelector('.a63-TextTicker-content')?.textContent).toBe(
      'A very long track title that should overflow its container'
    )
  })

  it('forwards a custom className', () => {
    const { container } = render(<TextTicker className="custom-x">Label</TextTicker>)
    expect(container.querySelector('.a63-TextTicker')?.classList.contains('custom-x')).toBe(true)
  })

  it('forwards span props and merges caller styles', () => {
    const { container } = render(
      <TextTicker data-testid="ticker" style={{ color: 'red' }}>
        Label
      </TextTicker>
    )
    expect(container.querySelector('[data-testid="ticker"]')).toHaveStyle({
      color: 'rgb(255, 0, 0)',
    })
  })
})

describe('TextTicker autoPlay pause (WCAG 2.2.2)', () => {
  // jsdom has no layout: make the measured text wider than its viewport.
  beforeEach(() => {
    vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockImplementation(function (
      this: HTMLElement
    ) {
      return this.classList.contains('a63-TextTicker-measure') ? 400 : 0
    })
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(200)
  })
  afterEach(() => {
    vi.restoreAllMocks()
  })

  const long = 'A very long track title that should overflow its container'

  it('renders a pause toggle that pauses and resumes the autoplaying marquee', () => {
    const { container } = render(
      <TextTicker autoPlay variant="marquee">
        {long}
      </TextTicker>
    )
    const root = container.querySelector('.a63-TextTicker')
    expect(root).toHaveAttribute('data-autoplay')
    expect(root).not.toHaveAttribute('data-paused')

    const toggle = screen.getByRole('button', { name: 'Pause' })
    expect(toggle).toHaveAttribute('aria-pressed', 'false')
    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-pressed', 'true')
    expect(root).toHaveAttribute('data-paused')
    fireEvent.click(toggle)
    expect(root).not.toHaveAttribute('data-paused')
  })

  it('takes a translated label for the toggle', () => {
    render(
      <TextTicker autoPlay pauseLabel="暂停" variant="marquee">
        {long}
      </TextTicker>
    )
    expect(screen.getByRole('button', { name: '暂停' })).toBeInTheDocument()
  })

  it('hands pausing to the caller when paused is passed', () => {
    const { container, rerender } = render(
      <TextTicker autoPlay paused variant="marquee">
        {long}
      </TextTicker>
    )
    expect(screen.queryByRole('button')).toBeNull()
    expect(container.querySelector('.a63-TextTicker')).toHaveAttribute('data-paused')
    rerender(
      <TextTicker autoPlay paused={false} variant="marquee">
        {long}
      </TextTicker>
    )
    expect(container.querySelector('.a63-TextTicker')).not.toHaveAttribute('data-paused')
  })

  it('renders no toggle without autoPlay', () => {
    render(<TextTicker variant="marquee">{long}</TextTicker>)
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('forwards a caller ref and onClick without breaking overflow measurement', () => {
    const ref = createRef<HTMLSpanElement>()
    const onClick = vi.fn()
    const { container } = render(
      <TextTicker autoPlay onClick={onClick} ref={ref} variant="marquee">
        {long}
      </TextTicker>
    )
    const root = container.querySelector('.a63-TextTicker')
    expect(ref.current).toBe(root)
    expect(root).toHaveAttribute('data-overflowing')
    fireEvent.click(screen.getByRole('button', { name: 'Pause' }))
    expect(root).toHaveAttribute('data-paused')
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
