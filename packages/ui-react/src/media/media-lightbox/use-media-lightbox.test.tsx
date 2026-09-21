import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useMediaLightbox } from './use-media-lightbox'

// jsdom has no View Transitions API at all, so the property has to be defined
// rather than spied on, and removed again so the FLIP branch stays testable.
function stubViewTransitions() {
  Object.defineProperty(document, 'startViewTransition', {
    configurable: true,
    value: (update: () => void) => {
      update()
      return { finished: Promise.resolve() }
    },
    writable: true,
  })
}

afterEach(() => {
  Reflect.deleteProperty(document, 'startViewTransition')
  Reflect.deleteProperty(navigator, 'connection')
  vi.restoreAllMocks()
})

describe('useMediaLightbox', () => {
  it('starts closed at the first item', () => {
    const { result } = renderHook(() => useMediaLightbox(4))

    expect(result.current.isOpen).toBe(false)
    expect(result.current.index).toBe(0)
  })

  it('opens at the requested index', () => {
    const { result } = renderHook(() => useMediaLightbox(4))

    act(() => {
      result.current.openAt(2)
    })

    expect(result.current.isOpen).toBe(true)
    expect(result.current.index).toBe(2)
  })

  it('clamps the index to the item range', () => {
    const { result } = renderHook(() => useMediaLightbox(3))

    act(() => {
      result.current.setIndex(9)
    })
    expect(result.current.index).toBe(2)

    act(() => {
      result.current.setIndex(-4)
    })
    expect(result.current.index).toBe(0)
  })

  it('keeps the index when closing so the exit animation has a target', () => {
    const { result } = renderHook(() => useMediaLightbox(3))

    act(() => {
      result.current.openAt(1)
    })
    act(() => {
      result.current.close()
    })

    expect(result.current.isOpen).toBe(false)
    expect(result.current.index).toBe(1)
  })

  it('falls back to the measured FLIP when the browser has no view transitions', () => {
    const { result } = renderHook(() => useMediaLightbox(2))

    act(() => {
      result.current.openAt(0)
    })

    expect(result.current.transition).toBe('flip')
  })

  it('uses the measured FLIP even when the browser supports view transitions', () => {
    stubViewTransitions()
    const { result } = renderHook(() => useMediaLightbox(2))

    act(() => {
      result.current.openAt(0, document.createElement('div'))
    })

    expect(result.current.transition).toBe('flip')
    expect(result.current.isOpen).toBe(true)
  })

  it('morphs with a view transition when the caller opts in', () => {
    stubViewTransitions()
    const { result } = renderHook(() => useMediaLightbox(2, { morph: 'view-transition' }))

    act(() => {
      result.current.openAt(0, document.createElement('div'))
    })

    expect(result.current.transition).toBe('view-transition')
    expect(result.current.isOpen).toBe(true)
  })

  it('stays on the measured FLIP when the connection asks to save data', () => {
    stubViewTransitions()
    Object.defineProperty(navigator, 'connection', {
      configurable: true,
      value: { saveData: true },
    })
    const { result } = renderHook(() => useMediaLightbox(2, { morph: 'view-transition' }))

    act(() => {
      result.current.openAt(0, document.createElement('div'))
    })

    expect(result.current.transition).toBe('flip')
    expect(result.current.isOpen).toBe(true)
  })

  it('tags the document so close can fade the overlay instead of snapping it off', async () => {
    stubViewTransitions()
    const { result } = renderHook(() => useMediaLightbox(2, { morph: 'view-transition' }))
    const origin = document.createElement('div')

    act(() => {
      result.current.openAt(0, origin)
    })
    // Opening's `finished` must settle or close is refused as in-flight.
    await act(async () => {
      await Promise.resolve()
    })

    let classesDuringClose = ''
    Object.defineProperty(document, 'startViewTransition', {
      configurable: true,
      value: (update: () => void) => {
        classesDuringClose = document.documentElement.className
        update()
        return { finished: Promise.resolve() }
      },
      writable: true,
    })

    act(() => {
      result.current.close(origin)
    })

    expect(classesDuringClose).toContain('a63-media-lightbox-vt-out')
  })

  it('lets the caller retarget the morph when closing on a different item', () => {
    const { result } = renderHook(() => useMediaLightbox(3))
    const opened = document.createElement('div')
    const swipedTo = document.createElement('div')

    act(() => {
      result.current.openAt(0, opened)
    })
    act(() => {
      result.current.setIndex(2)
    })
    act(() => {
      result.current.close(swipedTo)
    })

    expect(result.current.origin).toBe(swipedTo)
  })

  it('remembers the element the zoom should start from', () => {
    const { result } = renderHook(() => useMediaLightbox(2))
    const trigger = document.createElement('button')

    act(() => {
      result.current.openAt(1, trigger)
    })

    expect(result.current.origin).toBe(trigger)
  })
})
