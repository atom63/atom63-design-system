/**
 * Tells a trackpad's momentum tail apart from the part of a wheel gesture the
 * user is actually driving.
 *
 * macOS keeps emitting `wheel` events for up to about a second after the
 * fingers leave the trackpad, with deltas decaying smoothly toward zero. The
 * DOM exposes no phase for this, so a gesture that ends at the user's fingertips
 * looks, to a listener, exactly like one that is still going. Feeding that tail
 * into a pull-to-dismiss means the media keeps travelling after the hand has
 * stopped, and the decision about whether to dismiss waits for the coast to
 * finish — half a second after the user made up their mind.
 *
 * The tail has a shape the driven part does not: deltas that shrink, event after
 * event, arriving at frame rate. A real wheel gives evenly-sized notches spaced
 * far further apart, so it never trips this.
 */

/** Consecutive strictly-shrinking deltas before the tail is called. */
const MIN_DECAYING_SAMPLES = 3
/** Momentum arrives at frame rate; a wheel notch does not. */
const MAX_GAP_MS = 50
/** How far below the gesture's peak a delta must fall to count as decaying. */
const PEAK_RATIO = 0.85

/** A coast this quiet has ended. */
const MOMENTUM_QUIET_MS = 120
/** No trackpad coasts longer than this; a backstop, never the normal exit. */
const MOMENTUM_MAX_MS = 1200

export interface WheelMomentum {
  /** Feed each wheel delta. True once this event belongs to the tail. */
  push: (delta: number, time: number) => boolean
  reset: () => void
}

/**
 * Swallows what is left of a trackpad's coast after the gesture has been acted
 * on.
 *
 * A belt, never the mechanism. Both engines decide at gesture start whether a
 * wheel sequence can be cancelled, and then gate blocking dispatch on a hit
 * test against a committed region of non-passive handlers — so a listener added
 * once the overlay has gone only rejoins that region at the next commit, and
 * the events in between are scrolled on the compositor without ever reaching
 * it. `holdBodyScrollThroughMomentum` is what actually stops the page moving;
 * this only helps in the frames where it happens to be consulted.
 */
export function swallowWheelMomentum(): void {
  if (typeof window === 'undefined') {
    return
  }

  let quiet: ReturnType<typeof setTimeout> | null = null

  const stop = () => {
    if (quiet) {
      clearTimeout(quiet)
      quiet = null
    }
    clearTimeout(cap)
    window.removeEventListener('wheel', onWheel, { capture: true })
  }

  const onWheel = (event: WheelEvent) => {
    // Guarded because a wheel sequence that began uncancellable stays that way,
    // and calling it anyway is a no-op the console complains about.
    if (event.cancelable) {
      event.preventDefault()
    }
    if (quiet) {
      clearTimeout(quiet)
    }
    quiet = setTimeout(stop, MOMENTUM_QUIET_MS)
  }

  const cap = setTimeout(stop, MOMENTUM_MAX_MS)
  window.addEventListener('wheel', onWheel, { capture: true, passive: false })
  quiet = setTimeout(stop, MOMENTUM_QUIET_MS)
}

export function createWheelMomentum(): WheelMomentum {
  let peak = 0
  let previous = 0
  let previousTime = 0
  let decaying = 0
  let started = false

  const reset = () => {
    peak = 0
    previous = 0
    previousTime = 0
    decaying = 0
    started = false
  }

  return {
    push: (delta, time) => {
      const magnitude = Math.abs(delta)
      const gap = started ? time - previousTime : 0
      const rapid = started && gap >= 0 && gap <= MAX_GAP_MS

      // A pause breaks the tail: whatever follows is the user again.
      if (started && !rapid) {
        peak = magnitude
        decaying = 0
      } else if (magnitude < previous && magnitude < peak * PEAK_RATIO) {
        decaying += 1
      } else {
        decaying = 0
      }

      peak = Math.max(peak, magnitude)
      previous = magnitude
      previousTime = time
      started = true

      return decaying >= MIN_DECAYING_SAMPLES
    },
    reset,
  }
}
