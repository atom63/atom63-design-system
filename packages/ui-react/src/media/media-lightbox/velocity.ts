/**
 * Trailing-window velocity for a one-dimensional gesture.
 *
 * Dividing total travel by total elapsed time answers the wrong question: a
 * slow drag that ends in a flick reports the slow average and refuses to throw,
 * and a fast nudge that then rests reports the fast average and throws when the
 * finger had already stopped. What decides a flick is how fast the pointer was
 * moving *as it left*, so only the last few samples count.
 */

/** Long enough to survive a dropped frame, short enough to still mean "now". */
const DEFAULT_WINDOW_MS = 100
/**
 * Below one frame there is no evidence, only noise: two samples a fraction of a
 * millisecond apart divide a real distance by almost nothing and report a speed
 * no hand produced. Coalesced events and synthetic ones both land here.
 */
const MIN_SPAN_MS = 8

interface Sample {
  time: number
  value: number
}

export interface VelocityTracker {
  /** Starts a new gesture. */
  reset: (value: number, time: number) => void
  push: (value: number, time: number) => void
  /** Units per millisecond over the trailing window. */
  velocity: () => number
}

export function createVelocityTracker(windowMs: number = DEFAULT_WINDOW_MS): VelocityTracker {
  let samples: Sample[] = []

  const push = (value: number, time: number) => {
    samples.push({ time, value })
    // Bounded, but generously: `velocity` picks its own span out of these, and
    // trimming to exactly the window would leave a single sample after a gap.
    const cutoff = time - windowMs * 2
    const keepFrom = samples.findIndex(sample => sample.time >= cutoff)
    if (keepFrom > 1) {
      samples = samples.slice(keepFrom - 1)
    }
  }

  return {
    push,
    reset: (value, time) => {
      samples = [{ time, value }]
    },
    velocity: () => {
      const last = samples.at(-1)
      if (!last) {
        return 0
      }
      // The oldest sample still inside the window, so a gesture that ended fast
      // reports fast even if it spent a second crawling first.
      const first =
        samples.find(sample => last.time - sample.time <= windowMs) ?? samples.at(-2) ?? last
      const span = first === last ? (samples.at(-2) ?? last) : first
      const elapsed = last.time - span.time
      if (elapsed < MIN_SPAN_MS) {
        return 0
      }
      return (last.value - span.value) / elapsed
    },
  }
}
