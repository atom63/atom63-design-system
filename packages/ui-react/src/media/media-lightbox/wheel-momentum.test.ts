import { describe, expect, it } from 'vitest'
import { createWheelMomentum, swallowWheelMomentum } from './wheel-momentum'

/** Feeds a series and reports the index at which the tail was first called. */
function firstTailIndex(samples: readonly (readonly [number, number])[]): number {
  const momentum = createWheelMomentum()
  for (const [index, [delta, time]] of samples.entries()) {
    if (momentum.push(delta, time)) {
      return index
    }
  }
  return -1
}

/** A trackpad swipe: deltas ramp up under the fingers, then coast down. */
function trackpadGesture(): (readonly [number, number])[] {
  const samples: (readonly [number, number])[] = []
  let time = 0
  for (const delta of [-4, -12, -28, -46, -60, -66]) {
    samples.push([delta, time] as const)
    time += 16
  }
  // Fingers up. The browser coasts, shrinking smoothly toward zero.
  for (let delta = 62; delta > 1; delta *= 0.82) {
    samples.push([-delta, time] as const)
    time += 16
  }
  return samples
}

describe('createWheelMomentum', () => {
  it('leaves the driven part of a swipe alone', () => {
    const samples = trackpadGesture()
    const tail = firstTailIndex(samples)

    // The ramp is the first six samples; the tail must not be called inside it.
    expect(tail).toBeGreaterThan(5)
  })

  it('calls the tail within a few events of the fingers lifting', () => {
    const tail = firstTailIndex(trackpadGesture())

    // Three shrinking samples to be sure, so the tail lands shortly after the
    // peak at index 5 — not half a second later.
    expect(tail).toBeGreaterThan(5)
    expect(tail).toBeLessThanOrEqual(10)
  })

  it('never calls a real wheel momentum', () => {
    // Evenly sized notches, spaced far wider than a frame.
    const notches: (readonly [number, number])[] = []
    for (let i = 0; i < 12; i += 1) {
      notches.push([-100, i * 120] as const)
    }

    expect(firstTailIndex(notches)).toBe(-1)
  })

  it('does not mistake a pause followed by a smaller push for a tail', () => {
    const samples: (readonly [number, number])[] = [
      [-60, 0],
      [-60, 16],
      // The user stops, thinks, and nudges again more gently.
      [-20, 900],
      [-18, 916],
      [-17, 932],
    ]

    expect(firstTailIndex(samples)).toBe(-1)
  })

  it('holds steady deltas to be the user, not a coast', () => {
    const steady: (readonly [number, number])[] = []
    for (let i = 0; i < 20; i += 1) {
      steady.push([-40, i * 16] as const)
    }

    expect(firstTailIndex(steady)).toBe(-1)
  })

  it('starts over after a reset', () => {
    const momentum = createWheelMomentum()
    for (const [delta, time] of trackpadGesture()) {
      momentum.push(delta, time)
    }
    momentum.reset()

    expect(momentum.push(-4, 2000)).toBe(false)
    expect(momentum.push(-12, 2016)).toBe(false)
  })
})

describe('swallowWheelMomentum', () => {
  const dispatch = (deltaY: number) => {
    const event = new WheelEvent('wheel', { bubbles: true, cancelable: true, deltaY })
    window.dispatchEvent(event)
    return event.defaultPrevented
  }

  it('eats what it is allowed to eat', () => {
    swallowWheelMomentum()

    const coast = [-58, -50, -42, -35, -28, -22, -17, -12]
    expect(coast.map(dispatch)).toEqual(coast.map(() => true))
  })

  it('does not read a growing delta as a new push', () => {
    swallowWheelMomentum()

    // Wheel events reach the main thread coalesced and rAF-aligned, so two
    // momentum ticks merged into one frame arrive *larger* than the tick
    // before them. Releasing on that put the page back under a coast that was
    // still running.
    expect(dispatch(-40)).toBe(true)
    expect(dispatch(-30)).toBe(true)
    expect(dispatch(-120)).toBe(true)
  })

  it('lets go once the wheel falls quiet', async () => {
    swallowWheelMomentum()
    expect(dispatch(-40)).toBe(true)

    await new Promise(resolve => {
      setTimeout(resolve, 200)
    })

    expect(dispatch(-40)).toBe(false)
  })
})
