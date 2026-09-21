import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { MediaLightbox } from './media-lightbox'
import type { MediaLightboxItem } from './types'

const items: MediaLightboxItem[] = [
  { alt: 'One', id: 'one', src: '/one.webp', title: 'One' },
  { alt: 'Two', id: 'two', src: '/two.webp', title: 'Two' },
]

function counter(): Element | null {
  return document.querySelector('[data-slot="media-lightbox-counter"]')
}

/**
 * `Lightbox.Status` already announces "title, position" into a polite live
 * region, so a counter that announced as well would say it twice. It is
 * drawn for the eye and hidden from the announcement — and where the
 * thumbnail strip is showing position visually, it is not drawn at all.
 */
describe('MediaLightbox counter', () => {
  it('is drawn but never announced, since Status already announces position', () => {
    render(
      <MediaLightbox index={0} items={items} onIndexChange={vi.fn()} onOpenChange={vi.fn()} open />
    )

    expect(counter()).toHaveAttribute('aria-hidden', 'true')
  })

  it('still hides from the announcement when the item carries a caption', () => {
    const withCaption: MediaLightboxItem[] = [
      { ...items[0], caption: 'Shot on a Tuesday' },
      items[1],
    ]

    render(
      <MediaLightbox
        index={0}
        items={withCaption}
        onIndexChange={vi.fn()}
        onOpenChange={vi.fn()}
        open
      />
    )

    expect(counter()).toHaveAttribute('aria-hidden', 'true')
  })

  it('does not draw at all for a single item', () => {
    render(
      <MediaLightbox
        index={0}
        items={[items[0]]}
        onIndexChange={vi.fn()}
        onOpenChange={vi.fn()}
        open
      />
    )

    expect(counter()).toBeNull()
  })
})
