import { useCallback, useMemo, useState } from 'react'
import type { MediaLightboxTransition } from './types'
import {
  preferCheapMediaTransition,
  runMediaViewTransition,
  supportsViewTransitions,
} from './view-transition'

export interface UseMediaLightboxOptions {
  /**
   * How open/close morphs. Defaults to `flip` (animate only the photo).
   * `view-transition` snapshots the document — richer crop morph, hitchy on a
   * dense page such as the homepage.
   */
  morph?: MediaLightboxTransition
}

export interface UseMediaLightboxResult {
  index: number
  isOpen: boolean
  /** The element the morph grows out of. */
  origin: HTMLElement | null
  /** Which engine drove the last open/close — pass it straight to `MediaLightbox`. */
  transition: MediaLightboxTransition
  openAt: (index: number, origin?: HTMLElement | null) => void
  /**
   * Pass the thumbnail for the item currently on screen. After a swipe that is
   * no longer the one the lightbox opened from, and morphing back to the wrong
   * tile is worse than not morphing at all.
   */
  close: (origin?: HTMLElement | null) => void
  setIndex: (index: number) => void
}

function clamp(value: number, itemCount: number): number {
  if (itemCount <= 0) {
    return 0
  }
  return Math.min(Math.max(value, 0), itemCount - 1)
}

/**
 * Open/close/index state for `MediaLightbox`, plus the element the morph runs
 * against and the engine that drives it.
 *
 * The engine choice lives here rather than in the component because a view
 * transition has to *wrap* the state change that mounts the lightbox — by the
 * time the component renders, the browser has already missed its snapshot.
 */
export function useMediaLightbox(
  itemCount: number,
  options?: UseMediaLightboxOptions
): UseMediaLightboxResult {
  const morph = options?.morph ?? 'flip'
  const [isOpen, setIsOpen] = useState(false)
  const [index, setIndexState] = useState(0)
  // State, not a ref: `origin` is read during render, and reading a ref there is
  // not a valid render input — the React Compiler is free to cache the first
  // value it saw, which is always `null`.
  const [origin, setOrigin] = useState<HTMLElement | null>(null)
  const [transition, setTransition] = useState<MediaLightboxTransition>('flip')

  const setIndex = useCallback(
    (next: number) => {
      setIndexState(clamp(next, itemCount))
    },
    [itemCount]
  )

  const openAt = useCallback(
    (next: number, nextOrigin?: HTMLElement | null) => {
      const target = nextOrigin ?? null
      const open = () => {
        setOrigin(target)
        setIndexState(clamp(next, itemCount))
        setIsOpen(true)
      }

      const useViewTransition =
        morph === 'view-transition' && supportsViewTransitions() && !preferCheapMediaTransition()

      if (!useViewTransition) {
        setTransition('flip')
        open()
        return
      }

      setTransition('view-transition')
      const ran = runMediaViewTransition({ direction: 'in', origin: target, update: open })
      if (!ran) {
        setTransition('flip')
        open()
      }
    },
    [itemCount, morph]
  )

  const close = useCallback(
    (nextOrigin?: HTMLElement | null) => {
      const target = nextOrigin === undefined ? origin : nextOrigin
      const shut = () => {
        setOrigin(target)
        setIsOpen(false)
      }

      if (transition !== 'view-transition') {
        shut()
        return
      }

      const ran = runMediaViewTransition({ direction: 'out', origin: target, update: shut })
      if (!ran) {
        shut()
      }
    },
    [origin, transition]
  )

  return useMemo(
    () => ({ close, index, isOpen, openAt, origin, setIndex, transition }),
    [close, index, isOpen, openAt, origin, setIndex, transition]
  )
}
