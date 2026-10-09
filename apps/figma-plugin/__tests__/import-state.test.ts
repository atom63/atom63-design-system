import type { CheckOutcome, SyncOutcome } from '@atom63/figma'

import { nextResults, previewReason } from '../src/app/import-state'

const planned = { planned: { create: 1 } } as unknown as CheckOutcome
const applied = { applied: { created: 1 } } as unknown as SyncOutcome

describe('nextResults', () => {
  it('drops the plan once it is applied, so the Apply button goes away', () => {
    expect(nextResults({ planned }, { type: 'applied', data: applied })).toEqual({ applied })
  })

  it('drops an earlier apply when a new plan arrives', () => {
    expect(nextResults({ applied }, { type: 'planned', data: planned })).toEqual({ planned })
  })

  it('drops the applied result as soon as a new preview is asked for', () => {
    expect(nextResults({ applied }, { type: 'plan-sent' })).toEqual({})
  })

  it('forgets both when the CSS changes, so Apply never runs an old count', () => {
    expect(nextResults({ planned, applied }, { type: 'source-changed' })).toEqual({})
  })
})

describe('previewReason', () => {
  it('asks for CSS before there is any', () => {
    expect(previewReason(null)).toBe('Choose or paste CSS first.')
  })

  it('asks to fix CSS that could not be read', () => {
    expect(previewReason({ error: 'Unexpected }' })).toBe('Fix the CSS first.')
  })

  it('has no reason once the CSS reads', () => {
    expect(previewReason({ model: {} })).toBeNull()
  })
})
