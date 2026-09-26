/**
 * The arithmetic of the paging track, kept apart from the DOM so every rule
 * can be tested on plain numbers.
 *
 * Positions are in slide units: `0` is the first slide at rest, `1` the second,
 * and `1.25` a quarter of the way from the second to the third. One unit is
 * one slide plus the gap after it, so a position maps to a transform without
 * knowing the viewport width, and a spring animating it stays correct across a
 * resize. Positions run in reading order: a higher position is always "onward",
 * in right-to-left galleries too; only the transform flips the sign.
 */

/**
 * How far the pointer must travel before an axis is picked at all.
 *
 * Below this a press is still deciding whether it is a swipe, a pull, or a
 * shaky tap. Matches `usePullToDismiss`'s own dead zone, so the vertical and
 * horizontal gestures split the same circle between them.
 */
export const AXIS_LOCK_THRESHOLD = 8

/**
 * Proportion of the viewport width a slow drag must cross to turn the page,
 * capped so a wide desktop window does not ask for an unreasonably long drag.
 */
export const SWIPE_DISTANCE_RATIO = 0.2
/** The ratio's ceiling; see `SWIPE_DISTANCE_RATIO`. */
export const SWIPE_DISTANCE_CAP = 120
/**
 * A release faster than this (px/ms) pages in the direction the pointer was
 * moving, however short the drag. Also decides a flick that reversed: the
 * direction of the last movement wins, not the direction of the whole drag.
 */
export const SWIPE_VELOCITY = 0.5

/**
 * How hard the edges resist. UIKit's constant: the first pixels past the end
 * move almost 1:1 and the band stiffens smoothly, so the edge is felt rather
 * than hit.
 */
const RUBBER_BAND_COEFFICIENT = 0.55

export function swipeDistanceThreshold(viewportWidth: number): number {
  return Math.min(SWIPE_DISTANCE_CAP, (viewportWidth || SWIPE_DISTANCE_CAP) * SWIPE_DISTANCE_RATIO)
}

/** How far a pull of `overshoot` pixels past an edge actually moves, in pixels. */
export function rubberBand(overshoot: number, dimension: number): number {
  if (overshoot <= 0 || dimension <= 0) {
    return 0
  }
  return (1 - 1 / ((overshoot * RUBBER_BAND_COEFFICIENT) / dimension + 1)) * dimension
}

/**
 * Applies edge resistance to a raw position: inside `[0, lastIndex]` the
 * track follows the pointer exactly, and past either end it stretches.
 */
export function resistEdges(position: number, lastIndex: number, step: number): number {
  if (position < 0) {
    return -rubberBand(-position * step, step) / step
  }
  if (position > lastIndex) {
    return lastIndex + rubberBand((position - lastIndex) * step, step) / step
  }
  return position
}

export interface ReleaseInput {
  /** Where the track is drawn as the pointer lets go. */
  position: number
  /** Where it was drawn when the gesture began (mid-settle if it was caught). */
  startPosition: number
  /** The index the gallery currently reports. */
  index: number
  lastIndex: number
  /** Trailing speed in px/ms, positive toward higher indices. */
  velocity: number
  /** Pixels in one slide unit. */
  step: number
  /** Pixels a slow drag must cover to page; see `swipeDistanceThreshold`. */
  distanceThreshold: number
}

/**
 * The slide a released gesture settles on.
 *
 * A fast release pages the way the pointer was last moving: `ceil` going
 * onward and `floor` going back. That rule also catches a flick that reversed
 * mid-way. A drag that went a third of a page onward and then flicked back
 * floors to where it started instead of paging on.
 *
 * A slow release pages once the drag has covered the distance threshold, and
 * otherwise returns to the nearest slide. The nearest slide is the one it
 * started on for an ordinary drag, and the one a caught settle was heading to
 * when a tap interrupted it past the halfway point.
 *
 * Never more than one slide from `index`, and never past either end.
 */
export function releaseTarget({
  distanceThreshold,
  index,
  lastIndex,
  position,
  startPosition,
  step,
  velocity,
}: ReleaseInput): number {
  let target: number
  if (Math.abs(velocity) > SWIPE_VELOCITY) {
    target = velocity > 0 ? Math.ceil(position) : Math.floor(position)
  } else {
    const moved = (position - startPosition) * step
    if (Math.abs(moved) > distanceThreshold) {
      target = moved > 0 ? Math.ceil(position) : Math.floor(position)
    } else {
      target = Math.round(position)
    }
  }
  const nearest = Math.min(Math.max(target, index - 1), index + 1)
  return Math.min(Math.max(nearest, 0), Math.max(lastIndex, 0))
}

/**
 * The track's transform for a position.
 *
 * Written in CSS units rather than pixels so the resting position the first
 * render commits needs no measurement: the open morph measures the active
 * frame in the same commit, before any effect could have positioned the track.
 * `100%` is the strip's own width, which is the width of one slide.
 */
export function trackTransform(position: number): string {
  // Five decimals is a hundredth of a pixel on a 1000px slide, and it keeps
  // the resting string identical to the one a settle writes on its last frame.
  const offset = Number((-position).toFixed(5)) || 0
  return `translate3d(calc(${offset} * (100% + var(--a63-media-lightbox-gap, var(--a63-space-4))) * var(--a63-media-lightbox-track-sign, 1)), 0, 0)`
}
