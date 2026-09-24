import { describe, expect, it } from 'vitest'
import * as primitives from './index'

describe('primitives barrel', () => {
  it('exports every primitive and slot helper', () => {
    for (const name of [
      'Section',
      'Stack',
      'Grid',
      'Bleed',
      'Aside',
      'Reveal',
      'Stagger',
      'createSlot',
      'pickSlot',
      'pickRest',
      'useMdxReducedMotion',
      'motionDurations',
    ]) {
      expect(primitives).toHaveProperty(name)
    }
  })
})
