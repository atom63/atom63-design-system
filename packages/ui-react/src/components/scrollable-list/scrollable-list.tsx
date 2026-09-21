/**
 * Scrollable List Component
 * Generic horizontal scrolling container with chevron navigation
 * Can be used for tabs, buttons, or any scrollable content
 */

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { cn } from '../../lib/cn'
import { Button } from '../button'
import { ScrollArea } from '../scroll-area'

const scrollableListControlClassNames = {
  button: 'a63-ScrollableList-controlButton',
  icon: 'a63-ScrollableList-controlIcon',
} as const

interface ScrollableListProps {
  children: React.ReactNode
  className?: string
  /**
   * Inline pad on the flex track (CSS length). Use for full-bleed lists whose
   * first/last items should line up with a narrower reading column — the scroll
   * viewport stays full-width; only the content is inset.
   * @example "max(1.5rem, calc((100% - 36rem) / 2 + 1.5rem))"
   */
  contentPad?: string
  /**
   * Offset chevrons from the frame edges (CSS length). Pair with `contentPad`
   * on full-bleed tracks so controls stay on the column rails.
   * @example "max(0px, calc((100% - 36rem) / 2))"
   */
  controlInset?: string
  disabled?: boolean
  /** Drag the list horizontally with a pointer (grab-to-scroll). Off by default. */
  draggable?: boolean
  /** Fade the edges as content overflows (the scroll mask). On by default. */
  mask?: boolean
  showChevrons?: boolean
  wrapLayoutBreakpoint?: number
}

function ScrollableList({
  children,
  className,
  contentPad,
  controlInset,
  showChevrons = true,
  disabled = false,
  draggable = false,
  mask = true,
  wrapLayoutBreakpoint,
}: ScrollableListProps) {
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const [useWrapLayout, setUseWrapLayout] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const getViewport = useCallback(() => {
    return scrollAreaRef.current?.querySelector<HTMLElement>('[data-slot="scroll-area-viewport"]')
  }, [])

  const checkScrollPosition = useCallback(() => {
    const viewport = getViewport()
    if (!viewport) return

    const { scrollLeft, scrollWidth, clientWidth } = viewport
    setCanScrollLeft(scrollLeft > 1)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1)
  }, [getViewport])

  const scrollContent = useCallback(
    (direction: 'left' | 'right') => {
      const viewport = getViewport()
      if (!viewport) return

      const scrollAmount = viewport.clientWidth * 0.8
      const targetScroll =
        viewport.scrollLeft + (direction === 'right' ? scrollAmount : -scrollAmount)

      viewport.scrollTo({
        left: targetScroll,
        behavior: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
          ? 'auto'
          : 'smooth',
      })
    },
    [getViewport]
  )

  // Track container width to determine layout mode (if breakpoint provided)
  useEffect(() => {
    if (!wrapLayoutBreakpoint) return

    const container = containerRef.current
    if (!container) return

    const checkWidth = () => {
      const width = container.getBoundingClientRect().width
      setUseWrapLayout(width >= wrapLayoutBreakpoint)
    }

    checkWidth()

    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(checkWidth)
    })

    resizeObserver.observe(container)
    return () => resizeObserver.disconnect()
  }, [wrapLayoutBreakpoint])

  // `children` is in the dep list on purpose: it re-runs the overflow check when items change.
  useEffect(() => {
    if (useWrapLayout) return

    const immediateCheck = window.setTimeout(checkScrollPosition, 10)
    const delayedCheck = window.setTimeout(checkScrollPosition, 100)

    return () => {
      clearTimeout(immediateCheck)
      clearTimeout(delayedCheck)
    }
  }, [checkScrollPosition, useWrapLayout, children])

  // Drag-to-scroll (grab the list and pull it horizontally)
  useEffect(() => {
    if (!draggable || disabled || useWrapLayout) {
      return
    }
    const viewport = getViewport()
    if (!viewport) {
      return
    }

    let isDown = false
    let startX = 0
    let startScroll = 0
    let moved = false

    const onPointerDown = (event: PointerEvent) => {
      isDown = true
      moved = false
      startX = event.clientX
      startScroll = viewport.scrollLeft
      viewport.setPointerCapture?.(event.pointerId)
      viewport.dataset.dragging = 'true'
    }
    const onPointerMove = (event: PointerEvent) => {
      if (!isDown) {
        return
      }
      const dx = event.clientX - startX
      if (Math.abs(dx) > 3) {
        moved = true
      }
      viewport.scrollLeft = startScroll - dx
    }
    const endDrag = (event: PointerEvent) => {
      if (!isDown) {
        return
      }
      isDown = false
      viewport.dataset.dragging = ''
      viewport.releasePointerCapture?.(event.pointerId)
    }
    // Swallow the click that ends a drag, so items in the list don't fire.
    const onClickCapture = (event: MouseEvent) => {
      if (moved) {
        event.stopPropagation()
        event.preventDefault()
        moved = false
      }
    }

    viewport.addEventListener('pointerdown', onPointerDown)
    viewport.addEventListener('pointermove', onPointerMove)
    viewport.addEventListener('pointerup', endDrag)
    viewport.addEventListener('pointercancel', endDrag)
    viewport.addEventListener('click', onClickCapture, true)

    return () => {
      viewport.removeEventListener('pointerdown', onPointerDown)
      viewport.removeEventListener('pointermove', onPointerMove)
      viewport.removeEventListener('pointerup', endDrag)
      viewport.removeEventListener('pointercancel', endDrag)
      viewport.removeEventListener('click', onClickCapture, true)
    }
  }, [disabled, draggable, useWrapLayout, getViewport])

  // Track scroll position
  useEffect(() => {
    if (useWrapLayout) return

    const viewport = getViewport()
    if (!viewport) return

    checkScrollPosition()

    viewport.addEventListener('scroll', checkScrollPosition)

    const resizeObserver = new ResizeObserver(checkScrollPosition)
    resizeObserver.observe(viewport)

    const contentContainer = viewport.querySelector<HTMLElement>(':scope > *')
    if (contentContainer) {
      resizeObserver.observe(contentContainer)
    }

    return () => {
      viewport.removeEventListener('scroll', checkScrollPosition)
      resizeObserver.disconnect()
    }
  }, [checkScrollPosition, getViewport, useWrapLayout])

  const bleedStyle =
    contentPad || controlInset
      ? ({
          ...(contentPad ? { '--scrollable-list-content-pad': contentPad } : null),
          ...(controlInset ? { '--scrollable-list-control-inset': controlInset } : null),
        } as React.CSSProperties)
      : undefined

  // If wrap layout is enabled and we're past breakpoint
  if (wrapLayoutBreakpoint && useWrapLayout) {
    return (
      <div
        className={cn('a63-ScrollableList', className)}
        data-disabled={disabled || undefined}
        data-slot="scrollable-list"
        ref={containerRef}
        style={bleedStyle}
      >
        <div className="a63-ScrollableList-content" data-slot="scrollable-list-content">
          {children}
        </div>
      </div>
    )
  }

  // Horizontal scroll layout
  return (
    <div
      className={cn('a63-ScrollableList', className)}
      data-disabled={disabled || undefined}
      data-draggable={draggable || undefined}
      data-slot="scrollable-list"
      ref={containerRef}
      style={bleedStyle}
    >
      <div className="a63-ScrollableList-frame" data-slot="scrollable-list-frame">
        <ScrollArea
          className="[&_[data-slot=scroll-area-scrollbar][data-orientation=vertical]]:hidden"
          ref={scrollAreaRef}
          scrollFade={mask}
          viewportClassName="overflow-y-hidden"
        >
          <div className="a63-ScrollableList-content" data-slot="scrollable-list-content">
            {children}
          </div>
        </ScrollArea>

        {/* Left chevron */}
        {showChevrons && canScrollLeft && !disabled && (
          <div
            className="a63-ScrollableList-control"
            data-side="left"
            data-slot="scrollable-list-control"
            data-visible
          >
            <Button
              aria-label="Scroll left"
              className={scrollableListControlClassNames.button}
              onClick={() => scrollContent('left')}
              size="icon-lg"
              type="button"
              variant="secondary"
            >
              <ChevronLeft className={scrollableListControlClassNames.icon} />
            </Button>
          </div>
        )}

        {/* Right chevron */}
        {showChevrons && canScrollRight && !disabled && (
          <div
            className="a63-ScrollableList-control"
            data-side="right"
            data-slot="scrollable-list-control"
            data-visible
          >
            <Button
              aria-label="Scroll right"
              className={scrollableListControlClassNames.button}
              onClick={() => scrollContent('right')}
              size="icon-lg"
              type="button"
              variant="secondary"
            >
              <ChevronRight className={scrollableListControlClassNames.icon} />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export { ScrollableList, scrollableListControlClassNames }
export type { ScrollableListProps }
