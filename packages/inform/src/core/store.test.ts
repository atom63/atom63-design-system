import { describe, expect, it, vi } from 'vitest'

import { createMemoryDismissalStore } from './persistence'
import { defineInformRegistry } from './registry'
import { createInformStore } from './store'
import type { InformContext } from './types'

const context: InformContext = {
  pathname: '/',
  locale: 'en',
  now: new Date('2026-06-01T00:00:00Z'),
}

const registry = defineInformRegistry([
  {
    id: 'notice',
    surface: 'banner',
    severity: 'info',
    priority: 0,
    dismiss: 'persistent',
    content: { body: 'Body' },
  },
  {
    id: 'work-only',
    surface: 'corner-flyout',
    severity: 'info',
    priority: 0,
    dismiss: 'session',
    content: { body: 'Work' },
    when: ctx => ctx.pathname === '/work',
  },
])

function setup(): ReturnType<typeof createInformStore> {
  return createInformStore({
    registry,
    context,
    dismissals: createMemoryDismissalStore(),
    now: () => 1000,
  })
}

describe('createInformStore', () => {
  it('resolves nothing before hydration', () => {
    const store = setup()

    expect(store.isReady()).toBe(false)
    expect(store.getSnapshot().banner).toBeNull()
  })

  it('returns a referentially stable snapshot between changes', () => {
    const store = setup()
    store.hydrate()

    expect(store.getSnapshot()).toBe(store.getSnapshot())
  })

  it('resolves after hydration', () => {
    const store = setup()
    store.hydrate()

    expect(store.isReady()).toBe(true)
    expect(store.getSnapshot().banner?.id).toBe('notice')
  })

  it('notifies subscribers on hydrate', () => {
    const store = setup()
    const listener = vi.fn()
    store.subscribe(listener)

    store.hydrate()

    expect(listener).toHaveBeenCalled()
  })

  it('stops notifying after unsubscribe', () => {
    const store = setup()
    const listener = vi.fn()
    const unsubscribe = store.subscribe(listener)
    unsubscribe()

    store.hydrate()

    expect(listener).not.toHaveBeenCalled()
  })

  it('clears a message once dismissed', () => {
    const store = setup()
    store.hydrate()

    store.dismiss('notice')

    expect(store.getSnapshot().banner).toBeNull()
  })

  it('ignores a dismiss for an unknown id', () => {
    const store = setup()
    store.hydrate()

    store.dismiss('nope')

    expect(store.getSnapshot().banner?.id).toBe('notice')
  })

  it('re-resolves when the context changes', () => {
    const store = setup()
    store.hydrate()
    expect(store.getSnapshot()['corner-flyout']).toEqual([])

    store.setContext({ ...context, pathname: '/work' })

    expect(store.getSnapshot()['corner-flyout'].map(m => m.id)).toEqual(['work-only'])
  })

  it('honors dismissals that were already persisted before hydration', () => {
    const store = createInformStore({
      registry,
      context,
      dismissals: createMemoryDismissalStore({ 'notice:1': 1 }),
      now: () => 1000,
    })
    store.hydrate()

    expect(store.getSnapshot().banner).toBeNull()
  })

  it('persists a dismissal through the injected store', () => {
    const dismissals = createMemoryDismissalStore()
    const store = createInformStore({ registry, context, dismissals, now: () => 4242 })
    store.hydrate()

    store.dismiss('notice')

    expect(dismissals.read()).toEqual({ 'notice:1': 4242 })
  })
})
