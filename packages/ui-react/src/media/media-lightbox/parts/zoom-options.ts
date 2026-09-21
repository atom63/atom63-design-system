'use client'

import {
  createContext,
  createElement,
  useContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react'

/**
 * The tunable knobs for `useMediaZoom`, minus what the plumbing already
 * supplies (`enabled`, `index`, `reducedMotion`, `trackRef`, `zoomRef`).
 */
export interface LightboxZoomOptions {
  /** Fit to frame is 1; there is no point going below it. */
  minZoom?: number
  /** Omit to derive from naturalWidth, with 4 as a fallback. */
  maxZoom?: number
  /** Button and keyboard steps multiply rather than add, like every photos app. */
  zoomStep?: number
  doubleTapScale?: number
  keyboardPanDistance?: number
  wheelSensitivity?: number
  /** Plain wheel should not hijack page scroll unless a caller opts in. */
  scrollToZoom?: boolean
  onZoomChange?: (zoom: number) => void
}

/**
 * Internal wiring between `Content` and a descendant `Zoom` for the zoom
 * options channel.
 *
 * `Zoom` is a descendant of `Content` (inside `Slide`), so it cannot pass its
 * options as props to the single `useMediaZoom` call `Content` owns — it
 * registers them here instead. `Content` reads `null` to mean no `Zoom` has
 * registered, and passes no overrides to the hook, i.e. today's defaults.
 *
 * Do not re-export this module from the public parts barrel.
 */
const LightboxZoomOptionsRegistryContext = createContext<Dispatch<
  SetStateAction<LightboxZoomOptions | null>
> | null>(null)

export function LightboxZoomOptionsRegistryProvider({
  children,
  value,
}: {
  children: ReactNode
  value: Dispatch<SetStateAction<LightboxZoomOptions | null>>
}) {
  return createElement(LightboxZoomOptionsRegistryContext.Provider, { value }, children)
}

/**
 * Called by `Zoom` to publish (or, on unmount/deactivation, clear) its
 * options. Omitting `Zoom` entirely is legal — nothing ever calls this, and
 * `Content` simply keeps reading `null`. What is not legal is calling it
 * without a `Content` ancestor to receive it, which throws.
 */
export function useLightboxZoomOptionsRegistry(): Dispatch<
  SetStateAction<LightboxZoomOptions | null>
> {
  const register = useContext(LightboxZoomOptionsRegistryContext)
  if (register === null) {
    throw new Error('This lightbox part must be rendered inside Lightbox.Content.')
  }
  return register
}
