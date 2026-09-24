import { describe, expect, it } from 'vitest'
import { motionDurations, motionEasings } from './motion-tokens'

describe('motion tokens', () => {
  it('exposes fast/base/slow durations in seconds', () => {
    expect(motionDurations.fast).toBeLessThan(motionDurations.base)
    expect(motionDurations.base).toBeLessThan(motionDurations.slow)
    expect(motionDurations.base).toBe(0.3)
  })

  it('exposes cubic-bezier easing tuples', () => {
    expect(motionEasings.standard).toHaveLength(4)
    expect(motionEasings.emphasized).toHaveLength(4)
  })
})
