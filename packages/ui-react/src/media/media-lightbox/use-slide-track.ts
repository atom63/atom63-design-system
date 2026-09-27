'use client'

import { animate, motionValue, type AnimationPlaybackControls } from 'motion/react'
import { type RefObject, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { isRtlTrack } from './direction'
import { PAGE_SPRING } from './motion'
import {
  AXIS_LOCK_THRESHOLD,
  releaseTarget,
  resistEdges,
  swipeDistanceThreshold,
  trackTransform,
} from './track-physics'
import { createVelocityTracker } from './velocity'

/** Elements that own their own drag and click behaviour and must not lose it to a page drag. */
const NO_DRAG_SELECTOR = '[data-a63-no-drag], video, a, button:not([tabindex="-1"])'

/**
 * Accumulated `deltaX` a two-finger swipe must cover before its coast is
 * looked for at all.
 *
 * A swipe starts with a few tiny, noisy deltas (1, 4, 1, 5 in the captures),
 * and reading that noise against its own peak would call the coast before the
 * swipe has begun. Past this the peak is real.
 */
const WHEEL_DRIVE_THRESHOLD = 60

/**
 * How long the wheel must go quiet before the gesture is treated as over.
 *
 * For a device with no momentum at all this is what settles the track. Taken
 * from a real trackpad, the largest gap inside three seconds of continuous
 * swiping is 66ms, so silence this long only arrives once the hand has
 * stopped.
 */
const WHEEL_QUIET_MS = 160

/**
 * How far `|deltaX|` must fall from a gesture's peak before the coast that
 * follows is considered to have begun.
 *
 * A drive is noisy enough to dip and climb again inside one swipe (one capture
 * went 42 → 24 → 66), while a real gesture boundary drops to between 2% and 39%
 * of the preceding peak because the fingers leave the surface. The worst
 * in-drive dip only reached 57%. Anything from 0.30 to 0.50 separates them in
 * the recorded traces; this sits in the middle.
 */
const WHEEL_DECAY_RATIO = 0.4

/**
 * How far `|deltaX|` must climb back above a coast's floor to count as a new
 * gesture. Inside a real coast the largest rise above its running minimum is
 * 1px; a new swipe climbs tens of pixels within a few events.
 */
const WHEEL_RISE_MARGIN = 12

export type SlideSpan = readonly [number, number]

interface SlideTrackOptions {
  /** Off while zoomed: a drag there pans the photo, it does not turn the page. */
  enabled: boolean
  index: number
  itemCount: number
  goTo: (index: number) => void
  /**
   * How many neighbours either side are mounted anyway. A drag only asks for
   * its neighbours to be force-mounted when this does not already cover them.
   */
  mountRadius: number
  reducedMotion: boolean
  /** Receives `data-paging` while the track moves, so chrome can react in CSS. */
  rootRef: RefObject<HTMLElement | null>
  /** The element that moves: one `translate3d`, nothing else. */
  stripRef: RefObject<HTMLElement | null>
  /** The clipping frame around it, which also takes the pointer and wheel listeners. */
  trackRef: RefObject<HTMLElement | null>
}

export interface SlideTrack {
  /**
   * Slides a settle is passing over or a drag can reveal, which must stay
   * mounted until the track comes to rest. `null` at rest.
   */
  span: SlideSpan | null
}

function measureStep(strip: HTMLElement): number {
  // Layout width, not the bounding box: a pull-to-dismiss scales the stage,
  // and a slide should be one slide wide whatever that scale is.
  const gap = Number.parseFloat(getComputedStyle(strip).columnGap)
  const step = strip.offsetWidth + (Number.isFinite(gap) ? gap : 0)
  if (step > 0) {
    return step
  }
  return typeof window === 'undefined' ? 1 : window.innerWidth || 1
}

function union(span: SlideSpan | null, from: number, to: number): SlideSpan {
  const lo = Math.min(from, to, span?.[0] ?? Number.POSITIVE_INFINITY)
  const hi = Math.max(from, to, span?.[1] ?? Number.NEGATIVE_INFINITY)
  return [lo, hi]
}

/**
 * Pages the gallery by moving one strip of slides, the way a native pager does.
 *
 * - **Pointer.** Once a drag locks horizontal, the strip follows it 1:1, with
 *   rubber-band resistance past the first and last slide. On release it pages
 *   by distance or by velocity (see `releaseTarget`) and settles on a spring
 *   that starts at the speed the pointer let go at. A press during a settle
 *   catches the strip where it is.
 * - **Index changes.** Arrow keys, the previous and next buttons and a
 *   thumbnail next door all animate the same strip from wherever it is drawn.
 *   A jump of more than one slide cuts. Animating it would sweep past slides
 *   whose media is not mounted, a row of empty frames flying by; mounting
 *   them all to avoid that would decode every wallpaper in between for a
 *   fraction of a second on screen.
 * - **Trackpad.** A two-finger swipe moves the strip 1:1 as well, but at most
 *   one slide per gesture. It settles as soon as the fingers lift, which is
 *   when the coast starts, or when it reaches the next slide, and the rest of
 *   the coast is swallowed. The coast and new-gesture rules are the ones the
 *   captured trackpad traces validated for the old one-page lock.
 * - **Reduced motion.** Dragging still tracks, since it is direct
 *   manipulation, but every settle and every index change lands instantly.
 *
 * The strip is written imperatively, as `usePullToDismiss` does: this runs on
 * every pointer sample, and re-rendering a gallery per frame is how direct
 * manipulation stops feeling direct. React owns only the resting transform,
 * which is what makes the first commit measurable by the open morph.
 * `will-change` is set only while the strip moves.
 */
export function useSlideTrack({
  enabled,
  goTo,
  index,
  itemCount,
  mountRadius,
  reducedMotion,
  rootRef,
  stripRef,
  trackRef,
}: SlideTrackOptions): SlideTrack {
  const [position] = useState(() => motionValue(index))
  const [span, setSpan] = useState<SlideSpan | null>(null)
  const [spanIndex, setSpanIndex] = useState(index)

  // An animated index change passes over the slides between where the strip
  // is and where it is going. Recorded during render rather than in an
  // effect, so the commit that changes the index already keeps them mounted.
  if (spanIndex !== index) {
    setSpanIndex(index)
    const animates = !reducedMotion && Math.abs(index - spanIndex) === 1
    setSpan(animates ? union(span, spanIndex, index) : null)
  }

  const indexRef = useRef(index)
  indexRef.current = index
  const goToRef = useRef(goTo)
  goToRef.current = goTo
  const lastIndexRef = useRef(itemCount - 1)
  lastIndexRef.current = itemCount - 1
  const reducedMotionRef = useRef(reducedMotion)
  reducedMotionRef.current = reducedMotion
  const mountRadiusRef = useRef(mountRadius)
  mountRadiusRef.current = mountRadius

  /** The running settle, if any, and the index it is heading to. */
  const animationRef = useRef<AnimationPlaybackControls | null>(null)
  const targetRef = useRef<number | null>(null)
  /** The index the strip was last told about, for telling a new index from a re-render. */
  const committedIndexRef = useRef(index)
  const controlRef = useRef<{
    /** Stops any settle and holds the strip where it is drawn, ready to be dragged. */
    halt: () => void
    /** Writes the drawn position back over the resting one React just committed. */
    redraw: () => void
    /** Puts the strip on the current index at once and ends the movement. */
    rest: () => void
    /** Springs the strip to `target`, starting at `velocity` slide units per second. */
    settle: (target: number, velocity?: number) => void
  } | null>(null)

  // The strip, the position value and the settle machinery. Everything that
  // writes to the DOM lives here, so it is wired before any gesture or index
  // change can call into it.
  useLayoutEffect(() => {
    const strip = stripRef.current
    if (!strip) {
      return
    }

    let moving = false
    /**
     * The root that carries `data-paging`. Read when the movement starts, not
     * here: `Content` attaches its ref after its children's layout effects.
     */
    let pagingRoot: HTMLElement | null = null
    const setMoving = (next: boolean) => {
      if (next === moving) {
        return
      }
      moving = next
      // Promote only for the duration of the movement. A permanent layer on a
      // strip of full-viewport slides is memory nobody is using at rest.
      strip.style.willChange = next ? 'transform' : ''
      if (next) {
        pagingRoot = rootRef.current
      }
      pagingRoot?.toggleAttribute('data-paging', next)
    }

    const unsubscribe = position.on('change', value => {
      strip.style.transform = trackTransform(value)
    })

    const stop = () => {
      animationRef.current?.stop()
      animationRef.current = null
      targetRef.current = null
      position.stop()
    }

    const rest = () => {
      setMoving(false)
      const current = indexRef.current
      position.jump(current)
      strip.style.transform = trackTransform(current)
      setSpan(value => (value === null ? value : null))
    }

    const settle = (target: number, velocity?: number) => {
      stop()
      if (reducedMotionRef.current) {
        position.jump(target)
        if (target === indexRef.current) {
          rest()
          return
        }
        // The index change that follows lands the strip; a consumer that
        // ignores it gets the strip back on the slide it still reports.
        requestAnimationFrame(() => {
          if (targetRef.current === null && !animationRef.current) {
            rest()
          }
        })
        return
      }
      setMoving(true)
      targetRef.current = target
      const controls = animate(position, target, {
        ...PAGE_SPRING,
        ...(velocity === undefined ? {} : { velocity }),
        onComplete: () => {
          if (animationRef.current !== controls) {
            return
          }
          animationRef.current = null
          targetRef.current = null
          // A controlled consumer may have declined the page turn. Then the
          // strip goes back to the slide the gallery still reports.
          if (Math.abs(position.get() - indexRef.current) > 0.001) {
            settle(indexRef.current)
            return
          }
          rest()
        },
      })
      animationRef.current = controls
    }

    controlRef.current = {
      halt: () => {
        stop()
        setMoving(true)
      },
      redraw: () => {
        strip.style.transform = trackTransform(position.get())
      },
      rest: () => {
        stop()
        rest()
      },
      settle,
    }

    return () => {
      controlRef.current = null
      stop()
      unsubscribe()
      setMoving(false)
    }
  }, [position, rootRef, stripRef])

  // Keys, buttons and thumbnails change the index directly. React has already
  // committed the new resting transform by now; this puts the strip back where
  // it is drawn, before the browser paints, and settles it from there.
  useLayoutEffect(() => {
    const previous = committedIndexRef.current
    if (previous === index) {
      return
    }
    committedIndexRef.current = index
    const control = controlRef.current
    if (!control) {
      return
    }
    // A release already started this settle and asked for this index.
    if (targetRef.current === index && animationRef.current) {
      control.redraw()
      return
    }
    if (reducedMotion || Math.abs(index - previous) !== 1) {
      control.rest()
      return
    }
    control.redraw()
    control.settle(index)
  }, [index, reducedMotion])

  // Pointer and trackpad input.
  useEffect(() => {
    const track = trackRef.current
    const strip = stripRef.current
    if (!enabled || !track || !strip) {
      return
    }

    const settle = (target: number, velocityPxPerMs: number, step: number) => {
      const control = controlRef.current
      if (!control) {
        return
      }
      // Pixels per millisecond to slide units per second, the unit the
      // spring runs in.
      control.settle(target, (velocityPxPerMs / step) * 1000)
      if (target !== indexRef.current) {
        goToRef.current(target)
      }
    }

    const release = (startPosition: number, velocity: number, step: number) => {
      const target = releaseTarget({
        distanceThreshold: swipeDistanceThreshold(window.innerWidth),
        index: indexRef.current,
        lastIndex: lastIndexRef.current,
        position: position.get(),
        startPosition,
        step,
        velocity,
      })
      settle(target, velocity, step)
    }

    /** Catches the strip where it is, if a settle is moving it. */
    const catchStrip = (): boolean => {
      if (!animationRef.current) {
        return false
      }
      controlRef.current?.halt()
      return true
    }

    /** A drag can reveal a neighbour the preload radius does not mount. */
    const mountNeighbours = () => {
      if (mountRadiusRef.current >= 1) {
        return
      }
      const current = indexRef.current
      setSpan(value => union(value, current - 1, current + 1))
    }

    // --- Pointer ---------------------------------------------------------

    let pointerId: number | null = null
    let startX = 0
    let startY = 0
    let startPosition = 0
    let step = 1
    let rtl = false
    /** Locked once the pointer has moved enough to pick an axis; `null` while undecided. */
    let axis: 'horizontal' | 'vertical' | null = null
    /** The press stopped a settle, so the strip must be settled again whatever the gesture becomes. */
    let caught = false
    const velocity = createVelocityTracker()
    /**
     * A horizontal drag that ends over `SlideCloseArea` is followed by a
     * synthetic `click`, and acting on it would close the lightbox the drag
     * just paged.
     */
    let suppressNextClick = false
    let suppressTimer: ReturnType<typeof setTimeout> | null = null

    const forwardOf = (clientX: number) => (rtl ? clientX - startX : startX - clientX)

    const handlePointerDown = (event: PointerEvent) => {
      if (event.button !== 0) {
        return
      }
      if (pointerId !== null) {
        // A second finger is a pinch, never a page turn. Put the strip back.
        if (axis === 'horizontal' || caught) {
          controlRef.current?.settle(indexRef.current)
        }
        pointerId = null
        axis = null
        caught = false
        return
      }
      if ((event.target as HTMLElement | null)?.closest(NO_DRAG_SELECTOR)) {
        return
      }
      pointerId = event.pointerId
      startX = event.clientX
      startY = event.clientY
      axis = null
      caught = catchStrip()
      startPosition = position.get()
      step = measureStep(strip)
      rtl = isRtlTrack(track)
      velocity.reset(0, event.timeStamp)
    }

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerId !== pointerId) {
        return
      }
      const dx = event.clientX - startX
      const dy = event.clientY - startY

      if (axis === null) {
        if (Math.abs(dx) < AXIS_LOCK_THRESHOLD && Math.abs(dy) < AXIS_LOCK_THRESHOLD) {
          return
        }
        // Pull-to-dismiss gets the vertical half; abandon rather than race it.
        axis = Math.abs(dx) > Math.abs(dy) ? 'horizontal' : 'vertical'
        if (axis === 'vertical') {
          pointerId = null
          if (caught) {
            caught = false
            controlRef.current?.settle(Math.round(position.get()))
          }
          return
        }
        controlRef.current?.halt()
        mountNeighbours()
        track.style.userSelect = 'none'
      }

      if (event.cancelable) {
        event.preventDefault()
      }
      const forward = forwardOf(event.clientX)
      velocity.push(forward, event.timeStamp)
      position.set(resistEdges(startPosition + forward / step, lastIndexRef.current, step))
    }

    const endGesture = (event: PointerEvent, cancelled: boolean) => {
      if (event.pointerId !== pointerId) {
        return
      }
      const wasHorizontal = axis === 'horizontal'
      const wasCaught = caught
      pointerId = null
      axis = null
      caught = false
      track.style.userSelect = ''

      if (wasHorizontal) {
        suppressNextClick = true
        if (suppressTimer) {
          clearTimeout(suppressTimer)
        }
        // Not every drag is followed by a click; the flag must not outlive this one.
        suppressTimer = setTimeout(() => {
          suppressNextClick = false
        }, 0)
      }
      if (!wasHorizontal && !wasCaught) {
        return
      }
      if (cancelled) {
        release(startPosition, 0, step)
        return
      }
      velocity.push(forwardOf(event.clientX), event.timeStamp)
      // Trailing speed, not the whole drag's average: a flick is judged on
      // how fast the pointer was moving as it let go.
      release(startPosition, velocity.velocity(), step)
    }

    const handlePointerUp = (event: PointerEvent) => {
      endGesture(event, false)
    }
    const handlePointerCancel = (event: PointerEvent) => {
      endGesture(event, true)
    }

    /** Capture phase, so it runs before the close area's own `onClick`. */
    const handleClickCapture = (event: MouseEvent) => {
      if (!suppressNextClick) {
        return
      }
      suppressNextClick = false
      if (suppressTimer) {
        clearTimeout(suppressTimer)
        suppressTimer = null
      }
      event.preventDefault()
      event.stopPropagation()
    }

    // --- Trackpad --------------------------------------------------------

    /** `tracking` follows the fingers; `spent` swallows the coast after a settle. */
    let wheelMode: 'idle' | 'tracking' | 'spent' = 'idle'
    let wheelStart = 0
    let wheelForward = 0
    let wheelStep = 1
    let wheelRtl = false
    let wheelPeak = 0
    let wheelCoasting = false
    let wheelFloor = Number.POSITIVE_INFINITY
    const wheelVelocity = createVelocityTracker()
    let wheelQuietTimer: ReturnType<typeof setTimeout> | null = null

    const finishWheel = (useVelocity: boolean) => {
      release(wheelStart, useVelocity ? wheelVelocity.velocity() : 0, wheelStep)
    }

    const armWheelQuietTimer = () => {
      if (wheelQuietTimer) {
        clearTimeout(wheelQuietTimer)
      }
      wheelQuietTimer = setTimeout(() => {
        wheelQuietTimer = null
        if (wheelMode === 'tracking') {
          // Nothing coasted and nothing reached the next slide: a device with
          // no momentum, whose gesture ended a moment ago. Distance decides.
          finishWheel(false)
        }
        wheelMode = 'idle'
      }, WHEEL_QUIET_MS)
    }

    const handleWheel = (event: WheelEvent) => {
      // A trackpad pinch arrives as ctrl + wheel and belongs to zoom; up and
      // down belong to pull-to-dismiss.
      if (event.ctrlKey || Math.abs(event.deltaX) <= Math.abs(event.deltaY)) {
        return
      }
      // Stops the browser's own edge-swipe navigation from fighting the page
      // turn. Guarded because whether a wheel sequence can be cancelled is
      // latched at its first event.
      if (event.cancelable) {
        event.preventDefault()
      }
      armWheelQuietTimer()
      const magnitude = Math.abs(event.deltaX)

      if (wheelMode === 'spent') {
        if (!wheelCoasting) {
          // Still driving past the settle. The same swipe may keep
          // accelerating, and dip and climb on the way to its peak, without
          // any of that counting as a second gesture.
          if (magnitude > wheelPeak) {
            wheelPeak = magnitude
            return
          }
          if (magnitude >= wheelPeak * WHEEL_DECAY_RATIO) {
            return
          }
          wheelCoasting = true
          wheelFloor = magnitude
          return
        }
        if (magnitude < wheelFloor) {
          wheelFloor = magnitude
          return
        }
        if (magnitude - wheelFloor <= WHEEL_RISE_MARGIN) {
          return
        }
        // Climbing back out of the coast: the fingers are down again, and this
        // is a new gesture. Momentum only ever decays, so it cannot get here.
        wheelMode = 'idle'
      }

      if (wheelMode === 'idle') {
        controlRef.current?.halt()
        mountNeighbours()
        wheelMode = 'tracking'
        wheelStart = position.get()
        wheelForward = 0
        wheelPeak = 0
        wheelCoasting = false
        wheelFloor = Number.POSITIVE_INFINITY
        wheelStep = measureStep(strip)
        wheelRtl = isRtlTrack(track)
        wheelVelocity.reset(0, event.timeStamp)
      }

      const driven = Math.abs(wheelForward) > WHEEL_DRIVE_THRESHOLD
      if (driven && magnitude > wheelPeak) {
        wheelPeak = magnitude
      } else if (driven && magnitude < wheelPeak * WHEEL_DECAY_RATIO) {
        // The fingers have left the trackpad. Decide now, on the speed the
        // gesture ended at, and swallow the rest of the coast.
        finishWheel(true)
        wheelMode = 'spent'
        wheelCoasting = true
        wheelFloor = magnitude
        return
      }

      // Positive `deltaX` scrolls content leftward, which is onward in a
      // left-to-right gallery and back in a right-to-left one.
      wheelForward += wheelRtl ? -event.deltaX : event.deltaX
      wheelVelocity.push(wheelForward, event.timeStamp)
      const anchor = Math.round(wheelStart)
      const raw = wheelStart + wheelForward / wheelStep
      const bounded = Math.min(Math.max(raw, anchor - 1), anchor + 1)
      position.set(resistEdges(bounded, lastIndexRef.current, wheelStep))
      if (bounded !== raw) {
        // A whole slide in one gesture is the most it may turn.
        finishWheel(true)
        wheelMode = 'spent'
        wheelCoasting = false
        wheelPeak = Math.max(wheelPeak, magnitude)
      }
    }

    track.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('pointermove', handlePointerMove, { passive: false })
    window.addEventListener('pointerup', handlePointerUp)
    window.addEventListener('pointercancel', handlePointerCancel)
    track.addEventListener('click', handleClickCapture, true)
    // Not passive: a horizontal event's default is conditionally prevented
    // above, and a listener's passive-ness is fixed at registration.
    track.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      if (wheelQuietTimer) {
        clearTimeout(wheelQuietTimer)
      }
      if (suppressTimer) {
        clearTimeout(suppressTimer)
      }
      // Zoom switched the gesture off mid-drag: put the strip back.
      if (axis === 'horizontal' || caught || wheelMode === 'tracking') {
        controlRef.current?.settle(indexRef.current)
      }
      track.style.userSelect = ''
      track.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
      window.removeEventListener('pointercancel', handlePointerCancel)
      track.removeEventListener('click', handleClickCapture, true)
      track.removeEventListener('wheel', handleWheel)
    }
  }, [enabled, position, stripRef, trackRef])

  return { span }
}
