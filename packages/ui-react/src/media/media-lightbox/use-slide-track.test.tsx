import { act, render, screen } from '@testing-library/react'
import { useRef, useState } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { trackTransform } from './track-physics'
import { useSlideTrack } from './use-slide-track'
import {
  continuousTrace,
  doubleFastTrace,
  singleTrace,
  verticalTrace,
  type WheelTrace,
} from './wheel-traces.fixture'

// Motion's frameloop captures `requestAnimationFrame` when it is first
// imported. Installing the fake clock before any import, and keeping it for
// the whole file, is what lets these tests step a spring frame by frame.
vi.hoisted(() => {
  vi.useFakeTimers()
})

/** One slide plus the gap, in pixels, for every test here. */
const STEP = 1000

interface HarnessProps {
  count?: number
  direction?: 'ltr' | 'rtl'
  enabled?: boolean
  initialIndex?: number
  mountRadius?: number
  onIndexChange: (index: number) => void
  reducedMotion?: boolean
}

/** The hook wired to real state, the way `Lightbox.Slides` wires it. */
function Harness({
  count = 7,
  direction = 'ltr',
  enabled = true,
  initialIndex = 0,
  mountRadius = 1,
  onIndexChange,
  reducedMotion = false,
}: HarnessProps) {
  const [index, setIndex] = useState(initialIndex)
  const rootRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const stripRef = useRef<HTMLDivElement>(null)
  const { span } = useSlideTrack({
    enabled,
    goTo: next => {
      onIndexChange(next)
      setIndex(next)
    },
    index,
    itemCount: count,
    mountRadius,
    reducedMotion,
    rootRef,
    stripRef,
    trackRef,
  })
  return (
    <div data-testid="root" ref={rootRef}>
      <div data-testid="track" ref={trackRef} style={{ direction }}>
        <div data-testid="strip" ref={stripRef} style={{ transform: trackTransform(index) }}>
          <button data-testid="close-area" tabIndex={-1} type="button" />
        </div>
      </div>
      <output data-testid="index">{index}</output>
      <output data-testid="span">{span ? span.join('-') : ''}</output>
      <button data-testid="next" onClick={() => setIndex(value => value + 1)} type="button" />
      <button data-testid="end" onClick={() => setIndex(count - 1)} type="button" />
    </div>
  )
}

function mount(props: Partial<HarnessProps> = {}) {
  const onIndexChange = vi.fn()
  render(<Harness onIndexChange={onIndexChange} {...props} />)
  const strip = screen.getByTestId('strip')
  // jsdom has no layout; one slide unit is what the hook measures here.
  Object.defineProperty(strip, 'offsetWidth', { configurable: true, value: STEP })
  return { onIndexChange, strip, track: screen.getByTestId('track') }
}

/** The position the strip is drawn at, in slides. */
function drawn(strip: HTMLElement): number {
  const match = /calc\((-?[\d.]+) \*/.exec(strip.style.transform)
  if (!match) {
    throw new Error(`unexpected transform: ${strip.style.transform}`)
  }
  return -Number(match[1]) || 0
}

function currentIndex(): number {
  return Number(screen.getByTestId('index').textContent)
}

interface Sample {
  x: number
  y?: number
  t: number
}

let pointerId = 0

function pointer(type: string, target: EventTarget, { t, x, y = 300 }: Sample, id: number) {
  const event = new PointerEvent(type, {
    bubbles: true,
    button: 0,
    cancelable: true,
    clientX: x,
    clientY: y,
    pointerId: id,
    pointerType: 'touch',
  })
  // `timeStamp` is read-only on Event; the velocity tracker reads it.
  Object.defineProperty(event, 'timeStamp', { value: t })
  act(() => {
    target.dispatchEvent(event)
  })
}

/** Presses on the close area, moves through `moves`, and optionally lets go at the last one. */
function drag(track: HTMLElement, start: Sample, moves: readonly Sample[], { up = true } = {}) {
  pointerId += 1
  const id = pointerId
  const area = track.querySelector('[data-testid="close-area"]') ?? track
  pointer('pointerdown', area, start, id)
  for (const move of moves) {
    pointer('pointermove', window, move, id)
  }
  const last = moves.at(-1)
  if (up && last) {
    pointer('pointerup', window, last, id)
  }
  return id
}

/**
 * Runs the springs out. Async because a finished animation reports through a
 * promise, and the synchronous clock never drains the microtasks it queues.
 */
async function settle() {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(2000)
  })
}

// Let any settle finish so the next test starts from a quiet frameloop.
afterEach(settle)

describe('useSlideTrack pointer drag', () => {
  it('follows the pointer 1:1 once the drag locks horizontal', async () => {
    const { strip, track } = mount({ initialIndex: 2 })

    drag(
      track,
      { t: 0, x: 600 },
      [
        { t: 16, x: 590 },
        { t: 32, x: 550 },
        { t: 48, x: 473 },
      ],
      { up: false }
    )

    // 127px to the left of where it started is 0.127 of a slide onward.
    expect(drawn(strip)).toBeCloseTo(2.127, 5)
    expect(strip.style.willChange).toBe('transform')
    expect(screen.getByTestId('root')).toHaveAttribute('data-paging')
  })

  it('does not move until the pointer has left the dead zone', async () => {
    const { strip, track } = mount({ initialIndex: 2 })

    drag(track, { t: 0, x: 600 }, [{ t: 16, x: 594 }], { up: false })

    expect(drawn(strip)).toBe(2)
    expect(strip.style.willChange).toBe('')
  })

  it('leaves a mostly vertical drag to pull-to-dismiss', async () => {
    const { onIndexChange, strip, track } = mount({ initialIndex: 2 })

    drag(track, { t: 0, x: 600, y: 300 }, [
      { t: 100, x: 590, y: 400 },
      { t: 200, x: 560, y: 600 },
    ])

    expect(drawn(strip)).toBe(2)
    expect(onIndexChange).not.toHaveBeenCalled()
  })

  it('pages once a slow drag covers the distance threshold, and springs onto the slide', async () => {
    const { onIndexChange, strip, track } = mount({ initialIndex: 2 })

    // 150px at a crawl: past the 120px threshold, far below flick speed.
    drag(track, { t: 0, x: 600 }, [
      { t: 400, x: 520 },
      { t: 800, x: 450 },
      { t: 1200, x: 450 },
    ])

    expect(onIndexChange).toHaveBeenCalledWith(3)
    // Released where the hand let go; the spring carries it the rest of the way.
    expect(drawn(strip)).toBeCloseTo(2.15, 2)
    await settle()
    expect(drawn(strip)).toBe(3)
    expect(strip.style.willChange).toBe('')
    expect(screen.getByTestId('root')).not.toHaveAttribute('data-paging')
  })

  it('springs back below the distance threshold', async () => {
    const { onIndexChange, strip, track } = mount({ initialIndex: 2 })

    drag(track, { t: 0, x: 600 }, [
      { t: 400, x: 560 },
      { t: 800, x: 500 },
      { t: 1200, x: 500 },
    ])

    expect(onIndexChange).not.toHaveBeenCalled()
    expect(drawn(strip)).toBeCloseTo(2.1, 2)
    await settle()
    expect(drawn(strip)).toBe(2)
  })

  it('pages on a fast flick that never covers the distance threshold', async () => {
    const { onIndexChange, track } = mount({ initialIndex: 2 })

    // 60px in 32ms: under the threshold, but ~1.9px/ms as it lets go.
    drag(track, { t: 0, x: 600 }, [
      { t: 16, x: 570 },
      { t: 32, x: 540 },
    ])

    expect(onIndexChange).toHaveBeenCalledWith(3)
  })

  it('catches a flick that reverses before it lets go', async () => {
    const { onIndexChange, strip, track } = mount({ initialIndex: 2 })

    // 300px onward, then flung back the other way.
    drag(track, { t: 0, x: 700 }, [
      { t: 300, x: 550 },
      { t: 600, x: 400 },
      { t: 616, x: 430 },
      { t: 632, x: 460 },
    ])

    expect(onIndexChange).not.toHaveBeenCalled()
    await settle()
    expect(drawn(strip)).toBe(2)
  })

  it('catches the strip mid-settle and drags it on from where it is', async () => {
    const { strip, track } = mount({ initialIndex: 2 })

    drag(track, { t: 0, x: 600 }, [
      { t: 16, x: 570 },
      { t: 32, x: 540 },
    ])
    act(() => {
      vi.advanceTimersByTime(80)
    })
    const caughtAt = drawn(strip)
    expect(caughtAt).toBeGreaterThan(2.06)
    expect(caughtAt).toBeLessThan(3)

    drag(track, { t: 1000, x: 600 }, [{ t: 1016, x: 580 }], { up: false })
    act(() => {
      vi.advanceTimersByTime(500)
    })
    // Held under the finger, not pulled on by the settle it interrupted.
    expect(drawn(strip)).toBeCloseTo(caughtAt + 0.02, 5)
  })

  it('resists past the first slide and springs back', async () => {
    const { onIndexChange, strip, track } = mount({ initialIndex: 0 })

    // 400px backwards from the first slide.
    drag(track, { t: 0, x: 200 }, [
      { t: 400, x: 400 },
      { t: 800, x: 600 },
      { t: 1200, x: 600 },
    ])

    const pulled = drawn(strip)
    expect(pulled).toBeLessThan(0)
    // Resisted: far less than the 0.4 of a slide the pointer travelled.
    expect(pulled).toBeGreaterThan(-0.25)
    expect(onIndexChange).not.toHaveBeenCalled()
    await settle()
    expect(drawn(strip)).toBe(0)
  })

  it('resists past the last slide', async () => {
    const { onIndexChange, strip, track } = mount({ count: 3, initialIndex: 2 })

    drag(track, { t: 0, x: 800 }, [
      { t: 16, x: 700 },
      { t: 32, x: 500 },
    ])

    expect(drawn(strip)).toBeGreaterThan(2)
    expect(drawn(strip)).toBeLessThan(2.25)
    expect(onIndexChange).not.toHaveBeenCalled()
    await settle()
    expect(drawn(strip)).toBe(2)
  })

  it('mirrors in a right-to-left gallery', async () => {
    const { onIndexChange, strip, track } = mount({ direction: 'rtl', initialIndex: 2 })

    // The next slide sits to the left, so a drag to the right reveals it.
    drag(
      track,
      { t: 0, x: 400 },
      [
        { t: 400, x: 480 },
        { t: 800, x: 550 },
      ],
      { up: false }
    )
    expect(drawn(strip)).toBeCloseTo(2.15, 5)

    pointer('pointerup', window, { t: 1200, x: 550 }, pointerId)
    expect(onIndexChange).toHaveBeenCalledWith(3)
  })

  it('stands down while zoomed', async () => {
    const { onIndexChange, strip, track } = mount({ enabled: false, initialIndex: 2 })

    drag(track, { t: 0, x: 600 }, [
      { t: 16, x: 400 },
      { t: 32, x: 200 },
    ])

    expect(drawn(strip)).toBe(2)
    expect(onIndexChange).not.toHaveBeenCalled()
  })

  it('puts the strip back when a second finger turns the drag into a pinch', async () => {
    const { onIndexChange, strip, track } = mount({ initialIndex: 2 })

    const first = drag(track, { t: 0, x: 600 }, [{ t: 16, x: 500 }], { up: false })
    pointer('pointerdown', track, { t: 20, x: 300 }, first + 100)
    pointer('pointermove', window, { t: 30, x: 200 }, first)
    pointer('pointerup', window, { t: 40, x: 200 }, first)

    expect(onIndexChange).not.toHaveBeenCalled()
    await settle()
    expect(drawn(strip)).toBe(2)
  })

  it('swallows the click that follows a paging drag', async () => {
    const { track } = mount({ initialIndex: 2 })
    const onClick = vi.fn()
    const area = screen.getByTestId('close-area')
    area.addEventListener('click', onClick)

    drag(track, { t: 0, x: 600 }, [
      { t: 16, x: 570 },
      { t: 32, x: 540 },
    ])
    area.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

    expect(onClick).not.toHaveBeenCalled()
  })

  it('force-mounts the neighbours a drag can reveal when the preload does not', async () => {
    const { track } = mount({ initialIndex: 2, mountRadius: 0 })

    drag(track, { t: 0, x: 600 }, [{ t: 16, x: 570 }], { up: false })

    expect(screen.getByTestId('span')).toHaveTextContent('1-3')
  })
})

describe('useSlideTrack index changes', () => {
  it('animates a step to the next slide from where the strip is drawn', async () => {
    const { strip } = mount({ initialIndex: 2 })

    act(() => {
      screen.getByTestId('next').click()
    })

    // Committed at 3, drawn at 2 until the spring moves it.
    expect(currentIndex()).toBe(3)
    expect(drawn(strip)).toBe(2)
    expect(strip.style.willChange).toBe('transform')
    // Both slides stay mounted while it travels.
    expect(screen.getByTestId('span')).toHaveTextContent('2-3')

    act(() => {
      vi.advanceTimersByTime(100)
    })
    expect(drawn(strip)).toBeGreaterThan(2)
    expect(drawn(strip)).toBeLessThan(3)

    await settle()
    expect(drawn(strip)).toBe(3)
    expect(strip.style.willChange).toBe('')
    expect(screen.getByTestId('span')).toHaveTextContent('')
  })

  it('cuts a jump of more than one slide', async () => {
    const { strip } = mount({ initialIndex: 1 })

    act(() => {
      screen.getByTestId('end').click()
    })

    expect(drawn(strip)).toBe(6)
    expect(strip.style.willChange).toBe('')
    expect(screen.getByTestId('span')).toHaveTextContent('')
  })
})

describe('useSlideTrack under prefers-reduced-motion', () => {
  it('lands a step instantly', async () => {
    const { strip } = mount({ initialIndex: 2, reducedMotion: true })

    act(() => {
      screen.getByTestId('next').click()
    })

    expect(drawn(strip)).toBe(3)
    expect(strip.style.willChange).toBe('')
  })

  it('still tracks a drag, and lands its release instantly', async () => {
    const { onIndexChange, strip, track } = mount({ initialIndex: 2, reducedMotion: true })

    drag(
      track,
      { t: 0, x: 600 },
      [
        { t: 400, x: 520 },
        { t: 800, x: 450 },
      ],
      { up: false }
    )
    expect(drawn(strip)).toBeCloseTo(2.15, 5)

    pointer('pointerup', window, { t: 1200, x: 450 }, pointerId)
    expect(onIndexChange).toHaveBeenCalledWith(3)
    expect(drawn(strip)).toBe(3)
  })
})

interface WheelSample {
  deltaX: number
  deltaY: number
}

function wheel(track: HTMLElement, samples: readonly WheelSample[]) {
  act(() => {
    for (const sample of samples) {
      track.dispatchEvent(
        new WheelEvent('wheel', {
          bubbles: true,
          cancelable: true,
          deltaX: sample.deltaX,
          deltaY: sample.deltaY,
        })
      )
    }
  })
}

/** A steady horizontal swipe with no momentum, 8 × 20px. */
function drivenSwipe(sign: 1 | -1): WheelSample[] {
  return Array.from({ length: 8 }, () => ({ deltaX: sign * 20, deltaY: 0 }))
}

/** Past the quiet interval: a gesture with no momentum has ended. */
function flushQuiet() {
  act(() => {
    vi.advanceTimersByTime(200)
  })
}

describe('useSlideTrack trackpad wheel', () => {
  it('follows a two-finger swipe 1:1', async () => {
    const { strip, track } = mount({ initialIndex: 2 })

    wheel(track, drivenSwipe(1).slice(0, 4))

    expect(drawn(strip)).toBeCloseTo(2.08, 5)
    expect(strip.style.willChange).toBe('transform')
  })

  it('settles one page for a swipe that ends without momentum', async () => {
    const { onIndexChange, strip, track } = mount({ initialIndex: 2 })

    wheel(track, drivenSwipe(1))
    flushQuiet()

    expect(onIndexChange).toHaveBeenCalledTimes(1)
    expect(onIndexChange).toHaveBeenCalledWith(3)
    await settle()
    expect(drawn(strip)).toBe(3)
  })

  it('springs back from a swipe too short to page', async () => {
    const { onIndexChange, strip, track } = mount({ initialIndex: 2 })

    wheel(track, drivenSwipe(1).slice(0, 3))
    flushQuiet()
    await settle()

    expect(onIndexChange).not.toHaveBeenCalled()
    expect(drawn(strip)).toBe(2)
  })

  it('turns at most one page per gesture, however far the swipe goes', async () => {
    const { onIndexChange, strip, track } = mount({ initialIndex: 2 })

    // 2400px of steady driving, far more than a slide.
    wheel(
      track,
      Array.from({ length: 40 }, () => ({ deltaX: 60, deltaY: 0 }))
    )
    flushQuiet()
    await settle()

    expect(onIndexChange).toHaveBeenCalledTimes(1)
    expect(drawn(strip)).toBe(3)
  })

  it('mirrors in a right-to-left gallery', async () => {
    const { onIndexChange, track } = mount({ direction: 'rtl', initialIndex: 2 })

    wheel(track, drivenSwipe(1))
    flushQuiet()

    expect(onIndexChange).toHaveBeenCalledWith(1)
  })

  it('leaves vertical scrolling and pinch-zoom alone', async () => {
    const { onIndexChange, strip, track } = mount({ initialIndex: 2 })

    wheel(track, [
      { deltaX: 10, deltaY: 40 },
      { deltaX: 10, deltaY: 40 },
    ])
    act(() => {
      track.dispatchEvent(
        new WheelEvent('wheel', { bubbles: true, cancelable: true, ctrlKey: true, deltaX: 40 })
      )
    })
    flushQuiet()

    expect(drawn(strip)).toBe(2)
    expect(onIndexChange).not.toHaveBeenCalled()
  })

  it('stands down while zoomed', async () => {
    const { onIndexChange, track } = mount({ enabled: false, initialIndex: 2 })

    wheel(track, drivenSwipe(1))
    flushQuiet()

    expect(onIndexChange).not.toHaveBeenCalled()
  })

  describe('replaying real trackpad recordings', () => {
    // Recordings of the hardware, which is the only thing that can contradict
    // a hand-written fixture. The shape that once broke the page-per-gesture
    // lock, a trough where the fingers leave the surface between two swipes,
    // occurs only in these.
    const traces: readonly (readonly [string, WheelTrace])[] = [
      ['one swipe', singleTrace],
      ['nine swipes with no pause between them', doubleFastTrace],
      ['five swipes in a row', continuousTrace],
      ['a vertical scroll', verticalTrace],
    ]

    for (const [label, trace] of traces) {
      it(`turns the page once per deliberate swipe — ${label}`, async () => {
        // Long enough that none of these runs off the end.
        const { onIndexChange, track } = mount({ count: 30, initialIndex: 15 })

        let elapsed = 0
        for (const [t, deltaX, deltaY] of trace.events) {
          // The clock advances in step with the recording, so the quiet
          // backstop and the springs behave as they did on the day.
          act(() => {
            vi.advanceTimersByTime(Math.max(0, t - elapsed))
          })
          elapsed = t
          wheel(track, [{ deltaX, deltaY }])
        }
        flushQuiet()

        expect(onIndexChange).toHaveBeenCalledTimes(trace.expectedTurns)
      })
    }
  })
})
