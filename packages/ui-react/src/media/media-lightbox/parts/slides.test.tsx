import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { LightboxContent } from './content'
import { LightboxPortal, LightboxRoot } from './root'
import { LightboxSlide, LightboxSlides, LightboxViewport } from './slides'
import type { MediaLightboxItem } from '../types'

const items: MediaLightboxItem[] = [
  { alt: 'One', id: 'one', src: '/one.webp', title: 'One' },
  { alt: 'Two', id: 'two', src: '/two.webp', title: 'Two' },
  { alt: 'Three', id: 'three', src: '/three.webp', title: 'Three' },
]

function renderSlides(index: number) {
  render(
    <LightboxRoot index={index} items={items} onIndexChange={vi.fn()} onOpenChange={vi.fn()} open>
      <LightboxPortal>
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

describe('Lightbox.Slides', () => {
  it('lays one snapping slide out per item', () => {
    renderSlides(0)
    expect(document.querySelectorAll('[data-slot="media-lightbox-slide"]')).toHaveLength(3)
    expect(document.querySelector('[data-slot="media-lightbox-track"]')).not.toBeNull()
  })

  it('leaves only the active slide reachable', () => {
    renderSlides(1)
    const slides = document.querySelectorAll('[data-slot="media-lightbox-slide"]')
    expect(slides[1]).not.toHaveAttribute('inert')
    expect(slides[0]).toHaveAttribute('inert')
    expect(slides[2]).toHaveAttribute('inert')
  })

  it('names the track as a carousel for assistive technology', () => {
    renderSlides(0)
    const track = screen.getByRole('group', { name: 'Media' })
    expect(track).toHaveAttribute('aria-roledescription', 'carousel')
  })
})
