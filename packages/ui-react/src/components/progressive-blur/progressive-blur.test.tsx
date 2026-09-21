import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ProgressiveBlur } from './progressive-blur'

function layers(container: HTMLElement): HTMLElement[] {
  const box = container.querySelector<HTMLElement>('[data-slot="progressive-blur"]')
  return box ? [...box.children].map(child => child as HTMLElement) : []
}

describe('ProgressiveBlur', () => {
  it('renders one masked layer per blur level', () => {
    const { container } = render(<ProgressiveBlur blurLevels={[1, 4, 16, 64]} />)
    const rendered = layers(container)

    expect(rendered).toHaveLength(4)
    expect(rendered.map(l => l.style.backdropFilter)).toEqual([
      'blur(1px)',
      'blur(4px)',
      'blur(16px)',
      'blur(64px)',
    ])
  })

  /**
   * The bands must tile the height without gaps or overlap — a gap shows as a
   * visible seam in the ramp, which is the artefact the component exists to
   * avoid. Percentages are read back from the normalised value jsdom stores.
   */
  it('splits the height into contiguous bands', () => {
    const { container } = render(<ProgressiveBlur blurLevels={[1, 2, 3, 4]} />)

    const stops = layers(container).map(l =>
      [...l.style.maskImage.matchAll(/([\d.]+)%/g)].map(m => m[1])
    )

    expect(stops).toEqual([
      ['0', '25'],
      ['25', '50'],
      ['50', '75'],
      ['75', '100'],
    ])
  })

  it('stacks later, stronger layers above earlier ones', () => {
    const { container } = render(<ProgressiveBlur blurLevels={[1, 2, 3]} />)
    expect(layers(container).map(l => l.style.zIndex)).toEqual(['1', '2', '3'])
  })

  it('ramps from the top edge when positioned top', () => {
    const { container } = render(<ProgressiveBlur blurLevels={[1, 2]} position="top" />)
    const box = container.querySelector('[data-slot="progressive-blur"]')

    expect(box).toHaveClass('top-0')
    expect(layers(container)[0]?.style.maskImage).toContain('to top')
  })

  it('spans the box and masks both edges when positioned both', () => {
    const { container } = render(<ProgressiveBlur blurLevels={[1, 2]} position="both" />)
    const box = container.querySelector<HTMLElement>('[data-slot="progressive-blur"]')

    expect(box).toHaveClass('inset-y-0')
    expect(box?.style.height).toBe('100%')
    expect(layers(container)[0]?.style.maskImage).toContain('5%')
  })

  it('applies the requested height for a single-edge ramp', () => {
    const { container } = render(<ProgressiveBlur blurLevels={[1]} height="65%" />)
    expect(
      container.querySelector<HTMLElement>('[data-slot="progressive-blur"]')?.style.height
    ).toBe('65%')
  })

  /** Decorative: it must never reach assistive technology. */
  it('is hidden from the accessibility tree', () => {
    render(<ProgressiveBlur blurLevels={[1]} />)
    expect(screen.queryByRole('presentation')).not.toBeInTheDocument()
    expect(document.querySelector('[data-slot="progressive-blur"]')).toHaveAttribute(
      'aria-hidden',
      'true'
    )
  })

  it('never intercepts pointer input', () => {
    const { container } = render(<ProgressiveBlur blurLevels={[1]} />)
    expect(container.querySelector('[data-slot="progressive-blur"]')).toHaveClass(
      'pointer-events-none'
    )
  })
})
