import { useReducedMotion } from 'motion/react'

/**
 * The single reduced-motion gate for all engine motion. Wraps motion's hook
 * so every primitive reads the preference from one place.
 */
export function useMdxReducedMotion(): boolean {
  return useReducedMotion() ?? false
}
