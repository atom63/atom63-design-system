import { useEffect, useState } from 'react'

export type AnchorRect = {
  top: number
  left: number
  width: number
  height: number
}

function readRect(anchor: string): AnchorRect | null {
  if (typeof document === 'undefined') return null

  const element = document.querySelector(anchor)
  if (element === null) return null

  const rect = element.getBoundingClientRect()
  // A zero-area rect means the anchor is hidden or collapsed. Treat it as
  // absent so the caller skips the message instead of cutting a hole over
  // nothing.
  if (rect.width === 0 || rect.height === 0) return null

  return { top: rect.top, left: rect.left, width: rect.width, height: rect.height }
}

/**
 * Tracks an anchor's viewport rect while `active`. Returns null when the anchor
 * is absent or has no area — callers must render nothing in that case.
 */
export function useAnchorRect(anchor: string, active: boolean): AnchorRect | null {
  const [rect, setRect] = useState<AnchorRect | null>(null)

  useEffect(() => {
    if (!active) {
      setRect(null)
      return
    }

    const update = (): void => {
      setRect(readRect(anchor))
    }
    update()

    const element = typeof document === 'undefined' ? null : document.querySelector(anchor)
    const observer =
      element === null || typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(update)
    if (element !== null) observer?.observe(element)

    window.addEventListener('resize', update)
    // Capture phase so the rect follows anchors inside scroll containers too.
    window.addEventListener('scroll', update, true)

    return () => {
      observer?.disconnect()
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
    }
  }, [anchor, active])

  return rect
}

function readViewport(): { width: number; height: number } {
  if (typeof window === 'undefined') return { width: 0, height: 0 }
  return { width: window.innerWidth, height: window.innerHeight }
}

/**
 * Tracks the viewport size while `active`. Structurally typed so it stays free
 * of an import cycle with the placement module.
 */
export function useViewportSize(active: boolean): { width: number; height: number } {
  const [size, setSize] = useState(readViewport)

  useEffect(() => {
    if (!active) return

    const update = (): void => {
      setSize(readViewport())
    }
    update()

    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('resize', update)
    }
  }, [active])

  return size
}
