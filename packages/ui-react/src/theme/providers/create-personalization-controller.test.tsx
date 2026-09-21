import { act, render, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Mock the canvas extraction (jsdom has no real canvas/Image decoding).
vi.mock('../core/auto-primary', async () => {
  const actual =
    await vi.importActual<typeof import('../core/auto-primary')>('../core/auto-primary')
  return {
    ...actual,
    extractDominantColor: vi.fn(async () => ({ hue: 200, saturation: 0.8 })),
  }
})

import { createPersonalizationController } from './create-personalization-controller'
import type { PersonalizationState } from '../core/types'

const DEFAULT_STATE: PersonalizationState = {
  mode: 'dark',
  theme: 'modern',
  brand: 'b1',
  surface: 'n1',
  surfaceTint: 0,
  typeScale: 'normal',
  radius: 'default',
  font: 'sans',
  os: 'macos',
  iconTheme: 'realistic',
  wallpaper: 'horizon',
}

const STORAGE_KEY = 'test-personalization'

// Node 25 exposes an experimental global `localStorage` that can fail to
// initialize (the `--localstorage-file` path warning) and then shadows jsdom's
// Storage with a stub whose methods are undefined. Install a deterministic
// in-memory Storage when the resident one is unusable.
function ensureLocalStorage() {
  if (typeof window.localStorage?.clear === 'function') {
    return
  }
  const store = new Map<string, string>()
  const stub: Storage = {
    get length() {
      return store.size
    },
    clear: () => store.clear(),
    getItem: (key: string) => (store.has(key) ? (store.get(key) as string) : null),
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    removeItem: (key: string) => {
      store.delete(key)
    },
    setItem: (key: string, value: string) => {
      store.set(key, String(value))
    },
  }
  Object.defineProperty(window, 'localStorage', { configurable: true, value: stub })
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: stub })
}

function resetRoot() {
  const el = document.documentElement
  el.removeAttribute('style')
  el.className = ''
  for (const a of Array.from(el.attributes)) {
    if (a.name.startsWith('data-a63-')) {
      el.removeAttribute(a.name)
    }
  }
}

describe('createPersonalizationController', () => {
  beforeEach(() => {
    ensureLocalStorage()
    localStorage.clear()
    resetRoot()
  })
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('applies state to the root on mount and persists it', async () => {
    const { PersonalizationProvider } = createPersonalizationController({
      storageKey: STORAGE_KEY,
      defaultState: DEFAULT_STATE,
    })
    render(<PersonalizationProvider>hi</PersonalizationProvider>)
    await waitFor(() => {
      expect(document.documentElement.getAttribute('data-a63-brand')).toBe('b1')
    })
    expect(document.documentElement.getAttribute('data-a63-mode')).toBe('dark')
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}').brand).toBe('b1')
  })

  it('setters update state, attributes, and storage', async () => {
    let controller: ReturnType<typeof usePersonalization> | undefined
    const { PersonalizationProvider, usePersonalization } = createPersonalizationController({
      storageKey: STORAGE_KEY,
      defaultState: DEFAULT_STATE,
    })
    function Probe() {
      controller = usePersonalization()
      return null
    }
    render(
      <PersonalizationProvider>
        <Probe />
      </PersonalizationProvider>
    )
    await act(async () => {
      controller?.setTheme('aqua')
    })
    await waitFor(() => {
      expect(document.documentElement.getAttribute('data-a63-theme')).toBe('aqua')
    })
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}').theme).toBe('aqua')
  })

  it('derives the --color-auto ramp when brand is auto, using the injected wallpaper src', async () => {
    const resolveWallpaperSrc = vi.fn(() => '/wallpaper/horizon-dark.webp')
    const { PersonalizationProvider } = createPersonalizationController({
      storageKey: STORAGE_KEY,
      defaultState: { ...DEFAULT_STATE, brand: 'auto' },
      resolveWallpaperSrc,
    })
    render(<PersonalizationProvider>hi</PersonalizationProvider>)
    await waitFor(() => {
      expect(document.documentElement.style.getPropertyValue('--color-auto-500')).not.toBe('')
    })
    expect(resolveWallpaperSrc).toHaveBeenCalled()
  })

  it('clears the --color-auto ramp when brand is not auto', async () => {
    const { PersonalizationProvider } = createPersonalizationController({
      storageKey: STORAGE_KEY,
      defaultState: { ...DEFAULT_STATE, brand: 'b3' },
    })
    document.documentElement.style.setProperty('--color-auto-500', 'rgb(1,2,3)')
    render(<PersonalizationProvider>hi</PersonalizationProvider>)
    await waitFor(() => {
      expect(document.documentElement.style.getPropertyValue('--color-auto-500')).toBe('')
    })
  })
})
