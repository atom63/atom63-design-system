import type { AnchorRect } from './use-anchor-rect'

/** Distance between the anchor and the bubble. */
export const BUBBLE_GAP = 12

/** Minimum distance the bubble keeps from every viewport edge. */
export const BUBBLE_MARGIN = 8

export type BubbleSize = {
  width: number
  height: number
}

export type Viewport = {
  width: number
  height: number
}

export type BubblePlacement = {
  top: number
  left: number
  side: 'top' | 'bottom'
}

export type PlaceBubbleInput = {
  anchor: AnchorRect
  bubble: BubbleSize
  viewport: Viewport
}

function clamp(value: number, min: number, max: number): number {
  // When max < min the range is degenerate (the bubble is larger than the
  // viewport). Preferring min keeps the bubble's start on screen, which is
  // where its title and first line of copy live.
  if (max < min) return min
  return Math.min(Math.max(value, min), max)
}

/**
 * Decides where a spotlight bubble goes, given the anchor it explains and the
 * room available around it.
 *
 * Pure by design: jsdom has no layout engine, so a component test cannot
 * meaningfully exercise flipping or clamping. Keeping the decision here is what
 * makes this behavior testable at all.
 */
export function placeBubble({ anchor, bubble, viewport }: PlaceBubbleInput): BubblePlacement {
  const anchorBottom = anchor.top + anchor.height
  const needed = bubble.height + BUBBLE_GAP + BUBBLE_MARGIN

  const roomBelow = viewport.height - anchorBottom
  const roomAbove = anchor.top

  const side: BubblePlacement['side'] =
    roomBelow >= needed || roomBelow >= roomAbove ? 'bottom' : 'top'

  const preferredTop =
    side === 'bottom' ? anchorBottom + BUBBLE_GAP : anchor.top - bubble.height - BUBBLE_GAP

  return {
    side,
    top: clamp(preferredTop, BUBBLE_MARGIN, viewport.height - bubble.height - BUBBLE_MARGIN),
    left: clamp(anchor.left, BUBBLE_MARGIN, viewport.width - bubble.width - BUBBLE_MARGIN),
  }
}
