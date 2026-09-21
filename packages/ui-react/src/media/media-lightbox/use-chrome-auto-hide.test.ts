import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useChromeAutoHide } from './use-chrome-auto-hide'

afterEach(() => {
  vi.useRealTimers()
})

describe('useChromeAutoHide', () => {
  it('is visible the moment it opens', () => {
    const { result } = renderHook(() => useChromeAutoHide(true))
    expect(result.current.visible).toBe(true)
  })

  it('hides after 2.5s of no activity', () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useChromeAutoHide(true))

    expect(result.current.visible).toBe(true)
    act(() => {
      vi.advanceTimersByTime(2500)
    })
    expect(result.current.visible).toBe(false)
  })

  it('does not hide before the idle window elapses', () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useChromeAutoHide(true))

    act(() => {
      vi.advanceTimersByTime(2400)
    })
    expect(result.current.visible).toBe(true)
  })

  it('reveals and restarts the idle clock on reveal()', () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useChromeAutoHide(true))

    act(() => {
      vi.advanceTimersByTime(2000)
      result.current.reveal()
      vi.advanceTimersByTime(2000)
    })
    // 4s have passed in total, but the idle clock was restarted at 2s, so
    // only 2s have elapsed since the last activity.
    expect(result.current.visible).toBe(true)

    act(() => {
      vi.advanceTimersByTime(500)
    })
    expect(result.current.visible).toBe(false)
  })

  it('never hides while focus holds it up', () => {
    // The hook itself is agnostic about *which* focus events count as
    // "inside the chrome" — that gating (`isInternalFocusMove`) lives in the
    // preset, in `media-lightbox.tsx`, and is covered by
    // `media-lightbox-chrome-auto-hide.test.tsx`. This only pins the hold
    // mechanism: whatever calls `holdFocus`, the chrome stays up until
    // `releaseFocus`.
    vi.useFakeTimers()
    const { result } = renderHook(() => useChromeAutoHide(true))

    act(() => {
      result.current.holdFocus()
      vi.advanceTimersByTime(5000)
    })
    expect(result.current.visible).toBe(true)

    act(() => {
      result.current.releaseFocus()
    })
    expect(result.current.visible).toBe(true)
    act(() => {
      vi.advanceTimersByTime(2500)
    })
    expect(result.current.visible).toBe(false)
  })

  it('never hides while the pointer is over the dock', () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useChromeAutoHide(true))

    act(() => {
      result.current.holdHover()
      vi.advanceTimersByTime(5000)
    })
    expect(result.current.visible).toBe(true)

    act(() => {
      result.current.releaseHover()
      vi.advanceTimersByTime(2500)
    })
    expect(result.current.visible).toBe(false)
  })

  it('never hides while a drag started in the dock is still in progress, even once released outside it', () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useChromeAutoHide(true))

    act(() => {
      result.current.holdDrag()
      vi.advanceTimersByTime(5000)
    })
    expect(result.current.visible).toBe(true)

    // The drag ends anywhere in the document — not necessarily back inside
    // the dock — so the release has to be a global pointerup/pointercancel,
    // not the dock's own `pointerleave`.
    act(() => {
      document.dispatchEvent(new Event('pointerup'))
      vi.advanceTimersByTime(2500)
    })
    expect(result.current.visible).toBe(false)
  })

  it('resets to visible and re-arms the idle clock each time it opens again', () => {
    vi.useFakeTimers()
    const { result, rerender } = renderHook(({ open }) => useChromeAutoHide(open), {
      initialProps: { open: true },
    })

    act(() => {
      vi.advanceTimersByTime(2500)
    })
    expect(result.current.visible).toBe(false)

    rerender({ open: false })
    rerender({ open: true })
    expect(result.current.visible).toBe(true)

    act(() => {
      vi.advanceTimersByTime(2500)
    })
    expect(result.current.visible).toBe(false)
  })
})
