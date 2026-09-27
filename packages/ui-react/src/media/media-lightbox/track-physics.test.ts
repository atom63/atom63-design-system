import { describe, expect, it } from 'vitest'
import {
  releaseTarget,
  resistEdges,
  rubberBand,
  swipeDistanceThreshold,
  trackTransform,
  type ReleaseInput,
} from './track-physics'

const STEP = 1000

function release(overrides: Partial<ReleaseInput>): number {
  return releaseTarget({
    distanceThreshold: swipeDistanceThreshold(1280),
    index: 2,
    lastIndex: 6,
    position: 2,
    startPosition: 2,
    step: STEP,
    velocity: 0,
    ...overrides,
  })
}

describe('swipeDistanceThreshold', () => {
  it('is a fifth of a phone screen and caps at 120px on a wide one', () => {
    expect(swipeDistanceThreshold(375)).toBe(75)
    expect(swipeDistanceThreshold(1920)).toBe(120)
  })
})

describe('releaseTarget', () => {
  it('pages once a slow drag covers the distance threshold', () => {
    // 150px onward at a crawl: past the 120px threshold.
    expect(release({ position: 2.15, velocity: 0.1 })).toBe(3)
    expect(release({ position: 1.85, velocity: -0.1 })).toBe(1)
  })

  it('springs back to the slide it started on below the threshold', () => {
    expect(release({ position: 2.1, velocity: 0.1 })).toBe(2)
    expect(release({ position: 1.9, velocity: -0.1 })).toBe(2)
  })

  it('pages on a fast flick however short the drag', () => {
    // 40px, well under the threshold, but leaving the hand at 1.5px/ms.
    expect(release({ position: 2.04, velocity: 1.5 })).toBe(3)
    expect(release({ position: 1.96, velocity: -1.5 })).toBe(1)
  })

  it('catches a flick that reversed: the last movement wins, not the whole drag', () => {
    // Dragged 300px onward, then flicked back before letting go.
    expect(release({ position: 2.3, velocity: -1.2 })).toBe(2)
    expect(release({ position: 1.7, velocity: 1.2 })).toBe(2)
  })

  it('settles a caught strip on the nearest slide when the press did not move it', () => {
    // A tap stopped a settle from 2 to 3 past the halfway point.
    expect(release({ index: 3, position: 2.6, startPosition: 2.6 })).toBe(3)
    expect(release({ index: 3, position: 2.4, startPosition: 2.4 })).toBe(2)
  })

  it('never turns more than one slide from the current index', () => {
    expect(release({ position: 3.6, velocity: 3 })).toBe(3)
    expect(release({ position: 0.4, velocity: -3 })).toBe(1)
  })

  it('never lands past either end', () => {
    expect(release({ index: 0, position: -0.2, velocity: -2 })).toBe(0)
    expect(release({ index: 6, position: 6.2, velocity: 2 })).toBe(6)
  })
})

describe('edge resistance', () => {
  it('follows the pointer exactly between the first and last slide', () => {
    expect(resistEdges(0, 6, STEP)).toBe(0)
    expect(resistEdges(3.37, 6, STEP)).toBe(3.37)
    expect(resistEdges(6, 6, STEP)).toBe(6)
  })

  it('stretches less and less the further it is pulled past an edge', () => {
    const quarter = -resistEdges(-0.25, 6, STEP)
    const half = -resistEdges(-0.5, 6, STEP)
    expect(quarter).toBeGreaterThan(0)
    expect(quarter).toBeLessThan(0.25)
    expect(half).toBeLessThan(0.5)
    // Diminishing: the second quarter moves the strip less than the first.
    expect(half - quarter).toBeLessThan(quarter)
    expect(resistEdges(6.25, 6, STEP) - 6).toBeCloseTo(quarter, 10)
  })

  it('never lets a pull reach a whole slide', () => {
    expect(rubberBand(100_000, STEP)).toBeLessThan(STEP)
  })
})

describe('trackTransform', () => {
  it('moves one slide plus the gap per unit, mirrored by the direction sign', () => {
    expect(trackTransform(2)).toBe(
      'translate3d(calc(-2 * (100% + var(--a63-media-lightbox-gap, var(--a63-space-4))) * var(--a63-media-lightbox-track-sign, 1)), 0, 0)'
    )
  })

  it('writes the resting position the same way a settle ends on it', () => {
    expect(trackTransform(0)).toBe(trackTransform(-0))
    expect(trackTransform(3.0000001)).toBe(trackTransform(3))
  })
})
