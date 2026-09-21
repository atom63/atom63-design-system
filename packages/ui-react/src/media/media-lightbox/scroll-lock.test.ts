import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { holdBodyScrollThroughMomentum, lockBodyScroll } from './scroll-lock'

const overflow = () => document.body.style.overflow

/**
 * Fake timers throughout.
 *
 * These were written against the real clock, sleeping 700ms for a release that
 * fires at 600ms. That 100ms of margin survives a quiet machine and little
 * else: under a full monorepo run the timer slipped and the suite failed. A
 * lock whose whole job is to outlive its caller has to be tested on a clock the
 * test controls.
 */
beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  // The hold outlives its caller by design; run it out before the next test.
  vi.advanceTimersByTime(5_000)
  vi.useRealTimers()
  document.body.style.overflow = ''
})

describe('lockBodyScroll', () => {
  it('locks while held and restores what it found', () => {
    document.body.style.overflow = 'auto'

    const release = lockBodyScroll()
    expect(overflow()).toBe('hidden')

    release()
    expect(overflow()).toBe('auto')
  })

  it('counts holders, so one closing gallery cannot unlock another', () => {
    const first = lockBodyScroll()
    const second = lockBodyScroll()

    first()
    expect(overflow()).toBe('hidden')

    second()
    expect(overflow()).toBe('')
  })

  it('ignores a release called twice', () => {
    const outer = lockBodyScroll()
    const inner = lockBodyScroll()

    inner()
    inner()
    expect(overflow()).toBe('hidden')

    outer()
    expect(overflow()).toBe('')
  })
})

describe('holdBodyScrollThroughMomentum', () => {
  /**
   * The whole point: a trackpad is still coasting when the overlay unmounts,
   * and the page it uncovers must not scroll under that coast.
   */
  it('keeps the page locked after its holder has let go', () => {
    const release = lockBodyScroll()

    holdBodyScrollThroughMomentum()
    release()

    expect(overflow()).toBe('hidden')

    vi.advanceTimersByTime(700)
    expect(overflow()).toBe('')
  })

  it('stays held for as long as the wheel keeps talking', () => {
    const release = lockBodyScroll()
    holdBodyScrollThroughMomentum()
    release()

    // Well inside the 600ms quiet window, and the four of them together stay
    // inside the 1500ms cap the next test covers.
    for (let i = 0; i < 4; i += 1) {
      vi.advanceTimersByTime(200)
      window.dispatchEvent(new WheelEvent('wheel', { bubbles: true, deltaY: -10 }))
      expect(overflow()).toBe('hidden')
    }

    vi.advanceTimersByTime(700)
    expect(overflow()).toBe('')
  })

  it('gives up on a coast that never ends', () => {
    const release = lockBodyScroll()
    holdBodyScrollThroughMomentum()
    release()

    // A wheel that keeps talking forever must not lock the page out for good.
    for (let i = 0; i < 40; i += 1) {
      vi.advanceTimersByTime(100)
      window.dispatchEvent(new WheelEvent('wheel', { bubbles: true, deltaY: -1 }))
    }

    expect(overflow()).toBe('')
  })

  it('does not unlock a gallery that is still open', () => {
    const release = lockBodyScroll()
    holdBodyScrollThroughMomentum()

    vi.advanceTimersByTime(700)
    // The hold expired, but the lightbox never went away.
    expect(overflow()).toBe('hidden')

    release()
    expect(overflow()).toBe('')
  })
})
