import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useMinWidth } from './use-min-width'

function setInnerWidth(width: number) {
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: width })
}

/**
 * jsdom has no native `matchMedia`, so the shared test setup stubs it with a
 * no-op `addEventListener`/`removeEventListener` — enough for hooks that read
 * `innerWidth` directly (this one included), but not enough to simulate a
 * live "change" here. This local stub actually stores the listener so a test
 * can fire it, without touching the shared setup other tests rely on.
 */
function stubMatchMediaWithWorkingListeners() {
  const listeners = new Set<() => void>()
  const mql = {
    addEventListener: (_event: string, listener: () => void) => {
      listeners.add(listener)
    },
    matches: false,
    media: '',
    removeEventListener: (_event: string, listener: () => void) => {
      listeners.delete(listener)
    },
  }
  vi.spyOn(window, 'matchMedia').mockReturnValue(mql as unknown as MediaQueryList)
  return {
    fireChange: () => {
      for (const listener of listeners) {
        listener()
      }
    },
  }
}

const originalInnerWidth = window.innerWidth

afterEach(() => {
  setInnerWidth(originalInnerWidth)
  vi.restoreAllMocks()
})

describe('useMinWidth', () => {
  it('reports true when the viewport is already at least as wide as the breakpoint', () => {
    setInnerWidth(1024)
    const { result } = renderHook(() => useMinWidth(640))
    expect(result.current).toBe(true)
  })

  it('reports false when the viewport starts narrower than the breakpoint', () => {
    setInnerWidth(375)
    const { result } = renderHook(() => useMinWidth(640))
    expect(result.current).toBe(false)
  })

  it('updates live when the viewport crosses the breakpoint', () => {
    setInnerWidth(1024)
    const { fireChange } = stubMatchMediaWithWorkingListeners()
    const { result } = renderHook(() => useMinWidth(640))
    expect(result.current).toBe(true)

    act(() => {
      setInnerWidth(375)
      fireChange()
    })

    expect(result.current).toBe(false)
  })
})
