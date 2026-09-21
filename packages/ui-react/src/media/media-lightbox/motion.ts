import type { Transition } from 'motion/react'

/**
 * Every timing the lightbox animates on, in one place.
 *
 * The tile, the overlay, and the gesture hooks all read from here so the
 * opening morph, the closing morph, and the caller's own hover-freeze cannot
 * drift apart into three slightly different ideas of how long a close takes.
 */

/**
 * The open/close morph and the pull-to-dismiss settle.
 *
 * A spring rather than a fixed duration: a spring re-targets from wherever it
 * currently is, so closing a lightbox that is still opening reads as one object
 * changing its mind rather than two animations fighting. Damped just under
 * critical — enough life to feel physical, not enough to visibly overshoot a
 * photograph's edges.
 */
export const MEDIA_SPRING = {
  type: 'spring',
  stiffness: 520,
  damping: 44,
  mass: 1,
  restDelta: 0.0005,
} as const satisfies Transition

/** Returning the media to centre after a pull that did not travel far enough. */
export const PULL_SETTLE_SPRING = {
  type: 'spring',
  stiffness: 400,
  damping: 40,
  mass: 1,
  restDelta: 0.01,
} as const satisfies Transition

/** Discrete zoom steps: buttons, `+`/`-`, double-tap. Critically damped — a photo that bounces at the end of a zoom looks broken. */
export const ZOOM_STEP_SPRING = {
  type: 'spring',
  stiffness: 700,
  damping: 52,
  mass: 1,
  restDelta: 0.0005,
} as const satisfies Transition

/** No thumbnail to grow from, or it has scrolled away: cross-fade instead. */
export const MEDIA_FADE = { duration: 0.22, ease: [0.32, 0.72, 0, 1] } as const satisfies Transition

/**
 * Opacity stays on tweens.
 *
 * A spring's overshoot is invisible on a transform and obvious on an opacity —
 * it clips at 1 and the fade appears to stall. These also stage the exit:
 * chrome leaves first, the photo flies home, the backdrop lifts last, so the
 * close reads as a sequence instead of everything blinking out at once.
 */
export const BACKDROP_IN = {
  duration: 0.18,
  ease: [0.25, 0.46, 0.45, 0.94],
} as const satisfies Transition

export const BACKDROP_OUT = {
  delay: 0.14,
  duration: 0.12,
  ease: 'linear',
} as const satisfies Transition

export const CHROME_IN = {
  delay: 0.06,
  duration: 0.16,
  ease: 'easeOut',
} as const satisfies Transition

export const CHROME_OUT = { duration: 0.12, ease: 'easeIn' } as const satisfies Transition

/** How far the dock and the floating controls drop as they leave. */
export const CHROME_EXIT_OFFSET = 8
