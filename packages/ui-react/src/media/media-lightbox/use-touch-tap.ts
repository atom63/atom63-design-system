'use client'

import { type RefObject, useEffect, useRef } from 'react'
import { AXIS_LOCK_THRESHOLD } from './track-physics'

/**
 * How long a single tap waits for a second one before it counts as single.
 *
 * Android's `DOUBLE_TAP_TIMEOUT`, measured the same way: from the first finger
 * lifting to the second one landing. A second tap inside it is a double-tap,
 * which zoom answers through the `dblclick` the browser synthesises (see
 * `useMediaZoom`), so the tap that started it must not also toggle anything.
 */
export const DOUBLE_TAP_MS = 300
/** How far apart the two taps of a double-tap may land. */
const DOUBLE_TAP_SLOP = 40
/** A press held longer than this is a long-press, not a tap. */
const TAP_MAX_MS = 500

/** Controls that answer a tap themselves. */
const NO_TAP_SELECTOR =
  'a, button:not([tabindex="-1"]), [role="tab"], input, select, textarea, video, [data-a63-no-drag]'

export function isTouchPointer(event: { pointerType?: string }): boolean {
  return event.pointerType === 'touch' || event.pointerType === 'pen'
}

interface TouchTapOptions {
  /** Where taps count: the whole lightbox, minus its own controls. */
  rootRef: RefObject<HTMLElement | null>
  /** A single tap that no second tap followed. */
  onTap: () => void
  /**
   * Told on every press whether it came from a finger or a pen. A `click`
   * does not reliably say which input produced it, so a handler that must
   * tell a tap from a mouse click (`SlideCloseArea` closes on one, not the
   * other) keeps this instead.
   */
  onPress: (touch: boolean) => void
}

/**
 * Recognises single taps from a finger or a pen, and holds each one back for
 * `DOUBLE_TAP_MS` so it can still turn out to be the first half of a
 * double-tap.
 *
 * A tap is a press that neither moved past the axis-lock dead zone the page
 * drag and the pull both use, nor was held long, nor grew a second finger.
 * Anything that moved belongs to those gestures, and anything they claimed is
 * not a tap. A `dblclick` also cancels a pending tap, as a second line behind
 * the second-press check.
 */
export function useTouchTap({ onPress, onTap, rootRef }: TouchTapOptions): void {
  const onTapRef = useRef(onTap)
  onTapRef.current = onTap
  const onPressRef = useRef(onPress)
  onPressRef.current = onPress

  useEffect(() => {
    const root = rootRef.current
    if (!root) {
      return
    }

    let press: {
      id: number
      x: number
      y: number
      time: number
      moved: boolean
      second: boolean
    } | null = null
    let multiTouch = false
    let pending: ReturnType<typeof setTimeout> | null = null
    let lastTap = { time: Number.NEGATIVE_INFINITY, x: 0, y: 0 }

    const cancelPending = () => {
      if (pending) {
        clearTimeout(pending)
        pending = null
      }
    }

    const handlePointerDown = (event: PointerEvent) => {
      const touch = isTouchPointer(event)
      onPressRef.current(touch)
      if (!touch) {
        press = null
        return
      }
      if (press !== null) {
        // A second finger: a pinch, not a tap.
        multiTouch = true
        cancelPending()
        return
      }
      if ((event.target as HTMLElement | null)?.closest(NO_TAP_SELECTOR)) {
        return
      }
      const second =
        pending !== null &&
        event.timeStamp - lastTap.time <= DOUBLE_TAP_MS &&
        Math.hypot(event.clientX - lastTap.x, event.clientY - lastTap.y) <= DOUBLE_TAP_SLOP
      if (second) {
        cancelPending()
      }
      multiTouch = false
      press = {
        id: event.pointerId,
        moved: false,
        second,
        time: event.timeStamp,
        x: event.clientX,
        y: event.clientY,
      }
    }

    const handlePointerMove = (event: PointerEvent) => {
      if (!press || event.pointerId !== press.id || press.moved) {
        return
      }
      if (
        Math.abs(event.clientX - press.x) >= AXIS_LOCK_THRESHOLD ||
        Math.abs(event.clientY - press.y) >= AXIS_LOCK_THRESHOLD
      ) {
        press.moved = true
      }
    }

    const handlePointerUp = (event: PointerEvent) => {
      if (!press || event.pointerId !== press.id) {
        return
      }
      const ended = press
      press = null
      if (ended.moved || ended.second || multiTouch || event.timeStamp - ended.time > TAP_MAX_MS) {
        return
      }
      lastTap = { time: event.timeStamp, x: event.clientX, y: event.clientY }
      cancelPending()
      pending = setTimeout(() => {
        pending = null
        onTapRef.current()
      }, DOUBLE_TAP_MS)
    }

    const handlePointerCancel = (event: PointerEvent) => {
      if (press && event.pointerId === press.id) {
        press = null
      }
    }

    // Capture, so a control that stops propagation cannot hide the press from
    // `onPress`.
    root.addEventListener('pointerdown', handlePointerDown, true)
    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    window.addEventListener('pointerup', handlePointerUp, { passive: true })
    window.addEventListener('pointercancel', handlePointerCancel, { passive: true })
    root.addEventListener('dblclick', cancelPending, true)

    return () => {
      cancelPending()
      root.removeEventListener('pointerdown', handlePointerDown, true)
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
      window.removeEventListener('pointercancel', handlePointerCancel)
      root.removeEventListener('dblclick', cancelPending, true)
    }
  }, [rootRef])
}
