import { act, render, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createThemeProvider } from './create-theme-provider'

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })),
})

// Mock localStorage
const storage: Record<string, string> = {}
const localStorageMock = {
  getItem: vi.fn((key: string) => storage[key] ?? null),
  setItem: vi.fn((key: string, value: string) => {
    storage[key] = value
  }),
  removeItem: vi.fn((key: string) => {
    delete storage[key]
  }),
  clear: vi.fn(() => {
    for (const k in storage) delete storage[k]
  }),
  get length() {
    return Object.keys(storage).length
  },
  key: vi.fn((_i: number) => null),
}
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

describe('createThemeProvider', () => {
  beforeEach(() => {
    for (const k in storage) delete storage[k]
    vi.clearAllMocks()
    document.documentElement.className = ''
  })

  it('returns ThemeProvider and useTheme', () => {
    const result = createThemeProvider({
      storageKey: 'test',
      defaultTheme: 'dark',
      modes: ['light', 'dark'],
    })
    expect(result).toHaveProperty('ThemeProvider')
    expect(result).toHaveProperty('useTheme')
    expect(typeof result.ThemeProvider).toBe('function')
    expect(typeof result.useTheme).toBe('function')
  })

  it('useTheme throws when used outside ThemeProvider', () => {
    const { useTheme } = createThemeProvider({
      storageKey: 'test',
      defaultTheme: 'dark',
      modes: ['light', 'dark'],
    })
    expect(() => renderHook(() => useTheme())).toThrow('useTheme must be used within ThemeProvider')
  })

  it('ThemeProvider renders children', () => {
    const { ThemeProvider } = createThemeProvider({
      storageKey: 'test',
      defaultTheme: 'dark',
      modes: ['light', 'dark'],
    })
    const { getByText } = render(
      <ThemeProvider>
        <div>hello</div>
      </ThemeProvider>
    )
    expect(getByText('hello')).toBeInTheDocument()
  })

  it('initial theme defaults to options.defaultTheme', () => {
    const { ThemeProvider, useTheme } = createThemeProvider({
      storageKey: 'test',
      defaultTheme: 'light',
      modes: ['light', 'dark'],
    })
    const wrapper = ({ children }: { children: ReactNode }) => (
      <ThemeProvider>{children}</ThemeProvider>
    )
    const { result } = renderHook(() => useTheme(), { wrapper })
    expect(result.current.theme).toBe('light')
  })

  it('setTheme changes the theme', () => {
    const { ThemeProvider, useTheme } = createThemeProvider({
      storageKey: 'test',
      defaultTheme: 'light',
      modes: ['light', 'dark'],
    })
    const wrapper = ({ children }: { children: ReactNode }) => (
      <ThemeProvider>{children}</ThemeProvider>
    )
    const { result } = renderHook(() => useTheme(), { wrapper })

    act(() => {
      result.current.setTheme('dark')
    })
    expect(result.current.theme).toBe('dark')
  })

  it('toggleTheme flips light to dark', () => {
    const { ThemeProvider, useTheme } = createThemeProvider({
      storageKey: 'test',
      defaultTheme: 'light',
      modes: ['light', 'dark'],
    })
    const wrapper = ({ children }: { children: ReactNode }) => (
      <ThemeProvider>{children}</ThemeProvider>
    )
    const { result } = renderHook(() => useTheme(), { wrapper })

    act(() => {
      result.current.toggleTheme()
    })
    expect(result.current.theme).toBe('dark')
  })

  it('toggleTheme flips dark to light', () => {
    const { ThemeProvider, useTheme } = createThemeProvider({
      storageKey: 'test',
      defaultTheme: 'dark',
      modes: ['light', 'dark'],
    })
    const wrapper = ({ children }: { children: ReactNode }) => (
      <ThemeProvider>{children}</ThemeProvider>
    )
    const { result } = renderHook(() => useTheme(), { wrapper })

    act(() => {
      result.current.toggleTheme()
    })
    expect(result.current.theme).toBe('light')
  })

  it('isDark/isLight reflect current theme', () => {
    const { ThemeProvider, useTheme } = createThemeProvider({
      storageKey: 'test',
      defaultTheme: 'dark',
      modes: ['light', 'dark'],
    })
    const wrapper = ({ children }: { children: ReactNode }) => (
      <ThemeProvider>{children}</ThemeProvider>
    )
    const { result } = renderHook(() => useTheme(), { wrapper })

    expect(result.current.isDark).toBe(true)
    expect(result.current.isLight).toBe(false)

    act(() => {
      result.current.setTheme('light')
    })
    expect(result.current.isDark).toBe(false)
    expect(result.current.isLight).toBe(true)
  })

  it('localStorage is used for persistence', () => {
    const { ThemeProvider, useTheme } = createThemeProvider({
      storageKey: 'persist-test',
      defaultTheme: 'light',
      modes: ['light', 'dark'],
    })
    const wrapper = ({ children }: { children: ReactNode }) => (
      <ThemeProvider>{children}</ThemeProvider>
    )
    const { result } = renderHook(() => useTheme(), { wrapper })

    act(() => {
      result.current.setTheme('dark')
    })
    expect(localStorageMock.setItem).toHaveBeenCalledWith('persist-test', 'dark')
  })
})
