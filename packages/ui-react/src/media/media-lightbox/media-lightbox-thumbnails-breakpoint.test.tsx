import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MediaLightbox } from './media-lightbox'
import type { MediaLightboxItem } from './types'

const items: MediaLightboxItem[] = [
  { alt: 'One', id: 'one', src: '/one.webp', title: 'One' },
  { alt: 'Two', id: 'two', src: '/two.webp', title: 'Two' },
]

function setInnerWidth(width: number) {
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: width })
}

const originalInnerWidth = window.innerWidth

afterEach(() => {
  setInnerWidth(originalInnerWidth)
})

describe('MediaLightbox thumbnail strip below the sm breakpoint', () => {
  it('does not render the strip at all on a phone-width viewport', () => {
    setInnerWidth(375)

    render(
      <MediaLightbox
        index={0}
        items={items}
        onIndexChange={vi.fn()}
        onOpenChange={vi.fn()}
        open
        thumbnails
      />
    )

    expect(screen.queryAllByRole('tab')).toHaveLength(0)
    expect(document.querySelector('[data-slot="media-lightbox-thumbnails"]')).toBeNull()
  })

  it('falls the active slide back to a standalone group, not a tabpanel naming a tab that was never rendered', () => {
    setInnerWidth(375)

    render(
      <MediaLightbox
        index={0}
        items={items}
        onIndexChange={vi.fn()}
        onOpenChange={vi.fn()}
        open
        thumbnails
      />
    )

    const activeSlide = document.querySelector('[data-slot="media-lightbox-slide"][data-active]')
    expect(activeSlide).toHaveAttribute('role', 'group')
    expect(activeSlide).not.toHaveAttribute('aria-labelledby')
  })

  it('still renders the strip at sm and up', () => {
    setInnerWidth(1024)

    render(
      <MediaLightbox
        index={0}
        items={items}
        onIndexChange={vi.fn()}
        onOpenChange={vi.fn()}
        open
        thumbnails
      />
    )

    expect(screen.getAllByRole('tab')).toHaveLength(2)
  })
})
