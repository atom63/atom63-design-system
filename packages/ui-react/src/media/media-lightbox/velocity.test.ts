import { describe, expect, it } from 'vitest'
import { createVelocityTracker } from './velocity'

describe('createVelocityTracker', () => {
  it('reports nothing before there is a second sample', () => {
    const tracker = createVelocityTracker()
    tracker.reset(0, 0)
    expect(tracker.velocity()).toBe(0)
  })

  it('refuses to read a speed off less than a frame', () => {
    // Coalesced or synthetic events can land fractions of a millisecond apart.
    // Dividing a real distance by almost nothing reports a speed no hand made.
    const tracker = createVelocityTracker()
    tracker.reset(0, 0)
    tracker.push(80, 0.3)

    expect(tracker.velocity()).toBe(0)
  })

  it('measures the trailing window, not the whole gesture', () => {
    // A long, slow drag that ends in a flick. The average over the whole
    // gesture is 200px / 1000ms = 0.2px/ms, which reads as no flick at all.
    const tracker = createVelocityTracker(100)
    tracker.reset(0, 0)
    for (let time = 100; time <= 900; time += 100) {
      tracker.push(time / 10, time)
    }
    tracker.push(200, 950)

    expect(tracker.velocity()).toBeGreaterThan(1)
  })

  it('reports a stop as a stop, however fast the gesture started', () => {
    // The mirror case: a fast nudge, then the finger rests before letting go.
    const tracker = createVelocityTracker(100)
    tracker.reset(0, 0)
    tracker.push(150, 50)
    for (let time = 150; time <= 600; time += 50) {
      tracker.push(150, time)
    }

    expect(tracker.velocity()).toBe(0)
  })

  it('signs the velocity with the direction of travel', () => {
    const tracker = createVelocityTracker(100)
    tracker.reset(0, 0)
    tracker.push(-40, 40)
    tracker.push(-80, 80)

    expect(tracker.velocity()).toBeLessThan(0)
  })

  it('starts over on reset', () => {
    const tracker = createVelocityTracker(100)
    tracker.reset(0, 0)
    tracker.push(100, 50)
    tracker.reset(0, 1000)

    expect(tracker.velocity()).toBe(0)
  })
})
