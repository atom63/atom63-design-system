import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

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
