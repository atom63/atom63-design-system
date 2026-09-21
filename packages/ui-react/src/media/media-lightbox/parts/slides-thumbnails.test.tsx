import { render } from '@testing-library/react'
import { useEffect } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { LightboxContent } from './content'
import { LightboxPortal, LightboxRoot } from './root'
import { LightboxSlide, LightboxSlides, LightboxViewport } from './slides'
import { useLightboxThumbnailsRegistry } from './thumbnails-registry'
import type { MediaLightboxItem } from '../types'

const items: MediaLightboxItem[] = [
  { alt: 'One', id: 'one', src: '/one.webp', title: 'One' },
  { alt: 'Two', id: 'two', src: '/two.webp', title: 'Two' },
]

/** Stands in for `Lightbox.Thumbnails` (Task 9), which registers itself the same way. */
function RegisterThumbnails() {
  const registerThumbnails = useLightboxThumbnailsRegistry()
  useEffect(() => {
    registerThumbnails(true)
    return () => {
      registerThumbnails(false)
    }
  }, [registerThumbnails])
  return null
}

function renderSlides({ withThumbnails }: { withThumbnails: boolean }) {
  render(
    <LightboxRoot index={0} items={items} onIndexChange={vi.fn()} onOpenChange={vi.fn()} open>
      <LightboxPortal>
        {withThumbnails ? <RegisterThumbnails /> : null}
        <LightboxContent>
          <LightboxViewport>
            <LightboxSlides>
              {slide => (
                <LightboxSlide key={slide.item.id}>
                  <span>{slide.item.title}</span>
                </LightboxSlide>
              )}
            </LightboxSlides>
          </LightboxViewport>
        </LightboxContent>
      </LightboxPortal>
    </LightboxRoot>
  )
}

describe('Lightbox.Slide thumbnail presence', () => {
  it('is a standalone group when no thumbnail strip is registered', () => {
    renderSlides({ withThumbnails: false })
    const activeSlide = document.querySelector('[data-slot="media-lightbox-slide"][data-active]')
    expect(activeSlide).toHaveAttribute('role', 'group')
    expect(activeSlide).toHaveAttribute('aria-label', 'One — 1 of 2')
    expect(activeSlide).not.toHaveAttribute('aria-labelledby')
  })

  it('is a tabpanel labelled by its thumbnail when a strip is registered', () => {
    renderSlides({ withThumbnails: true })
    const activeSlide = document.querySelector('[data-slot="media-lightbox-slide"][data-active]')
    expect(activeSlide).toHaveAttribute('role', 'tabpanel')
    expect(activeSlide).toHaveAttribute('aria-labelledby', 'a63-media-lightbox-thumb-one')
    expect(activeSlide).not.toHaveAttribute('aria-label')
  })
})
