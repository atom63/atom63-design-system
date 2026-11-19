import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { MediaPlaceholder } from './media-placeholder'

describe('MediaPlaceholder', () => {
  it('defaults to an image placeholder at 16:9', () => {
    const { container } = render(<MediaPlaceholder />)

    expect(screen.getByText('image placeholder')).toBeInTheDocument()
    const frame = container.querySelector('.mdx-media-placeholder') as HTMLElement
    expect(frame.style.aspectRatio).toBe('16 / 9')
  })

  it('shows the kind, the label and the aspect ratio it is given', () => {
    const { container } = render(
      <MediaPlaceholder aspectRatio="1 / 1" kind="video" label="Screen recording of the tour" />
    )

    expect(screen.getByText('video placeholder')).toBeInTheDocument()
    expect(screen.getByText('Screen recording of the tour')).toBeInTheDocument()
    const frame = container.querySelector('.mdx-media-placeholder') as HTMLElement
    expect(frame.style.aspectRatio).toBe('1 / 1')
  })

  it('keeps its icon out of the accessibility tree', () => {
    const { container } = render(<MediaPlaceholder kind="diagram" />)

    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  })

  it('has no axe violations', async () => {
    const { container } = render(<MediaPlaceholder kind="diagram" label="System overview" />)

    expect(await axe(container)).toHaveNoViolations()
  })
})
