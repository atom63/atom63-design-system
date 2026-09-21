'use client'

import { Plus } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { type PointerEvent as ReactPointerEvent, useCallback, useRef, useState } from 'react'
import { useReducedMotion } from '../hooks/use-reduced-motion'

/** Half the overlay pill, so the plus never paints over excluded chrome. */
const KEEP_OUT_PX = 20

type ExcludeRef = { readonly current: HTMLElement | null }

const NO_EXCLUDE_REFS: ReadonlyArray<ExcludeRef> = []

function isInsideKeepOut(
  clientX: number,
  clientY: number,
  excludeRefs: ReadonlyArray<ExcludeRef>
): boolean {
  for (const ref of excludeRefs) {
    const element = ref.current
    if (!element) {
      continue
    }
    const rect = element.getBoundingClientRect()
    if (
      clientX >= rect.left - KEEP_OUT_PX &&
      clientX <= rect.right + KEEP_OUT_PX &&
      clientY >= rect.top - KEEP_OUT_PX &&
      clientY <= rect.bottom + KEEP_OUT_PX
    ) {
      return true
    }
  }
  return false
}

/**
 * Carousel-style pointer cursor for the enlarge target: a plus pill tracks the
 * mouse, the system cursor hides, and touch is ignored so a swipe still looks
 * like a swipe. Pass `excludeRefs` for tile chrome the plus must not cover.
 */
export function useMediaLightboxZoomCursor({
  excludeRefs = NO_EXCLUDE_REFS,
}: {
  excludeRefs?: ReadonlyArray<ExcludeRef>
} = {}): {
  active: boolean
  overlay: { x: number; y: number }
  targetProps: {
    'data-zoom-cursor-active'?: ''
    onPointerDown: () => void
    onPointerLeave: () => void
    onPointerMove: (event: ReactPointerEvent<HTMLElement>) => void
  }
} {
  const [active, setActive] = useState(false)
  const [overlay, setOverlay] = useState({ x: 0, y: 0 })
  const excludeRefsRef = useRef(excludeRefs)
  excludeRefsRef.current = excludeRefs
  // Pressing to open must not keep the plus in the morph — pointermove would
  // otherwise revive it before click.
  const suppressedRef = useRef(false)

  const onPointerMove = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    if (event.pointerType === 'touch' || suppressedRef.current) {
      return
    }
    if (isInsideKeepOut(event.clientX, event.clientY, excludeRefsRef.current)) {
      setActive(false)
      return
    }
    const rect = event.currentTarget.getBoundingClientRect()
    setOverlay({ x: event.clientX - rect.left, y: event.clientY - rect.top })
    setActive(true)
  }, [])

  const onPointerDown = useCallback(() => {
    suppressedRef.current = true
    setActive(false)
  }, [])

  const onPointerLeave = useCallback(() => {
    suppressedRef.current = false
    setActive(false)
  }, [])

  return {
    active,
    overlay,
    targetProps: {
      'data-zoom-cursor-active': active ? '' : undefined,
      onPointerDown,
      onPointerLeave,
      onPointerMove,
    },
  }
}

export function MediaLightboxZoomCursor({
  active,
  x,
  y,
}: {
  active: boolean
  x: number
  y: number
}) {
  const reducedMotion = useReducedMotion()

  return (
    <AnimatePresence>
      {active ? (
        <motion.div
          animate={{ opacity: 1, scale: 1 }}
          className="a63-media-lightbox-zoom-cursor"
          data-slot="media-lightbox-zoom-cursor"
          exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0 }}
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0 }}
          style={{ left: x, top: y }}
          transition={reducedMotion ? { duration: 0 } : { duration: 0.12, ease: 'easeOut' }}
        >
          <Plus aria-hidden className="size-5" />
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
