import { type RefObject, useCallback, useRef, useState } from 'react'

export interface UseCardCursorOptions {
  /**
   * Called on every pointer move with the position relative to the card (px).
   * Provide this to WIRE YOUR OWN MOTION lib (e.g. drive a spring, then set
   * `--a63-card-cursor-x/y` yourself). When omitted, the hook writes those
   * custom props directly for an instant, motion-free follow.
   */
  onMove?: (position: { x: number; y: number }) => void
}

export interface CardCursorBinding {
  /** Attach to the `Card` so positions are measured/written against it. */
  ref: RefObject<HTMLDivElement | null>
  /** True while the pointer is over the card — spread as `data-cursor-active`. */
  active: boolean
  onPointerEnter: (event: React.PointerEvent<HTMLElement>) => void
  onPointerMove: (event: React.PointerEvent<HTMLElement>) => void
  onPointerLeave: () => void
}

/**
 * Headless pointer-tracking for the Card cursor label — the DS's motion-free
 * take on base-card's `cursorLabel`. Tracks the pointer relative to the card and
 * exposes it WITHOUT re-rendering on move (position is written to CSS custom
 * props via the ref; only `active` — which toggles on enter/leave — is state).
 *
 * Motion-free by default (instant follow). Pass `onMove` to wire a motion lib:
 * the hook then leaves the custom props to you (apply spring smoothing and set
 * `--a63-card-cursor-x/y` on the card element in your motion callback).
 *
 * @example
 * const cursor = useCardCursor()
 * <Card ref={cursor.ref} data-cursor-active={cursor.active || undefined}
 *   onPointerEnter={cursor.onPointerEnter} onPointerMove={cursor.onPointerMove}
 *   onPointerLeave={cursor.onPointerLeave}>
 *   ...
 *   {cursor.active && <CardCursorLabel>Open link ↗</CardCursorLabel>}
 * </Card>
 */
export function useCardCursor(options: UseCardCursorOptions = {}): CardCursorBinding {
  const { onMove } = options
  const ref = useRef<HTMLDivElement | null>(null)
  const rectRef = useRef<DOMRect | null>(null)
  const [active, setActive] = useState(false)

  const apply = useCallback(
    (clientX: number, clientY: number) => {
      const rect = rectRef.current
      if (!rect) {
        return
      }
      const x = clientX - rect.left
      const y = clientY - rect.top
      if (onMove) {
        onMove({ x, y })
        return
      }
      const el = ref.current
      if (el) {
        el.style.setProperty('--a63-card-cursor-x', `${x}px`)
        el.style.setProperty('--a63-card-cursor-y', `${y}px`)
      }
    },
    [onMove]
  )

  const onPointerEnter = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      if (!ref.current) {
        return
      }
      rectRef.current = ref.current.getBoundingClientRect()
      apply(event.clientX, event.clientY)
      setActive(true)
    },
    [apply]
  )

  const onPointerMove = useCallback(
    (event: React.PointerEvent<HTMLElement>) => apply(event.clientX, event.clientY),
    [apply]
  )

  const onPointerLeave = useCallback(() => {
    rectRef.current = null
    setActive(false)
  }, [])

  return { ref, active, onPointerEnter, onPointerMove, onPointerLeave }
}
