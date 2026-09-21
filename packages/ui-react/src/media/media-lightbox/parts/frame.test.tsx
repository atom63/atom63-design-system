import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { LightboxContent } from './content'
import { LightboxFrame, LightboxMedia, LightboxZoom } from './frame'
import { LightboxPortal, LightboxRoot } from './root'
import { LightboxSlide, LightboxSlides, LightboxViewport } from './slides'
import type { MediaLightboxItem } from '../types'

const items: MediaLightboxItem[] = [
  { alt: 'One wallpaper', id: 'one', src: '/one.webp', title: 'One' },
  { alt: 'Two wallpaper', id: 'two', src: '/two.webp', title: 'Two' },
  // Two slides away from the first, so the default `preload` of 1 leaves it
  // outside the neighbourhood — the only place a probe is still forbidden.
  { alt: 'Three wallpaper', id: 'three', src: '/three.webp', title: 'Three' },
]

function renderFrames(index: number) {
  render(
    <LightboxRoot index={index} items={items} onIndexChange={vi.fn()} onOpenChange={vi.fn()} open>
      <LightboxPortal>
        <LightboxContent>
          <LightboxViewport>
            <LightboxSlides>
              {slide => (
                <LightboxSlide key={slide.item.id}>
                  <LightboxFrame>
                    <LightboxZoom>
                      <LightboxMedia />
                    </LightboxZoom>
                  </LightboxFrame>
                </LightboxSlide>
              )}
            </LightboxSlides>
          </LightboxViewport>
        </LightboxContent>
      </LightboxPortal>
    </LightboxRoot>
  )
}

describe('Lightbox.Frame', () => {
  it('renders the active item at full size', () => {
    renderFrames(1)
    expect(screen.getByAltText('Two wallpaper')).toHaveAttribute('src', '/two.webp')
  })

  it('gives each slide a frame and a dedicated zoom layer', () => {
    renderFrames(0)
    expect(document.querySelectorAll('[data-slot="media-lightbox-frame"]').length).toBeGreaterThan(
      0
    )
    expect(document.querySelectorAll('[data-slot="media-lightbox-zoom"]').length).toBeGreaterThan(0)
  })

  it('keeps media outside the preload neighbourhood unmounted', () => {
    // 一张 2880x1920 解码后常驻约 22MB；长图库不能把整条轨道都挂上。
    render(
      <LightboxRoot
        index={0}
        items={[...items, { alt: 'Far away', id: 'far', src: '/far.webp', title: 'Far' }]}
        onIndexChange={vi.fn()}
        onOpenChange={vi.fn()}
        open
        preload={0}
      >
        <LightboxPortal>
          <LightboxContent>
            <LightboxViewport>
              <LightboxSlides>
                {slide => (
                  <LightboxSlide key={slide.item.id}>
                    <LightboxFrame>
                      <LightboxZoom>
                        <LightboxMedia />
                      </LightboxZoom>
                    </LightboxFrame>
                  </LightboxSlide>
                )}
              </LightboxSlides>
            </LightboxViewport>
          </LightboxContent>
        </LightboxPortal>
      </LightboxRoot>
    )

    expect(screen.queryByAltText('Far away')).toBeNull()
  })

  it('probes only the slides it has mounted, never the whole gallery', async () => {
    // Each mounted slide resolves its own shape: gated on `isActive` instead,
    // a slide had no aspect until it became active and then gained one, which
    // resized it on screen mid-crossfade while both it and the slide it
    // replaced were at full opacity. The probe hits a URL the neighbourhood
    // is already fetching for its own `<img>`, so it costs a cache read
    // rather than a download — but a slide it has *not* mounted must still
    // not reach for one.
    //
    // `useMediaAspect` probes with a bare `new Image()` never attached to the
    // document. A mounted slide's real `<img>` goes through the same property
    // setter once connected, so only the *detached* assignments are the
    // aspect probe's — that is what this filters for.
    const probedSrcs: string[] = []
    const descriptor = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src')
    if (!descriptor?.set || !descriptor.get) {
      throw new Error('HTMLImageElement.prototype.src is expected to be an accessor in jsdom.')
    }
    const originalSet = descriptor.set
    Object.defineProperty(HTMLImageElement.prototype, 'src', {
      ...descriptor,
      set(this: HTMLImageElement, value: string) {
        if (!this.isConnected) {
          probedSrcs.push(value)
        }
        originalSet.call(this, value)
      },
    })

    try {
      // The default preload of 1 keeps "two" mounted once the opening
      // double-`requestAnimationFrame` delay settles; "three" stays out.
      renderFrames(0)
      await waitFor(() => {
        expect(screen.getByAltText('Two wallpaper')).toBeInTheDocument()
      })
      expect(screen.queryByAltText('Three wallpaper')).toBeNull()
      expect(probedSrcs).not.toContain('/three.webp')
    } finally {
      Object.defineProperty(HTMLImageElement.prototype, 'src', descriptor)
    }
  })
})
