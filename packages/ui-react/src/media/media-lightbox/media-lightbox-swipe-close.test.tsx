import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { MediaLightbox } from './media-lightbox'
import type { MediaLightboxItem } from './types'

const items: MediaLightboxItem[] = [
  { alt: 'One', id: 'one', src: '/one.webp', title: 'One' },
  { alt: 'Two', id: 'two', src: '/two.webp', title: 'Two' },
]

function closeArea(): HTMLElement {
  const area = document.querySelector<HTMLElement>(
    '[data-slot="media-lightbox-slide"]:not([inert]) button[tabindex="-1"][aria-hidden]'
  )
  if (!area) {
    throw new Error('slide close area missing')
  }
  return area
}

/**
 * A swipe that lands on the gutter around the photo must not also dismiss.
 *
 * `SlideCloseArea` is a full-bleed hit target behind the media, so a gesture
 * over the letterbox margins both reports a page turn *and* ends on that
 * button. The browser then synthesises a `click` from the pointer sequence,
 * which would close the lightbox the swipe just turned the page in.
 *
 * jsdom never synthesises that click, which is exactly why the rest of the
 * suite cannot see this: the click has to be dispatched explicitly.
 */
describe('MediaLightbox swipe over the close area', () => {
  it('does not dismiss on the click that follows a page-turning swipe', () => {
    const onIndexChange = vi.fn()
    const onOpenChange = vi.fn()

    render(
      <MediaLightbox
        index={0}
        items={items}
        onIndexChange={onIndexChange}
        onOpenChange={onOpenChange}
        open
      />
    )

    const area = closeArea()
    const at = (type: string, clientX: number, time: number) => {
      const event = new PointerEvent(type, {
        bubbles: true,
        clientX,
        clientY: 400,
        isPrimary: true,
        pointerType: 'touch',
      })
      // `timeStamp` is read-only on Event; the velocity path reads it.
      Object.defineProperty(event, 'timeStamp', { value: time })
      return event
    }

    area.dispatchEvent(at('pointerdown', 900, 0))
    for (let step = 1; step <= 8; step += 1) {
      window.dispatchEvent(at('pointermove', 900 - step * 40, step * 16))
    }
    window.dispatchEvent(at('pointerup', 580, 144))

    // The swipe registered as a page turn...
    expect(onIndexChange).toHaveBeenCalledWith(1)

    // ...and the click the browser would now synthesise must be swallowed.
    area.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
    expect(onOpenChange).not.toHaveBeenCalled()
  })

  it('still dismisses on a plain click with no swipe before it', () => {
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

    closeArea().dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
})
