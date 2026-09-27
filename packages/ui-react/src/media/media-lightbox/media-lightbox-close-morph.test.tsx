import { cleanup, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MediaLightbox } from './media-lightbox'
import * as originMorph from './origin-morph'
import type { MediaLightboxItem } from './types'

vi.mock('./origin-morph', async importOriginal => {
  const actual = await importOriginal<typeof import('./origin-morph')>()
  return { ...actual, measureOriginMorph: vi.fn(actual.measureOriginMorph) }
})

const items: MediaLightboxItem[] = ['one', 'two', 'three', 'four'].map(id => ({
  alt: id,
  id,
  src: `/${id}.webp`,
  title: id,
}))

function tile(): HTMLButtonElement {
  const element = document.createElement('button')
  element.scrollIntoView = vi.fn()
  document.body.append(element)
  return element
}

describe('the closing morph', () => {
  beforeEach(() => {
    // Every box is on screen and has a size, so both morph paths measure.
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue(
      new DOMRect(10, 10, 400, 225)
    )
  })

  afterEach(() => {
    cleanup()
    for (const element of document.querySelectorAll('body > button')) element.remove()
    vi.restoreAllMocks()
    vi.mocked(originMorph.measureOriginMorph).mockClear()
  })

  it('morphs the slide on screen after a page turn, not the one it opened on', () => {
    const first = tile()
    const fourth = tile()
    const props = { items, onIndexChange: vi.fn(), onOpenChange: vi.fn() }
    const { rerender } = render(<MediaLightbox {...props} index={0} open origin={first} />)
    rerender(<MediaLightbox {...props} index={3} open origin={first} />)
    vi.mocked(originMorph.measureOriginMorph).mockClear()

    rerender(<MediaLightbox {...props} index={3} open={false} origin={fourth} />)

    const [media, , target] = vi.mocked(originMorph.measureOriginMorph).mock.calls[0] ?? []
    const slide = media?.closest('[data-slot="media-lightbox-slide"]')
    // The measured media belongs to the fourth slide, the one on screen.
    const slides = [...document.querySelectorAll('[data-slot="media-lightbox-slide"]')]
    expect(slides.indexOf(slide as Element)).toBe(
      slides.findIndex(element => !element.hasAttribute('inert'))
    )
    expect(target).toBe(fourth)
  })

  it('does not restart the opening zoom when closing hands it a new origin', () => {
    const first = tile()
    const fourth = tile()
    const props = { items, onIndexChange: vi.fn(), onOpenChange: vi.fn() }
    const { rerender } = render(<MediaLightbox {...props} index={0} open origin={first} />)
    rerender(<MediaLightbox {...props} index={3} open origin={first} />)
    vi.mocked(originMorph.measureOriginMorph).mockClear()

    rerender(<MediaLightbox {...props} index={3} open={false} origin={fourth} />)

    // One measurement for the closing morph; a second one is the opening zoom
    // re-running against the new origin, whose last frame drew the photo full
    // size just before the overlay left.
    expect(originMorph.measureOriginMorph).toHaveBeenCalledTimes(1)
  })
})
