/**
 * Motion tokens for the `motion` library (seconds). Mirrors the CSS custom
 * properties in `@atom63/styles/tokens/motion` — keep the two in sync.
 */
export const motionDurations = {
  fast: 0.15,
  base: 0.3,
  slow: 0.6,
} as const

export const motionEasings = {
  standard: [0.2, 0, 0, 1],
  emphasized: [0.3, 0, 0, 1],
} as const

export type MotionSpeed = keyof typeof motionDurations
