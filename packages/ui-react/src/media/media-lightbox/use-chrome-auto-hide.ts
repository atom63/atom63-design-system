'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

/** How long the chrome stays up after the last sign of activity. */
const CHROME_IDLE_MS = 2500

type ChromeHoldReason = 'drag' | 'focus' | 'hover'

export interface ChromeAutoHide {
  /** Whether the dock and floating controls should currently be shown. */
  visible: boolean
  /** Bump the idle clock — call on any activity that should surface the chrome. */
  reveal: () => void
  /** Pin the chrome up for as long as a pointer sits over the dock. */
  holdHover: () => void
  releaseHover: () => void
  /**
   * Pin the chrome up for as long as a drag started inside the dock is still
   * in progress (a thumbnail-strip scroll dragged by mouse or touch) — kept
   * separate from `holdHover`/`releaseHover` because a drag can carry the
   * pointer outside the dock's own bounds before it ends, and releasing the
   * hold on `pointerleave` in that case would let the idle timer resume
   * mid-gesture.
   */
  holdDrag: () => void
  releaseDrag: () => void
  /**
   * Pin the chrome up for as long as focus sits inside it. The caller
   * decides *which* focus events count — see `media-lightbox.tsx`'s
   * `isInternalFocusMove`, and this hook's own doc comment for why a plain
   * `focus`/`blur` pair isn't enough on its own.
   */
  holdFocus: () => void
  releaseFocus: () => void
}

/**
 * Drives the dock/floating-controls auto-hide: up the moment the lightbox
 * opens (so the chrome is discoverable), down after `CHROME_IDLE_MS` of no
 * activity, and pinned up for as long as focus, a hover, or a drag holds it.
 *
 * This is appearance/behaviour that belongs to the default preset, not
 * mechanism every consumer of the headless `Lightbox.*` parts has to accept —
 * a caller composing its own chrome is free to never call this hook at all.
 *
 * `MediaLightbox` itself does not unmount as `open` toggles (only the
 * portal's children do, and only once their exit animation finishes), so the
 * "visible on open" reset is keyed to the `open` prop transitioning, not to
 * this hook (re)mounting.
 *
 * **Why `holdFocus` takes no event, and why the caller gates it:**
 * `LightboxContent` moves DOM focus onto `Close` — the first focusable
 * control — the instant the lightbox opens, for *every* open, regardless of
 * how it was triggered. A first cut of this hook called `holdFocus` from a
 * plain `onFocus`, which meant that auto-focus held the chrome up forever:
 * nothing ever blurs `Close` for a mouse user who opens the lightbox and
 * then just looks, so the idle timer never got a chance to fire — the
 * single most common case got none of this feature's benefit.
 *
 * The obvious fix — gate the hold on `event.target.matches(':focus-visible')`,
 * which is how browsers distinguish "focus that warrants a visible
 * indicator" from a script-driven one — turned out not to hold up here:
 * jsdom's `:focus-visible` implementation reports `true` for exactly this
 * auto-focus-into-a-freshly-opened-dialog case (verified directly against a
 * rendered `Close` button), which is indistinguishable from a real keyboard
 * `Tab`. Chromium's own heuristic for this is subtler than "keyboard vs.
 * mouse" — it also has to keep a focus-trap's own scripted re-focusing from
 * breaking `:focus-visible` continuity for a keyboard user — and jsdom does
 * not appear to replicate that nuance, so it cannot be trusted to tell the
 * two apart here.
 *
 * What *is* reliable, in both jsdom and real browsers, is
 * `FocusEvent.relatedTarget`: it names the element that just lost focus, and
 * for the initial auto-focus that is always something *outside* the
 * lightbox (whatever had focus on the host page, or nothing at all) — never
 * another chrome control, because nothing inside the lightbox has ever held
 * focus yet. Subsequent `Tab` moves *within* the chrome (`Close` → `Previous`
 * → a dock button, etc.) always report a `relatedTarget` that is itself
 * inside the lightbox. So the caller holds only when that is true — see
 * `isInternalFocusMove` in `media-lightbox.tsx`. This also means a mouse
 * click that moves DOM focus directly between two dock buttons correctly
 * holds the chrome too, which is desirable: the user's pointer is right
 * there either way, and the hover hold would otherwise cover it anyway.
 */
export function useChromeAutoHide(open: boolean): ChromeAutoHide {
  const [visible, setVisible] = useState(true)
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const holdsRef = useRef<Set<ChromeHoldReason>>(new Set())

  const clearIdleTimer = useCallback(() => {
    if (idleTimerRef.current !== null) {
      clearTimeout(idleTimerRef.current)
      idleTimerRef.current = null
    }
  }, [])

  const scheduleHide = useCallback(() => {
    clearIdleTimer()
    idleTimerRef.current = setTimeout(() => {
      idleTimerRef.current = null
      if (holdsRef.current.size === 0) {
        setVisible(false)
      }
    }, CHROME_IDLE_MS)
  }, [clearIdleTimer])

  const reveal = useCallback(() => {
    setVisible(true)
    scheduleHide()
  }, [scheduleHide])

  const hold = useCallback(
    (reason: ChromeHoldReason) => {
      holdsRef.current.add(reason)
      clearIdleTimer()
      setVisible(true)
    },
    [clearIdleTimer]
  )

  const release = useCallback(
    (reason: ChromeHoldReason) => {
      holdsRef.current.delete(reason)
      if (holdsRef.current.size === 0) {
        scheduleHide()
      }
    },
    [scheduleHide]
  )

  useEffect(() => {
    if (!open) {
      clearIdleTimer()
      holdsRef.current.clear()
      return
    }
    setVisible(true)
    scheduleHide()
    return clearIdleTimer
  }, [open, clearIdleTimer, scheduleHide])

  // A drag that started inside the dock can carry the pointer past its
  // bounds before it lets go, so the release has to be caught globally
  // rather than on the dock's own `pointerleave`.
  useEffect(() => {
    if (!open) {
      return
    }
    const handlePointerEnd = () => {
      release('drag')
    }
    document.addEventListener('pointerup', handlePointerEnd)
    document.addEventListener('pointercancel', handlePointerEnd)
    return () => {
      document.removeEventListener('pointerup', handlePointerEnd)
      document.removeEventListener('pointercancel', handlePointerEnd)
    }
  }, [open, release])

  return {
    holdDrag: useCallback(() => {
      hold('drag')
    }, [hold]),
    holdFocus: useCallback(() => {
      hold('focus')
    }, [hold]),
    holdHover: useCallback(() => {
      hold('hover')
    }, [hold]),
    releaseDrag: useCallback(() => {
      release('drag')
    }, [release]),
    releaseFocus: useCallback(() => {
      release('focus')
    }, [release]),
    releaseHover: useCallback(() => {
      release('hover')
    }, [release]),
    reveal,
    visible,
  }
}
