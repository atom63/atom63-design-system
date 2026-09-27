import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MediaLightbox } from './media-lightbox'
import { isClippedByAncestor, revealOrigin, revealReturnTarget } from './reveal-origin'
import type { MediaLightboxItem } from './types'
import { runMediaViewTransition } from './view-transition'

function rect(left: number, top: number, width: number, height: number): DOMRect {
  return {
    bottom: top + height,
    height,
    left,
    right: left + width,
    toJSON: () => ({}),
    top,
    width,
    x: left,
    y: top,
  } as DOMRect
}

/**
 * A horizontal row, 600px wide, that scrolls its tiles. `tileLeft` is where the
 * tile currently sits; the row clips anything outside 0–600.
 */
function row(tileLeft: number) {
  const scroller = document.createElement('div')
  scroller.style.overflowX = 'auto'
  scroller.getBoundingClientRect = () => rect(0, 100, 600, 200)
  const tile = document.createElement('button')
  let left = tileLeft
  tile.getBoundingClientRect = () => rect(left, 100, 256, 170)
  // What a real scroll container does: bring the tile inside its bounds.
  tile.scrollIntoView = vi.fn(() => {
    left = Math.min(Math.max(left, 0), 600 - 256)
  })
  scroller.append(tile)
  document.body.append(scroller)
  return { scroller, tile }
}

afterEach(() => {
  cleanup()
  document.body.innerHTML = ''
  Reflect.deleteProperty(document, 'startViewTransition')
  vi.restoreAllMocks()
})

describe('isClippedByAncestor', () => {
  it('sees a tile scrolled out of its row, though it is inside the viewport', () => {
    expect(isClippedByAncestor(row(700).tile)).toBe(true)
    expect(isClippedByAncestor(row(500).tile)).toBe(true)
  })

  it('accepts a tile the row shows whole', () => {
    expect(isClippedByAncestor(row(40).tile)).toBe(false)
  })

  it('ignores ancestors that do not clip, and the body scroll lock', () => {
    const { scroller, tile } = row(700)
    scroller.style.overflowX = 'visible'
    document.body.style.overflow = 'hidden'

    expect(isClippedByAncestor(tile)).toBe(false)
    document.body.style.overflow = ''
  })
})

describe('revealReturnTarget', () => {
  it('scrolls the tile into its row instantly, then returns it', () => {
    const { tile } = row(900)

    expect(revealReturnTarget(tile)).toBe(tile)
    expect(tile.scrollIntoView).toHaveBeenCalledWith({
      behavior: 'instant',
      block: 'nearest',
      inline: 'nearest',
    })
  })

  it('gives up on a tile still clipped after the reveal, so the close cross-fades', () => {
    const { tile } = row(900)
    // A row that refuses to scroll, such as one with `overflow: hidden` and a
    // fixed scroll position.
    tile.scrollIntoView = vi.fn()

    expect(revealReturnTarget(tile)).toBeNull()
  })

  it('tolerates hosts without scrollIntoView', () => {
    expect(() => {
      revealOrigin(document.createElement('div'))
    }).not.toThrow()
    expect(revealReturnTarget(null)).toBeNull()
  })
})

describe('closing morphs', () => {
  const items: MediaLightboxItem[] = [
    { alt: 'One', id: 'one', src: '/one.webp', title: 'One' },
    { alt: 'Two', id: 'two', src: '/two.webp', title: 'Two' },
  ]

  it('reveals the return tile before the FLIP measures it', () => {
    const { tile } = row(900)
    const props = {
      index: 1,
      items,
      onIndexChange: vi.fn(),
      onOpenChange: vi.fn(),
      origin: tile,
    }
    const { rerender } = render(<MediaLightbox {...props} open />)

    rerender(<MediaLightbox {...props} open={false} />)

    expect(tile.scrollIntoView).toHaveBeenCalledWith({
      behavior: 'instant',
      block: 'nearest',
      inline: 'nearest',
    })
  })

  it('reveals the return tile before the view transition snapshots, and names only a visible one', () => {
    let named: string | undefined
    Object.defineProperty(document, 'startViewTransition', {
      configurable: true,
      value: (update: () => void) => {
        update()
        named = visible.style.viewTransitionName
        return { finished: Promise.resolve() }
      },
      writable: true,
    })
    const { tile: visible } = row(900)

    runMediaViewTransition({ direction: 'out', origin: visible, update: () => {} })

    expect(visible.scrollIntoView).toHaveBeenCalled()
    expect(named).toBe('a63-media-lightbox-media')
  })

  it('gives a tile still clipped after the reveal no morph name', async () => {
    let named: string | undefined = 'unset'
    const { tile } = row(900)
    tile.scrollIntoView = vi.fn()
    Object.defineProperty(document, 'startViewTransition', {
      configurable: true,
      value: (update: () => void) => {
        update()
        named = tile.style.viewTransitionName
        return { finished: Promise.resolve() }
      },
      writable: true,
    })

    runMediaViewTransition({ direction: 'out', origin: tile, update: () => {} })
    await Promise.resolve()

    expect(named).toBe('')
  })
})
