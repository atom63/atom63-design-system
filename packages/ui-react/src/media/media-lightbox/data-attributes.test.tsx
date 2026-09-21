import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { MediaLightbox } from './media-lightbox'
import type { MediaLightboxItem } from './types'

const items: MediaLightboxItem[] = [
  { alt: 'One', id: 'one', src: '/one.webp', title: 'One' },
  { alt: 'Two', id: 'two', src: '/two.webp', title: 'Two' },
]

function renderAt(index: number) {
  render(
    <MediaLightbox
      index={index}
      items={items}
      onIndexChange={vi.fn()}
      onOpenChange={vi.fn()}
      open
    />
  )
}

describe('MediaLightbox data attributes', () => {
  it('marks the dialog open so chrome can react in pure CSS', () => {
    renderAt(0)
    expect(screen.getByRole('dialog')).toHaveAttribute('data-open', '')
  })

  it('publishes the active index and reading direction on the track', () => {
    renderAt(1)
    const track = document.querySelector('[data-slot="media-lightbox-track"]')
    expect(track).toHaveAttribute('data-active-index', '1')
    expect(track).toHaveAttribute('data-direction', 'ltr')
  })

  it('flags which slide is active and where it sits', () => {
    renderAt(1)
    const slides = document.querySelectorAll('[data-slot="media-lightbox-slide"]')
    expect(slides[1]).toHaveAttribute('data-active', '')
    expect(slides[0]).not.toHaveAttribute('data-active')
    expect(slides[0]).toHaveAttribute('data-index', '0')
  })

  it('says in the DOM when a control is disabled, not only in the a11y tree', () => {
    // Zoom out is disabled until something is zoomed. `Previous`/`Next` carry
    // the same attribute and are covered where they are actually composed
    // (`parts/chrome.test.tsx`); this preset gathers its controls in one
    // corner and does not render them.
    renderAt(0)
    const zoomOut = screen.getByRole('button', { name: /zoom out/i })
    expect(zoomOut).toBeDisabled()
    expect(zoomOut).toHaveAttribute('data-disabled', '')
  })
})
