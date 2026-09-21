import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { MediaLightbox } from './media-lightbox'
import type { MediaLightboxItem } from './types'

const items: MediaLightboxItem[] = [
  { alt: 'One', id: 'one', src: '/one.webp', title: 'One' },
  { alt: 'Two', id: 'two', src: '/two.webp', title: 'Two' },
]

describe('MediaLightbox slide close area', () => {
  it('closes when the empty space around the photo is clicked', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()

    render(
      <MediaLightbox
        index={0}
        items={items}
        onIndexChange={vi.fn()}
        onOpenChange={onOpenChange}
        open
      />
    )

    const activeSlide = document.querySelector('[data-slot="media-lightbox-slide"]:not([inert])')
    expect(activeSlide).not.toBeNull()

    // The close area is a full-bleed, untabbable, `aria-hidden` hit target
    // behind the media — not a second stop in the accessibility tree, and not
    // reachable through `getByRole`.
    const closeArea = activeSlide?.querySelector('button[aria-hidden][tabindex="-1"]')
    expect(closeArea).not.toBeNull()

    await user.click(closeArea as HTMLElement)

    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
})
