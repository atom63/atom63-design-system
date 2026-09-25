import { describe, expect, it } from 'vitest'

import { resolveInform } from './arbiter'
import type { DismissalRecord } from './persistence'
import { defineInformRegistry } from './registry'
import { INFORM_FLYOUT_STACK_LIMIT } from './types'
import type { InformContext, InformMessage } from './types'

const ctx: InformContext = {
  pathname: '/',
  locale: 'en',
  now: new Date('2026-06-01T00:00:00Z'),
}

function message(overrides: Partial<InformMessage> & { id: string }): InformMessage {
  return {
    surface: 'banner',
    severity: 'info',
    priority: 0,
    dismiss: 'persistent',
    content: { body: 'Body' },
    ...overrides,
  }
}

function resolve(
  messages: InformMessage[],
  dismissals: DismissalRecord = {},
  anchors = true
): ReturnType<typeof resolveInform> {
  return resolveInform({
    registry: defineInformRegistry(messages),
    ctx,
    dismissals,
    isAnchorAvailable: () => anchors,
  })
}

describe('resolveInform', () => {
  it('resolves nothing for an empty registry', () => {
    expect(resolve([])).toEqual({
      banner: null,
      dialog: null,
      'corner-flyout': [],
      spotlight: null,
    })
  })

  it('picks the highest priority message per surface', () => {
    const result = resolve([
      message({ id: 'low', priority: 1 }),
      message({ id: 'high', priority: 9 }),
    ])

    expect(result.banner?.id).toBe('high')
  })

  it('breaks priority ties by declaration order', () => {
    const result = resolve([
      message({ id: 'first', priority: 5 }),
      message({ id: 'second', priority: 5 }),
    ])

    expect(result.banner?.id).toBe('first')
  })

  it('skips a dismissed message and falls through to the next', () => {
    const result = resolve(
      [message({ id: 'high', priority: 9 }), message({ id: 'low', priority: 1 })],
      { 'high:1': 1 }
    )

    expect(result.banner?.id).toBe('low')
  })

  it('ignores a dismissal recorded against a different version', () => {
    const result = resolve([message({ id: 'high', priority: 9, version: 2 })], { 'high:1': 1 })

    expect(result.banner?.id).toBe('high')
  })

  it('skips a message whose window has not opened', () => {
    expect(resolve([message({ id: 'future', startsAt: '2026-07-01T00:00:00Z' })]).banner).toBeNull()
  })

  it('skips a message whose window has closed', () => {
    expect(resolve([message({ id: 'past', endsAt: '2026-05-01T00:00:00Z' })]).banner).toBeNull()
  })

  it('keeps a message inside its window', () => {
    const result = resolve([
      message({ id: 'live', startsAt: '2026-05-01T00:00:00Z', endsAt: '2026-07-01T00:00:00Z' }),
    ])

    expect(result.banner?.id).toBe('live')
  })

  it('skips a message whose predicate is false', () => {
    expect(
      resolve([message({ id: 'other-route', when: c => c.pathname === '/work' })]).banner
    ).toBeNull()
  })

  it('keeps a message whose predicate is true', () => {
    expect(resolve([message({ id: 'home', when: c => c.pathname === '/' })]).banner?.id).toBe(
      'home'
    )
  })

  it('prefers the dialog over the spotlight when both qualify', () => {
    const result = resolve([
      message({ id: 'tour', surface: 'spotlight', anchor: '#target', priority: 99 }),
      message({ id: 'notice', surface: 'dialog', priority: 1 }),
    ])

    expect(result.dialog?.id).toBe('notice')
    expect(result.spotlight).toBeNull()
  })

  it('resolves the spotlight when no dialog qualifies', () => {
    const result = resolve([message({ id: 'tour', surface: 'spotlight', anchor: '#target' })])

    expect(result.spotlight?.id).toBe('tour')
  })

  it('skips a spotlight whose anchor is absent', () => {
    const result = resolve(
      [message({ id: 'tour', surface: 'spotlight', anchor: '#missing' })],
      {},
      false
    )

    expect(result.spotlight).toBeNull()
  })

  it('suppresses the flyout while a blocking surface is resolved', () => {
    const result = resolve([
      message({ id: 'notice', surface: 'dialog' }),
      message({ id: 'tip', surface: 'corner-flyout' }),
    ])

    expect(result.dialog?.id).toBe('notice')
    expect(result['corner-flyout']).toEqual([])
  })

  it('restores the flyout once the blocking message is dismissed', () => {
    const result = resolve(
      [
        message({ id: 'notice', surface: 'dialog' }),
        message({ id: 'tip', surface: 'corner-flyout' }),
      ],
      { 'notice:1': 1 }
    )

    expect(result.dialog).toBeNull()
    expect(result['corner-flyout'].map(m => m.id)).toEqual(['tip'])
  })

  it('suppresses the flyout while a spotlight is resolved', () => {
    const result = resolve([
      message({ id: 'tour', surface: 'spotlight', anchor: '#target' }),
      message({ id: 'tip', surface: 'corner-flyout' }),
    ])

    expect(result.spotlight?.id).toBe('tour')
    expect(result['corner-flyout']).toEqual([])
  })

  /*
   * Flyouts stack, but only to a bounded depth: a persistent card has no timer
   * to drain it, so an unbounded stack would only ever grow.
   */
  it('stacks flyouts in priority order', () => {
    const result = resolve([
      message({ id: 'low', surface: 'corner-flyout', priority: 1 }),
      message({ id: 'high', surface: 'corner-flyout', priority: 9 }),
      message({ id: 'mid', surface: 'corner-flyout', priority: 5 }),
    ])

    expect(result['corner-flyout'].map(m => m.id)).toEqual(['high', 'mid', 'low'])
  })

  it('caps the stack at the limit and queues the rest', () => {
    const messages = Array.from({ length: 5 }, (_, index) =>
      message({ id: `m${index}`, surface: 'corner-flyout', priority: 10 - index })
    )

    const visible = resolve(messages)['corner-flyout']
    expect(visible).toHaveLength(INFORM_FLYOUT_STACK_LIMIT)
    expect(visible.map(m => m.id)).toEqual(['m0', 'm1', 'm2'])
  })

  it('promotes a queued flyout when a visible one is dismissed', () => {
    const messages = Array.from({ length: 4 }, (_, index) =>
      message({ id: `m${index}`, surface: 'corner-flyout', priority: 10 - index })
    )

    const after = resolve(messages, { 'm0:1': 1 })['corner-flyout']
    expect(after.map(m => m.id)).toEqual(['m1', 'm2', 'm3'])
  })

  it('returns an empty stack when nothing qualifies', () => {
    expect(resolve([])['corner-flyout']).toEqual([])
  })

  it('keeps the banner alongside a blocking surface', () => {
    const result = resolve([
      message({ id: 'notice', surface: 'dialog' }),
      message({ id: 'standing', surface: 'banner' }),
    ])

    expect(result.dialog?.id).toBe('notice')
    expect(result.banner?.id).toBe('standing')
  })
})
