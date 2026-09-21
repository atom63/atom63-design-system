import { describe, expect, it } from 'vitest'
import { measureOriginMorph, paintOriginMorph } from './origin-morph'

function rect(left: number, top: number, width: number, height: number): DOMRect {
  return {
    bottom: top + height,
    height,
    left,
    right: left + width,
    top,
    width,
    x: left,
    y: top,
    toJSON: () => ({}),
  } as DOMRect
}

function elementAt(box: DOMRect, radius: string): HTMLElement {
  const element = document.createElement('div')
  element.style.borderTopLeftRadius = radius
  element.getBoundingClientRect = () => box
  document.body.append(element)
  return element
}

/** The wallpaper case: a 16:9 photo shown through a 3:2 `cover` tile. */
const MEDIA_BOX = rect(0, 0, 1600, 900)
const ORIGIN_BOX = rect(400, 100, 300, 200)

function parse(value: string): number[] {
  // `translate3d` carries a `3` that is not a coordinate, and a near-zero inset
  // serialises in exponent notation.
  return [...value.replace('translate3d', 'translate').matchAll(/-?\d*\.?\d+(?:e[-+]?\d+)?/gi)].map(
    match => Number(match[0])
  )
}

describe('measureOriginMorph', () => {
  it('scales to cover the thumbnail, not to match its width', () => {
    const media = elementAt(MEDIA_BOX, '16px')
    const origin = elementAt(ORIGIN_BOX, '8px')

    const morph = measureOriginMorph(media, MEDIA_BOX, origin)

    // Width alone would give 300/1600 = 0.1875, which leaves the photo shorter
    // than the tile and shows a smaller, uncropped image on the opening frame.
    expect(morph?.scale).toBeCloseTo(200 / 900, 6)
  })

  it('translates media centre onto thumbnail centre', () => {
    const media = elementAt(MEDIA_BOX, '16px')
    const origin = elementAt(ORIGIN_BOX, '8px')

    const morph = measureOriginMorph(media, MEDIA_BOX, origin)

    expect(morph?.dx).toBeCloseTo(550 - 800, 6)
    expect(morph?.dy).toBeCloseTo(200 - 450, 6)
  })

  it('declines when the thumbnail has scrolled off screen', () => {
    const media = elementAt(MEDIA_BOX, '16px')
    const origin = elementAt(rect(400, window.innerHeight + 50, 300, 200), '8px')

    expect(measureOriginMorph(media, MEDIA_BOX, origin)).toBeNull()
  })

  it('declines without a thumbnail, or before the media has a box', () => {
    const media = elementAt(MEDIA_BOX, '16px')
    const origin = elementAt(ORIGIN_BOX, '8px')

    expect(measureOriginMorph(media, MEDIA_BOX, null)).toBeNull()
    expect(measureOriginMorph(media, rect(0, 0, 0, 0), origin)).toBeNull()
  })
})

describe('paintOriginMorph', () => {
  it('shows exactly the thumbnail rect at progress 0', () => {
    const media = elementAt(MEDIA_BOX, '16px')
    const origin = elementAt(ORIGIN_BOX, '8px')
    const morph = measureOriginMorph(media, MEDIA_BOX, origin)
    if (!morph) {
      throw new Error('expected a morph')
    }

    paintOriginMorph(media, morph, 0)

    const [x, y, , scale] = parse(media.style.transform)
    const [insetY, insetX, radius] = parse(media.style.clipPath)
    if (
      x === undefined ||
      y === undefined ||
      scale === undefined ||
      insetX === undefined ||
      insetY === undefined ||
      radius === undefined
    ) {
      throw new Error('expected a painted transform and clip')
    }

    // The clip is in the media's own pixels, so its on-screen size is the
    // clipped width times the scale being applied.
    expect((MEDIA_BOX.width - insetX * 2) * scale).toBeCloseTo(ORIGIN_BOX.width, 4)
    expect((MEDIA_BOX.height - insetY * 2) * scale).toBeCloseTo(ORIGIN_BOX.height, 4)
    // And the corner reads as the tile's radius once the scale is applied.
    expect(radius * scale).toBeCloseTo(8, 4)
    expect(x).toBeCloseTo(-250, 4)
    expect(y).toBeCloseTo(-250, 4)
  })

  it('hands the media its own geometry back at progress 1', () => {
    const media = elementAt(MEDIA_BOX, '16px')
    const origin = elementAt(ORIGIN_BOX, '8px')
    const morph = measureOriginMorph(media, MEDIA_BOX, origin)
    if (!morph) {
      throw new Error('expected a morph')
    }

    paintOriginMorph(media, morph, 1)

    expect(parse(media.style.transform)).toEqual([0, 0, 0, 1])
    expect(parse(media.style.clipPath)).toEqual([0, 0, 16])
  })

  it('never emits a negative inset when a spring overshoots', () => {
    const media = elementAt(MEDIA_BOX, '16px')
    const origin = elementAt(ORIGIN_BOX, '8px')
    const morph = measureOriginMorph(media, MEDIA_BOX, origin)
    if (!morph) {
      throw new Error('expected a morph')
    }

    paintOriginMorph(media, morph, 1.05)

    const [insetY, insetX] = parse(media.style.clipPath)
    expect(insetX).toBeGreaterThanOrEqual(0)
    expect(insetY).toBeGreaterThanOrEqual(0)
  })
})
