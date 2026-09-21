export const ATOM63_MOTION_EASE = [0.16, 1, 0.3, 1] as const
export const ATOM63_MOTION_EASE_CSS = 'cubic-bezier(0.16, 1, 0.3, 1)'
export const ATOM63_OVERLAY_MOTION_EASE = [0.22, 1, 0.36, 1] as const
export const ATOM63_OVERLAY_MOTION_DURATION_MS = 450
export const ATOM63_OVERLAY_MOTION_DURATION_CSS = 'var(--a63-motion-duration-overlay)'
export const ATOM63_OVERLAY_MOTION_EASE_CSS = 'var(--a63-motion-ease-overlay)'

export const ATOM63_FLYOUT_TRANSITION = {
  duration: ATOM63_OVERLAY_MOTION_DURATION_MS / 1000,
  ease: ATOM63_OVERLAY_MOTION_EASE,
} as const

export const ATOM63_FLYOUT_TRANSITION_CSS = {
  duration: ATOM63_OVERLAY_MOTION_DURATION_CSS,
  durationMs: ATOM63_OVERLAY_MOTION_DURATION_MS,
  easing: ATOM63_OVERLAY_MOTION_EASE_CSS,
} as const
