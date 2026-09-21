import { act, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { MediaLightbox } from './media-lightbox'
import type { MediaLightboxItem } from './types'

const items: MediaLightboxItem[] = [
  { alt: 'One', id: 'one', src: '/one.webp', title: 'One' },
  { alt: 'Two', id: 'two', src: '/two.webp', title: 'Two' },
  { alt: 'Three', id: 'three', src: '/three.webp', title: 'Three' },
]

/**
 * `Slides`'s own preload effect waits two animation frames before mounting
 * neighbours, so opening the lightbox and then immediately asserting on the
 * preload neighbourhood catches it mid-settle. Every test here navigates
 * only after that has already happened.
 */
async function flushPreloadNeighbourhood() {
  await act(async () => {
    await new Promise<void>(resolve => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          resolve()
        })
      })
    })
  })
}

describe('MediaLightbox navigation crossfade', () => {
  it('turns the page by fading opacity, never by scrolling the stack', async () => {
    const scrollToSpy = vi.fn()
    const originalScrollTo = Element.prototype.scrollTo
    Element.prototype.scrollTo = scrollToSpy

    try {
      const { rerender } = render(
        <MediaLightbox
          index={0}
          items={items}
          onIndexChange={vi.fn()}
          onOpenChange={vi.fn()}
          open
        />
      )
      await flushPreloadNeighbourhood()
      scrollToSpy.mockClear()

      rerender(
        <MediaLightbox
          index={1}
          items={items}
          onIndexChange={vi.fn()}
          onOpenChange={vi.fn()}
          open
        />
      )

      expect(scrollToSpy).not.toHaveBeenCalled()
      const slides = document.querySelectorAll<HTMLElement>('[data-slot="media-lightbox-slide"]')
      expect(slides[1]).toHaveStyle({ opacity: '1' })
      expect(slides[0]).toHaveStyle({ opacity: '0' })
    } finally {
      Element.prototype.scrollTo = originalScrollTo
    }
  })

  it('keeps a slide mounted through the crossfade even once it is outside the preload neighbourhood', async () => {
    const { rerender } = render(
      <MediaLightbox index={0} items={items} onIndexChange={vi.fn()} onOpenChange={vi.fn()} open />
    )
    await flushPreloadNeighbourhood()

    // "one" (index 0) is neither active nor within a preload of "three"
    // (index 2) once the gallery lands there, but it was on screen a moment
    // ago and is still fading out — unmounting it now would fade to blank.
    rerender(
      <MediaLightbox index={2} items={items} onIndexChange={vi.fn()} onOpenChange={vi.fn()} open />
    )

    expect(screen.getByAltText('One')).toBeInTheDocument()
  })

  it('drops the outgoing slide once the crossfade finishes', async () => {
    const { rerender } = render(
      <MediaLightbox index={0} items={items} onIndexChange={vi.fn()} onOpenChange={vi.fn()} open />
    )
    await flushPreloadNeighbourhood()

    vi.useFakeTimers({ shouldAdvanceTime: true })
    try {
      rerender(
        <MediaLightbox
          index={2}
          items={items}
          onIndexChange={vi.fn()}
          onOpenChange={vi.fn()}
          open
        />
      )
      expect(screen.getByAltText('One')).toBeInTheDocument()

      // Comfortably past every named timing preset's duration.
      act(() => {
        vi.advanceTimersByTime(1000)
      })
      expect(screen.queryByAltText('One')).toBeNull()
    } finally {
      vi.useRealTimers()
    }
  })

  it('converges a rapid double-jump onto the latest target instead of queueing each fade', async () => {
    const { rerender } = render(
      <MediaLightbox index={0} items={items} onIndexChange={vi.fn()} onOpenChange={vi.fn()} open />
    )
    await flushPreloadNeighbourhood()

    vi.useFakeTimers({ shouldAdvanceTime: true })
    try {
      // First jump: 0 -> 1. "One" becomes the outgoing slide, fading out.
      rerender(
        <MediaLightbox
          index={1}
          items={items}
          onIndexChange={vi.fn()}
          onOpenChange={vi.fn()}
          open
        />
      )
      expect(screen.getByAltText('One')).toBeInTheDocument()

      // Well inside the fade duration, a second jump lands: 1 -> 2. This
      // must retarget onto "Two" rather than queue behind "One"'s fade —
      // "One" is not entitled to a turn of its own once superseded, so it
      // drops out immediately (see the comment on `useStageTransition`).
      act(() => {
        vi.advanceTimersByTime(50)
      })
      rerender(
        <MediaLightbox
          index={2}
          items={items}
          onIndexChange={vi.fn()}
          onOpenChange={vi.fn()}
          open
        />
      )

      expect(screen.queryByAltText('One')).toBeNull()
      expect(screen.getByAltText('Two')).toBeInTheDocument()
      expect(screen.getByAltText('Three')).toBeInTheDocument()

      // Comfortably past every named timing preset's duration, measured from
      // the *second* jump alone — nothing queued a second fade behind it.
      act(() => {
        vi.advanceTimersByTime(1000)
      })

      expect(screen.queryByAltText('One')).toBeNull()
      const three = screen.getByAltText('Three')
      expect(three).toBeInTheDocument()
      expect(three.closest('[data-slot="media-lightbox-slide"]')).toHaveStyle({ opacity: '1' })
      // "Two" (index 1) stays mounted — it is within the `preload={1}`
      // neighbourhood of the active index 2 regardless of the fade, not
      // because anything queued its own turn — but its fade is long since
      // finished, so it sits fully transparent.
      const two = screen.getByAltText('Two')
      expect(two.closest('[data-slot="media-lightbox-slide"]')).toHaveStyle({ opacity: '0' })
    } finally {
      vi.useRealTimers()
    }
  })

  it('switches instantly under prefers-reduced-motion, with no second slide kept alive to fade', async () => {
    const originalMatchMedia = window.matchMedia
    window.matchMedia = ((query: string) => ({
      addEventListener: () => {},
      addListener: () => {},
      dispatchEvent: () => false,
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      removeEventListener: () => {},
      removeListener: () => {},
    })) as unknown as typeof window.matchMedia

    try {
      const { rerender } = render(
        <MediaLightbox
          index={0}
          items={items}
          onIndexChange={vi.fn()}
          onOpenChange={vi.fn()}
          open
        />
      )
      await flushPreloadNeighbourhood()

      rerender(
        <MediaLightbox
          index={2}
          items={items}
          onIndexChange={vi.fn()}
          onOpenChange={vi.fn()}
          open
        />
      )

      expect(screen.queryByAltText('One')).toBeNull()
    } finally {
      window.matchMedia = originalMatchMedia
    }
  })
})
