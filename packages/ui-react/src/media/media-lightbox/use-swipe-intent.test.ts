import { renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useSwipeIntent } from './use-swipe-intent'
import {
  continuousTrace,
  doubleFastTrace,
  singleTrace,
  verticalTrace,
  type WheelTrace,
} from './wheel-traces.fixture'

interface WheelSample {
  deltaX: number
  deltaY: number
}

function dispatchWheel(root: HTMLDivElement, samples: readonly WheelSample[]) {
  for (const sample of samples) {
    const event = new WheelEvent('wheel', {
      bubbles: true,
      cancelable: true,
      deltaX: sample.deltaX,
      deltaY: sample.deltaY,
    })
    root.dispatchEvent(event)
  }
}

/**
 * A deliberate horizontal swipe that keeps driving well past the moment it
 * first crosses the threshold (event 4, cumulative 80px against a 60px
 * threshold). Without a lock the accumulator resets and keeps climbing —
 * event 8 crosses a second time (20 + 40 + 60 + 80) — so this fixture can
 * only produce one call if something is swallowing events 5-8.
 */
function drivenSwipeSamples(sign: 1 | -1): WheelSample[] {
  return Array.from({ length: 8 }, () => ({ deltaX: sign * 20, deltaY: 0 }))
}

/**
 * A momentum coast whose own deltas — despite shrinking, as a real trackpad's
 * do — sum well past the threshold on their own (50 + 40 + 30 + 20 = 140px
 * against 60px). If the lock a driven swipe just set were not holding, this
 * tail would report a second turn purely from its own totals.
 */
function momentumTailSamples(sign: 1 | -1): WheelSample[] {
  return [50, 40, 30, 20].map(deltaX => ({ deltaX: sign * deltaX, deltaY: 0 }))
}

function makeStage(direction: 'ltr' | 'rtl' = 'ltr'): {
  root: HTMLDivElement
  stage: HTMLDivElement
} {
  const root = document.createElement('div')
  const stage = document.createElement('div')
  stage.style.direction = direction
  root.append(stage)
  document.body.append(root)
  return { root, stage }
}

interface Drag {
  clientX: number
  clientY: number
  time: number
}

function dispatchDrag(root: HTMLDivElement, points: readonly Drag[]) {
  const pointerId = 1
  const at = (type: string, point: Drag) => {
    const event = new PointerEvent(type, {
      bubbles: true,
      button: 0,
      cancelable: true,
      clientX: point.clientX,
      clientY: point.clientY,
      pointerId,
      pointerType: 'touch',
    })
    Object.defineProperty(event, 'timeStamp', { value: point.time })
    return event
  }

  const [first, ...rest] = points
  if (!first) {
    return
  }
  root.dispatchEvent(at('pointerdown', first))
  for (const point of rest.slice(0, -1)) {
    window.dispatchEvent(at('pointermove', point))
  }
  const last = rest.at(-1)
  if (last) {
    window.dispatchEvent(at('pointermove', last))
    window.dispatchEvent(at('pointerup', last))
  }
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('useSwipeIntent', () => {
  it('reports the direction of a horizontal drag past the distance threshold', () => {
    const { root, stage } = makeStage()
    const onIntent = vi.fn()
    renderHook(() =>
      useSwipeIntent({
        enabled: true,
        onIntent,
        rootRef: { current: root },
        stageRef: { current: stage },
      })
    )

    dispatchDrag(root, [
      { clientX: 400, clientY: 200, time: 0 },
      { clientX: 250, clientY: 200, time: 400 },
      // A drag left reads like the physical right arrow: it turns the page
      // forward.
      { clientX: 130, clientY: 200, time: 800 },
    ])

    expect(onIntent).toHaveBeenCalledWith(1)
  })

  it('reports nothing for a slow drag that never crosses the threshold', () => {
    const { root, stage } = makeStage()
    const onIntent = vi.fn()
    renderHook(() =>
      useSwipeIntent({
        enabled: true,
        onIntent,
        rootRef: { current: root },
        stageRef: { current: stage },
      })
    )

    dispatchDrag(root, [
      { clientX: 400, clientY: 200, time: 0 },
      { clientX: 380, clientY: 200, time: 400 },
      { clientX: 360, clientY: 200, time: 800 },
    ])

    expect(onIntent).not.toHaveBeenCalled()
  })

  it('reports a fast flick that never covers the distance threshold', () => {
    const { root, stage } = makeStage()
    const onIntent = vi.fn()
    renderHook(() =>
      useSwipeIntent({
        enabled: true,
        onIntent,
        rootRef: { current: root },
        stageRef: { current: stage },
      })
    )

    dispatchDrag(root, [
      { clientX: 400, clientY: 200, time: 0 },
      { clientX: 370, clientY: 200, time: 8 },
      // 60px in 16ms total — well under the 120px distance floor but fast
      // enough (~1.9px/ms trailing) to clear the velocity threshold.
      { clientX: 340, clientY: 200, time: 16 },
    ])

    expect(onIntent).toHaveBeenCalledWith(1)
  })

  it('leaves a mostly-vertical drag to pull-to-dismiss', () => {
    const { root, stage } = makeStage()
    const onIntent = vi.fn()
    renderHook(() =>
      useSwipeIntent({
        enabled: true,
        onIntent,
        rootRef: { current: root },
        stageRef: { current: stage },
      })
    )

    dispatchDrag(root, [
      { clientX: 400, clientY: 200, time: 0 },
      { clientX: 420, clientY: 400, time: 400 },
      { clientX: 430, clientY: 600, time: 800 },
    ])

    expect(onIntent).not.toHaveBeenCalled()
  })

  it('mirrors the direction in a right-to-left gallery', () => {
    const { root, stage } = makeStage('rtl')
    const onIntent = vi.fn()
    renderHook(() =>
      useSwipeIntent({
        enabled: true,
        onIntent,
        rootRef: { current: root },
        stageRef: { current: stage },
      })
    )

    // The same leftward drag that turned the page forward in LTR turns it
    // backward in RTL — the first slide sits on the other side.
    dispatchDrag(root, [
      { clientX: 400, clientY: 200, time: 0 },
      { clientX: 250, clientY: 200, time: 400 },
      { clientX: 130, clientY: 200, time: 800 },
    ])

    expect(onIntent).toHaveBeenCalledWith(-1)
  })

  it('reports nothing while zoomed (disabled)', () => {
    const { root, stage } = makeStage()
    const onIntent = vi.fn()
    renderHook(() =>
      useSwipeIntent({
        enabled: false,
        onIntent,
        rootRef: { current: root },
        stageRef: { current: stage },
      })
    )

    dispatchDrag(root, [
      { clientX: 400, clientY: 200, time: 0 },
      { clientX: 250, clientY: 200, time: 400 },
      { clientX: 130, clientY: 200, time: 800 },
    ])

    expect(onIntent).not.toHaveBeenCalled()
  })

  it('writes nothing to the DOM at any point during the drag', () => {
    const { root, stage } = makeStage()
    const onIntent = vi.fn()
    renderHook(() =>
      useSwipeIntent({
        enabled: true,
        onIntent,
        rootRef: { current: root },
        stageRef: { current: stage },
      })
    )

    const rootAttributesBefore = root.outerHTML
    const stageStyleBefore = stage.style.cssText

    const pointerId = 1
    const at = (type: string, clientX: number, clientY: number, time: number) => {
      const event = new PointerEvent(type, {
        bubbles: true,
        button: 0,
        cancelable: true,
        clientX,
        clientY,
        pointerId,
        pointerType: 'touch',
      })
      Object.defineProperty(event, 'timeStamp', { value: time })
      return event
    }

    root.dispatchEvent(at('pointerdown', 400, 200, 0))
    // Direction is decided over the course of the whole drag, so every frame
    // in between must leave the DOM alone too, not just the first and last.
    for (let step = 1; step <= 5; step += 1) {
      window.dispatchEvent(at('pointermove', 400 - step * 50, 200, step * 100))
      expect(stage.style.cssText).toBe(stageStyleBefore)
      expect(root.outerHTML).toBe(rootAttributesBefore)
    }
    window.dispatchEvent(at('pointerup', 150, 200, 600))

    expect(onIntent).toHaveBeenCalled()
    expect(stage.style.cssText).toBe(stageStyleBefore)
    expect(root.outerHTML).toBe(rootAttributesBefore)
  })
})

describe('useSwipeIntent (trackpad wheel)', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
    document.body.innerHTML = ''
  })

  /** Past the quiet interval — the lock has released. */
  function flushQuiet() {
    vi.advanceTimersByTime(200)
  }

  it('turns the page exactly once for one continuous horizontal wheel sequence', () => {
    const { root, stage } = makeStage()
    const onIntent = vi.fn()
    renderHook(() =>
      useSwipeIntent({
        enabled: true,
        onIntent,
        rootRef: { current: root },
        stageRef: { current: stage },
      })
    )

    dispatchWheel(root, drivenSwipeSamples(1))

    expect(onIntent).toHaveBeenCalledTimes(1)
    expect(onIntent).toHaveBeenCalledWith(1)
  })

  it('turns the page once more after the wheel has been quiet', () => {
    const { root, stage } = makeStage()
    const onIntent = vi.fn()
    renderHook(() =>
      useSwipeIntent({
        enabled: true,
        onIntent,
        rootRef: { current: root },
        stageRef: { current: stage },
      })
    )

    dispatchWheel(root, drivenSwipeSamples(1))
    expect(onIntent).toHaveBeenCalledTimes(1)

    flushQuiet()

    dispatchWheel(root, drivenSwipeSamples(1))
    expect(onIntent).toHaveBeenCalledTimes(2)
  })

  it('does not let the momentum tail sneak a second page turn', () => {
    const { root, stage } = makeStage()
    const onIntent = vi.fn()
    renderHook(() =>
      useSwipeIntent({
        enabled: true,
        onIntent,
        rootRef: { current: root },
        stageRef: { current: stage },
      })
    )

    // The driven part crosses the threshold and reports once, immediately
    // followed — no gap — by the decaying coast a real trackpad emits after
    // the fingers lift.
    dispatchWheel(root, drivenSwipeSamples(1))
    dispatchWheel(root, momentumTailSamples(1))

    // Still locked: the tail arrived well within the quiet interval of every
    // preceding event, so the lock never had a chance to release mid-tail.
    expect(onIntent).toHaveBeenCalledTimes(1)

    flushQuiet()

    expect(onIntent).toHaveBeenCalledTimes(1)
  })

  describe('replaying real trackpad recordings', () => {
    // Fixtures written by hand describe the gesture whoever wrote them
    // imagined. These are recordings of the hardware, which is the only thing
    // that can contradict that imagination — and it did: the shape that broke
    // the lock, a trough where the fingers leave the surface between two
    // swipes, does not occur anywhere in the synthetic fixtures above.
    const traces: readonly (readonly [string, WheelTrace])[] = [
      ['one swipe', singleTrace],
      ['nine swipes with no pause between them', doubleFastTrace],
      ['five swipes in a row', continuousTrace],
      ['a vertical scroll', verticalTrace],
    ]

    for (const [label, trace] of traces) {
      it(`turns the page once per deliberate swipe — ${label}`, () => {
        const { root, stage } = makeStage()
        const onIntent = vi.fn()
        renderHook(() =>
          useSwipeIntent({
            enabled: true,
            onIntent,
            rootRef: { current: root },
            stageRef: { current: stage },
          })
        )

        let elapsed = 0
        for (const [t, deltaX, deltaY] of trace.events) {
          // Advancing the fake clock in step with the recording is what makes
          // the quiet-interval backstop behave as it did on the day: the
          // largest gap in these recordings is 66ms, so it must never fire
          // mid-burst.
          vi.advanceTimersByTime(Math.max(0, t - elapsed))
          elapsed = t
          dispatchWheel(root, [{ deltaX, deltaY }])
        }

        expect(onIntent).toHaveBeenCalledTimes(trace.expectedTurns)
      })
    }
  })

  it('leaves a mostly-vertical wheel sequence to pull-to-dismiss', () => {
    const { root, stage } = makeStage()
    const onIntent = vi.fn()
    renderHook(() =>
      useSwipeIntent({
        enabled: true,
        onIntent,
        rootRef: { current: root },
        stageRef: { current: stage },
      })
    )

    dispatchWheel(root, [
      { deltaX: 10, deltaY: 40 },
      { deltaX: 10, deltaY: 40 },
      { deltaX: 10, deltaY: 40 },
      { deltaX: 10, deltaY: 40 },
    ])

    expect(onIntent).not.toHaveBeenCalled()
  })

  it('reports nothing for wheel input while zoomed (disabled)', () => {
    const { root, stage } = makeStage()
    const onIntent = vi.fn()
    renderHook(() =>
      useSwipeIntent({
        enabled: false,
        onIntent,
        rootRef: { current: root },
        stageRef: { current: stage },
      })
    )

    dispatchWheel(root, drivenSwipeSamples(1))

    expect(onIntent).not.toHaveBeenCalled()
  })

  it('mirrors the wheel direction in a right-to-left gallery', () => {
    const { root, stage } = makeStage('rtl')
    const onIntent = vi.fn()
    renderHook(() =>
      useSwipeIntent({
        enabled: true,
        onIntent,
        rootRef: { current: root },
        stageRef: { current: stage },
      })
    )

    // Positive `deltaX` turns the page forward in LTR; RTL flips it backward.
    dispatchWheel(root, drivenSwipeSamples(1))

    expect(onIntent).toHaveBeenCalledWith(-1)
  })
})
