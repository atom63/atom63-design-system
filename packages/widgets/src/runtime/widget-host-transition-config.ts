/** Shell + content size transition duration (seconds) for widget resize + crossfade. */
export const WIDGET_HOST_SIZE_TRANSITION_DURATION = 0.32

export const WIDGET_HOST_SIZE_TRANSITION_EASE = [0.5, 0, 0, 1] as const

/** Blur amount for hosted content/title crossfades — masks reflow during shell resize. */
export const WIDGET_HOST_CROSSFADE_BLUR = '6px'

/** Shared motion transition for desktop shell resize and inner content crossfade. */
export const widgetHostSizeMotionTransition = {
  duration: WIDGET_HOST_SIZE_TRANSITION_DURATION,
  ease: WIDGET_HOST_SIZE_TRANSITION_EASE,
} as const

type WidgetHostMotionPhase = 'active' | 'enter' | 'exit'

/** Motion returns null when no reduced-motion preference is set — treat that as animated. */
export function shouldReduceWidgetHostMotion(reduceMotion: boolean | null): boolean {
  return reduceMotion === true
}

/**
 * Opacity + blur crossfade for inner widget content and title chrome.
 * Blur is applied on clipped inner layers only — not the widget card shell —
 * so themed backdrop-filter on the shell stays intact.
 *
 * The resting state is `none`, not `blur(0px)`. Any filter value other than
 * `none` establishes a backdrop root, which neutralises `backdrop-filter` on
 * everything below it — so a resting `blur(0px)` silently disables the blur
 * ramp inside widgets that put text over photography. `none` costs nothing at
 * rest and the animated phases still carry the blur.
 */
export function getWidgetHostCrossfadeMotion(
  phase: WidgetHostMotionPhase,
  reduceMotion: boolean | null
) {
  if (shouldReduceWidgetHostMotion(reduceMotion)) {
    return { filter: 'none', opacity: 1 }
  }

  if (phase === 'active') {
    return { filter: 'none', opacity: 1 }
  }

  return { filter: `blur(${WIDGET_HOST_CROSSFADE_BLUR})`, opacity: 0 }
}

/**
 * Opacity-only swap for copy inside a locked height box (film title/year).
 * No blur (glyph bounds) and no translate — even a small `y` shifts the
 * visual mass of the line and reads as the text plate changing height.
 */
export function getWidgetHostSlideFadeMotion(
  phase: WidgetHostMotionPhase,
  reduceMotion: boolean | null
) {
  if (shouldReduceWidgetHostMotion(reduceMotion) || phase === 'active') {
    return { opacity: 1 }
  }

  return { opacity: 0 }
}
