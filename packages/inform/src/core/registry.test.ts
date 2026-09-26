import { describe, expect, it } from 'vitest'

import { defineInformRegistry, dismissalKey } from './registry'
import type { InformMessage } from './types'

function message(overrides: Partial<InformMessage> = {}): InformMessage {
  return {
    id: 'alpha',
    surface: 'banner',
    severity: 'info',
    priority: 0,
    dismiss: 'none',
    content: { body: 'Body' },
    ...overrides,
  }
}

describe('defineInformRegistry', () => {
  it('returns a registry preserving declaration order', () => {
    const registry = defineInformRegistry([message({ id: 'alpha' }), message({ id: 'beta' })])

    expect(registry.messages.map(entry => entry.id)).toEqual(['alpha', 'beta'])
  })

  it('rejects duplicate ids', () => {
    expect(() =>
      defineInformRegistry([message({ id: 'alpha' }), message({ id: 'alpha' })])
    ).toThrow(/duplicate inform message id "alpha"/i)
  })

  it('rejects a spotlight without an anchor', () => {
    expect(() => defineInformRegistry([message({ surface: 'spotlight' })])).toThrow(
      /requires an "anchor"/i
    )
  })

  it('rejects an anchor on a non-spotlight surface', () => {
    expect(() => defineInformRegistry([message({ surface: 'banner', anchor: '#target' })])).toThrow(
      /only valid on the "spotlight" surface/i
    )
  })

  it('rejects a non-finite priority', () => {
    expect(() => defineInformRegistry([message({ priority: Number.NaN })])).toThrow(
      /finite "priority"/i
    )
  })

  it('rejects an end date that precedes the start date', () => {
    expect(() =>
      defineInformRegistry([
        message({ startsAt: '2026-02-01T00:00:00Z', endsAt: '2026-01-01T00:00:00Z' }),
      ])
    ).toThrow(/"endsAt" must come after "startsAt"/i)
  })

  it('rejects an unparsable date', () => {
    expect(() => defineInformRegistry([message({ startsAt: 'soon' })])).toThrow(
      /invalid "startsAt"/i
    )
  })
})

describe('dismissalKey', () => {
  it('defaults the version to 1', () => {
    expect(dismissalKey({ id: 'alpha' })).toBe('alpha:1')
  })

  it('includes an explicit version', () => {
    expect(dismissalKey({ id: 'alpha', version: 3 })).toBe('alpha:3')
  })
})
