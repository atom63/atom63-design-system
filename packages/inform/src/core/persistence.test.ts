import { beforeEach, describe, expect, it } from 'vitest'

import {
  INFORM_DISMISSAL_STORAGE_KEY,
  createMemoryDismissalStore,
  createWebDismissalStore,
} from './persistence'

describe('createMemoryDismissalStore', () => {
  it('round-trips a written key', () => {
    const store = createMemoryDismissalStore()
    store.write('alpha:1', 'persistent', 1000)

    expect(store.read()).toEqual({ 'alpha:1': 1000 })
  })

  it('starts from a seed', () => {
    expect(createMemoryDismissalStore({ 'beta:2': 5 }).read()).toEqual({ 'beta:2': 5 })
  })

  it('ignores a write in "none" mode', () => {
    const store = createMemoryDismissalStore()
    store.write('alpha:1', 'none', 1000)

    expect(store.read()).toEqual({})
  })

  it('clears a single key, then everything', () => {
    const store = createMemoryDismissalStore({ 'alpha:1': 1, 'beta:1': 2 })
    store.clear('alpha:1')
    expect(store.read()).toEqual({ 'beta:1': 2 })

    store.clear()
    expect(store.read()).toEqual({})
  })
})

/**
 * A minimal in-memory Storage stand-in. The runtime under test only needs
 * getItem/setItem, and building it explicitly keeps the suite independent of
 * whether jsdom or Node supplies the ambient storage globals.
 */
function createFakeStorage(): Storage {
  const entries = new Map<string, string>()

  return {
    get length() {
      return entries.size
    },
    clear: () => entries.clear(),
    getItem: (key: string) => entries.get(key) ?? null,
    key: (index: number) => [...entries.keys()][index] ?? null,
    removeItem: (key: string) => {
      entries.delete(key)
    },
    setItem: (key: string, value: string) => {
      entries.set(key, value)
    },
  }
}

describe('createWebDismissalStore', () => {
  let localStorage: Storage
  let sessionStorage: Storage

  beforeEach(() => {
    localStorage = createFakeStorage()
    sessionStorage = createFakeStorage()
  })

  it('writes persistent dismissals to localStorage only', () => {
    const store = createWebDismissalStore({ localStorage, sessionStorage })
    store.write('alpha:1', 'persistent', 1000)

    expect(localStorage.getItem(INFORM_DISMISSAL_STORAGE_KEY)).toContain('alpha:1')
    expect(sessionStorage.getItem(INFORM_DISMISSAL_STORAGE_KEY)).toBeNull()
  })

  it('writes session dismissals to sessionStorage only', () => {
    const store = createWebDismissalStore({ localStorage, sessionStorage })
    store.write('beta:1', 'session', 2000)

    expect(sessionStorage.getItem(INFORM_DISMISSAL_STORAGE_KEY)).toContain('beta:1')
    expect(localStorage.getItem(INFORM_DISMISSAL_STORAGE_KEY)).toBeNull()
  })

  it('ignores a write in "none" mode', () => {
    const store = createWebDismissalStore({ localStorage, sessionStorage })
    store.write('gamma:1', 'none', 3000)

    expect(store.read()).toEqual({})
  })

  it('merges both storages on read', () => {
    const store = createWebDismissalStore({ localStorage, sessionStorage })
    store.write('alpha:1', 'persistent', 1000)
    store.write('beta:1', 'session', 2000)

    expect(store.read()).toEqual({ 'alpha:1': 1000, 'beta:1': 2000 })
  })

  it('treats corrupt storage as empty rather than throwing', () => {
    localStorage.setItem(INFORM_DISMISSAL_STORAGE_KEY, '{ not json')

    expect(createWebDismissalStore({ localStorage, sessionStorage }).read()).toEqual({})
  })

  it('does not resurface a dismissal after a version bump', () => {
    const store = createWebDismissalStore({ localStorage, sessionStorage })
    store.write('alpha:1', 'persistent', 1000)

    expect(store.read()['alpha:2']).toBeUndefined()
  })

  it('clears a single key across both storages', () => {
    const store = createWebDismissalStore({ localStorage, sessionStorage })
    store.write('alpha:1', 'persistent', 1000)
    store.write('beta:1', 'session', 2000)

    store.clear('alpha:1')

    expect(store.read()).toEqual({ 'beta:1': 2000 })
  })
})
