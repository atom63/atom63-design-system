import { describe, expect, it } from 'vitest'

import { BUBBLE_GAP, BUBBLE_MARGIN, placeBubble } from './place-bubble'

const viewport = { width: 1000, height: 800 }
const bubble = { width: 320, height: 160 }

describe('placeBubble', () => {
  it('sits below the anchor when there is room', () => {
    const placement = placeBubble({
      anchor: { top: 100, left: 200, width: 120, height: 40 },
      bubble,
      viewport,
    })

    expect(placement.side).toBe('bottom')
    expect(placement.top).toBe(100 + 40 + BUBBLE_GAP)
    expect(placement.left).toBe(200)
  })

  it('flips above the anchor when the space below is too small', () => {
    const placement = placeBubble({
      // 60px of room below: less than the bubble plus its gap and margin.
      anchor: { top: 700, left: 200, width: 120, height: 40 },
      bubble,
      viewport,
    })

    expect(placement.side).toBe('top')
    expect(placement.top).toBe(700 - 160 - BUBBLE_GAP)
  })

  it('stays below when neither side fits but below has more room', () => {
    const placement = placeBubble({
      anchor: { top: 300, left: 200, width: 40, height: 40 },
      bubble: { width: 320, height: 700 },
      viewport,
    })

    expect(placement.side).toBe('bottom')
  })

  it('flips above when neither side fits but above has more room', () => {
    const placement = placeBubble({
      anchor: { top: 600, left: 200, width: 40, height: 40 },
      bubble: { width: 320, height: 700 },
      viewport,
    })

    expect(placement.side).toBe('top')
  })

  it('never lets the bubble escape the top of the viewport', () => {
    const placement = placeBubble({
      anchor: { top: 10, left: 200, width: 40, height: 20 },
      bubble: { width: 320, height: 600 },
      viewport,
    })

    expect(placement.top).toBeGreaterThanOrEqual(BUBBLE_MARGIN)
  })

  it('never lets the bubble escape the bottom of the viewport', () => {
    const placement = placeBubble({
      anchor: { top: 790, left: 200, width: 40, height: 20 },
      bubble,
      viewport,
    })

    expect(placement.top + bubble.height).toBeLessThanOrEqual(viewport.height - BUBBLE_MARGIN)
  })

  it('clamps against the right edge instead of overflowing', () => {
    const placement = placeBubble({
      anchor: { top: 100, left: 900, width: 80, height: 40 },
      bubble,
      viewport,
    })

    expect(placement.left + bubble.width).toBeLessThanOrEqual(viewport.width - BUBBLE_MARGIN)
  })

  it('clamps against the left edge instead of overflowing', () => {
    const placement = placeBubble({
      anchor: { top: 100, left: -40, width: 80, height: 40 },
      bubble,
      viewport,
    })

    expect(placement.left).toBeGreaterThanOrEqual(BUBBLE_MARGIN)
  })

  it('prefers the left edge when the bubble is wider than the viewport', () => {
    const placement = placeBubble({
      anchor: { top: 100, left: 100, width: 80, height: 40 },
      bubble: { width: 1200, height: 160 },
      viewport,
    })

    // Clamping must not produce a negative offset that hides the bubble's start.
    expect(placement.left).toBe(BUBBLE_MARGIN)
  })

  it('is stable: placing an already-placed bubble does not move it', () => {
    const anchor = { top: 100, left: 200, width: 120, height: 40 }
    const first = placeBubble({ anchor, bubble, viewport })
    const second = placeBubble({ anchor, bubble, viewport })

    expect(second).toEqual(first)
  })
})
