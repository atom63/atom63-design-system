import { Children, useCallback, useLayoutEffect, useRef, useState } from 'react'
import type { CSSProperties, ReactElement, ReactNode } from 'react'

import { cn } from '../lib/cn'

export type InformFlyoutPlacement = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'

export type InformFlyoutStackProps = {
  children: ReactNode
  placement?: InformFlyoutPlacement
  /** CSS length for the inset on the anchored edge. Pass app chrome clearance here. */
  offset?: string
  className?: string
}

/** How much of each card behind the front one stays visible when collapsed. */
const PEEK_PX = 14

/** How much narrower each card behind the front one looks. */
const SCALE_STEP = 0.05

/** Gap between cards once the stack is expanded. */
const EXPANDED_GAP_PX = 8

function isTopAnchored(placement: InformFlyoutPlacement): boolean {
  return placement.startsWith('top')
}

/**
 * Positioned container for the corner flyout stack.
 *
 * Collapsed, it behaves the way a toast stack does: the front card is fully
 * visible and the ones behind it peek out, each a little narrower, so three
 * messages read as one stack rather than three loose cards. Hover — or focus
 * anywhere inside, which is what keeps a keyboard able to reach the back cards
 * — expands it into the full list.
 *
 * The offsets have to be measured rather than expressed in CSS: each card sits
 * relative to the height of the ones in front of it, and those heights depend
 * on their content.
 */
export function InformFlyoutStack({
  children,
  className,
  offset = '1rem',
  placement = 'bottom-right',
}: InformFlyoutStackProps): ReactElement {
  const items = Children.toArray(children)
  const count = items.length
  const top = isTopAnchored(placement)

  const [expanded, setExpanded] = useState(false)
  const [heights, setHeights] = useState<number[]>([])
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])

  const measure = useCallback(() => {
    /*
     * Measure the WRAPPER, and with `offsetHeight`.
     *
     * The wrapper because it survives: cards are keyed by message id, so
     * dismissing one swaps every card node below it while the wrappers stay
     * put. An observer bound to the card was left watching a detached node, so
     * heights went stale the moment the set changed — visible as a gap of 26px
     * where 8px belonged, after two dismissals in a row.
     *
     * `offsetHeight` because a collapsed card is scaled down and a bounding
     * rect reports the SCALED height, which placed every expanded card short.
     */
    const next = itemRefs.current.slice(0, count).map(element => element?.offsetHeight ?? 0)
    setHeights(previous =>
      previous.length === next.length && previous.every((value, index) => value === next[index])
        ? previous
        : next
    )
  }, [count])

  // Measure before paint, then keep watching: a card's height changes with a
  // late font, a longer translation, or content that arrives after mount.
  useLayoutEffect(() => {
    measure()
    if (typeof ResizeObserver === 'undefined') return

    const observer = new ResizeObserver(measure)
    for (const element of itemRefs.current.slice(0, count)) {
      if (element != null) observer.observe(element)
    }
    return () => {
      observer.disconnect()
    }
  }, [measure, count, expanded])

  const heightOf = (index: number): number => heights[index] ?? 0

  const offsetFor = (index: number): number => {
    if (!expanded) return index * PEEK_PX
    let total = 0
    for (let i = 0; i < index; i += 1) total += heightOf(i) + EXPANDED_GAP_PX
    return total
  }

  const totalHeight = items.reduce<number>((sum, _item, index) => sum + heightOf(index), 0)
  const containerHeight = expanded
    ? totalHeight + (count - 1) * EXPANDED_GAP_PX
    : heightOf(0) + (count - 1) * PEEK_PX

  const itemStyle = (index: number): CSSProperties => ({
    position: 'absolute',
    insetInline: 0,
    [top ? 'top' : 'bottom']: 0,
    // Cards in front must paint over the ones behind them.
    zIndex: count - index,
    transform: `translateY(${(top ? 1 : -1) * offsetFor(index)}px) scale(${
      expanded ? 1 : 1 - index * SCALE_STEP
    })`,
    transformOrigin: top ? 'top center' : 'bottom center',
  })

  return (
    <div
      // The corner's inline edge and the pointer handling live in the
      // stylesheet: the container ignores the pointer and the cards take it
      // back, so the page stays clickable through the gaps between them.
      className={cn('a63-InformFlyoutStack', className)}
      data-expanded={expanded ? '' : undefined}
      data-placement={placement}
      data-slot="inform-flyout-stack"
      data-testid="inform-flyout-stack"
      onBlur={event => {
        if (!event.currentTarget.contains(event.relatedTarget)) setExpanded(false)
      }}
      onFocus={() => {
        setExpanded(true)
      }}
      onMouseEnter={() => {
        setExpanded(true)
      }}
      onMouseLeave={() => {
        setExpanded(false)
      }}
      style={{
        [top ? 'top' : 'bottom']: offset,
        height: containerHeight === 0 ? undefined : containerHeight,
      }}
    >
      {items.map((item, index) => (
        <div
          className="a63-InformFlyoutStack-item"
          data-slot="inform-flyout-item"
          key={index}
          ref={element => {
            itemRefs.current[index] = element
          }}
          style={itemStyle(index)}
        >
          {item}
        </div>
      ))}
    </div>
  )
}
