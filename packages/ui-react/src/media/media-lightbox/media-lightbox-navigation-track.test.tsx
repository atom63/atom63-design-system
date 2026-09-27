import { act, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MediaLightbox } from './media-lightbox'
import type { MediaLightboxItem } from './types'

// Motion's frameloop captures `requestAnimationFrame` when it is first
// imported; the fake clock has to be in place before that, for the whole file.
vi.hoisted(() => {
  vi.useFakeTimers()
})

const items: MediaLightboxItem[] = [
  { alt: 'One', id: 'one', src: '/one.webp', title: 'One' },
  { alt: 'Two', id: 'two', src: '/two.webp', title: 'Two' },
  { alt: 'Three', id: 'three', src: '/three.webp', title: 'Three' },
  { alt: 'Four', id: 'four', src: '/four.webp', title: 'Four' },
]

function lightbox(index: number) {
  return (
    <MediaLightbox
      index={index}
      items={items}
      onIndexChange={vi.fn()}
      onOpenChange={vi.fn()}
      open
    />
  )
}

/** `Slides` mounts the preload neighbourhood two frames after opening. */
async function flush(ms = 50) {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms)
  })
}

function strip(): HTMLElement {
  const element = document.querySelector<HTMLElement>('[data-slot="media-lightbox-strip"]')
  if (!element) {
    throw new Error('strip missing')
  }
  return element
}

function drawn(): number {
  const match = /calc\((-?[\d.]+) \*/.exec(strip().style.transform)
  return -Number(match?.[1]) || 0
}

function mockReducedMotion(): () => void {
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
  return () => {
    window.matchMedia = originalMatchMedia
  }
}

afterEach(async () => {
  await flush(2000)
})

describe('MediaLightbox navigation track', () => {
  it('opens with the strip resting on the active slide', async () => {
    render(lightbox(2))
    await flush()

    expect(drawn()).toBe(2)
    expect(strip().style.willChange).toBe('')
  })

  it('turns the page by moving the strip, not by fading the slides', async () => {
    const { rerender } = render(lightbox(0))
    await flush()

    rerender(lightbox(1))

    // Still drawn where it was: the spring carries it from here.
    expect(drawn()).toBe(0)
    expect(strip().style.willChange).toBe('transform')
    for (const slide of document.querySelectorAll<HTMLElement>(
      '[data-slot="media-lightbox-slide"]'
    )) {
      expect(slide.style.opacity).toBe('')
    }

    await flush(100)
    expect(drawn()).toBeGreaterThan(0)
    expect(drawn()).toBeLessThan(1)

    await flush(2000)
    expect(drawn()).toBe(1)
    expect(strip().style.willChange).toBe('')
  })

  it('keeps every slide the strip passes over mounted until it comes to rest', async () => {
    const { rerender } = render(lightbox(0))
    await flush()

    // Two quick steps: the second lands while the strip is still between
    // "One" and "Two". "One" is outside the preload of index 2 but still on
    // screen, so it must not unmount.
    rerender(lightbox(1))
    await flush(50)
    rerender(lightbox(2))

    expect(screen.getByAltText('One')).toBeInTheDocument()
    expect(drawn()).toBeLessThan(1)

    await flush(2000)
    expect(drawn()).toBe(2)
    expect(screen.queryByAltText('One')).toBeNull()
  })

  it('cuts a jump of more than one slide instead of sweeping past unmounted ones', async () => {
    const { rerender } = render(lightbox(0))
    await flush()

    rerender(lightbox(3))

    expect(drawn()).toBe(3)
    expect(strip().style.willChange).toBe('')
    expect(screen.queryByAltText('One')).toBeNull()
  })

  it('switches instantly under prefers-reduced-motion', async () => {
    const restore = mockReducedMotion()
    try {
      const { rerender } = render(lightbox(0))
      await flush()

      rerender(lightbox(1))

      expect(drawn()).toBe(1)
      expect(strip().style.willChange).toBe('')
    } finally {
      restore()
    }
  })

  it('keeps nothing blurred over the photo while the strip moves', async () => {
    const { rerender } = render(lightbox(0))
    await flush()
    const dialog = screen.getByRole('dialog')

    rerender(lightbox(1))
    // The recipe drops the on-media controls' backdrop blur under this flag.
    expect(dialog).toHaveAttribute('data-paging')

    await flush(2000)
    expect(dialog).not.toHaveAttribute('data-paging')
  })
})
