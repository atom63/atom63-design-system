import { type RefObject, useEffect, useRef } from 'react'
import { arrowIndexDelta, isRtlTrack } from './direction'
import { createVelocityTracker } from './velocity'

/**
 * How far the pointer must travel before an axis is picked at all.
 *
 * Below this a press is still deciding whether it is a swipe, a pull, or just
 * a shaky tap — locking an axis this early would steal small vertical jitter
 * from pull-to-dismiss and small horizontal jitter from an ordinary tap.
 * Matches the dead zone the other two pointer gestures in this file already
 * use, so a finger crossing from one to the other never feels the seam.
 */
const AXIS_LOCK_THRESHOLD = 8
/**
 * Proportion of the viewport width a swipe must cross to turn the page by
 * distance alone, capped so a wide desktop window does not ask for an
 * unreasonably long drag. Mirrors `usePullToDismiss`'s own
 * ratio-with-a-cap shape (see `dismissDistance`) for the same reason: the
 * gesture should cost the same finger travel on a phone and on a 4K monitor.
 */
const SWIPE_DISTANCE_RATIO = 0.2
/** The ratio's ceiling — see `SWIPE_DISTANCE_RATIO`. */
const SWIPE_DISTANCE_CAP = 120
/**
 * A flick turns the page below the distance threshold if it left the hand
 * this fast. Carried over from the retired `useDragToScroll`'s
 * `FLICK_VELOCITY`, which tuned the same number for the same gesture against
 * the same track.
 */
const SWIPE_VELOCITY = 0.5

/** Elements that own their own drag/click behaviour and must not lose it to a swipe. */
const NO_SWIPE_SELECTOR = '[data-a63-no-drag], video, a, button:not([tabindex="-1"])'

/**
 * Accumulated `deltaX` a two-finger swipe must cross before it turns the page.
 *
 * A single trackpad wheel event from a deliberate horizontal swipe already
 * carries tens of pixels of `deltaX`, so this clears in the first two or
 * three events of a real gesture while staying well above the odd stray
 * notch a diagonal or hesitant scroll produces.
 */
const WHEEL_DISTANCE_THRESHOLD = 60

/**
 * How long the wheel must go quiet before a new horizontal gesture is allowed
 * to turn the page again.
 *
 * A backstop, not the main release. Captured from a real trackpad, the
 * largest gap inside three seconds of continuous swiping is 66ms, so silence
 * this long only ever arrives once the hand has actually stopped — which is
 * exactly what it is here to notice, so a gesture that simply ends does not
 * leave its measurement state behind. Re-acceleration is what releases the
 * lock mid-burst; see `WHEEL_DECAY_RATIO`.
 */
const WHEEL_QUIET_MS = 160

/**
 * How far `|deltaX|` must fall from a gesture's peak before the coast that
 * follows is considered to have begun.
 *
 * A momentum coast never re-accelerates, so a rise back out of one is the
 * clearest signal available that the fingers are back on the trackpad. But a
 * rise is only meaningful once the fall is real: a drive is noisy enough to
 * dip below its own peak and climb again inside a single swipe — one in the
 * captures went 42 → 24 → 66 — and reading that dip as a coast turns one
 * swipe into two page turns.
 *
 * Measured across the captured traces, a genuine gesture boundary drops to
 * between 2% and 39% of the preceding peak, because the fingers leave the
 * surface; the worst in-drive dip only reached 57%. Anything from 0.30 to
 * 0.50 separates them, and the page-turn counts are identical across that
 * whole band — this sits in the middle of it.
 */
const WHEEL_DECAY_RATIO = 0.4

/**
 * How far `|deltaX|` must climb back above the coast's floor to count as a
 * new gesture rather than noise in the coast.
 *
 * The margin is generous because the gap it straddles is enormous: inside a
 * real coast the largest rise above its own running minimum is **1px**, while
 * a new swipe climbs tens of pixels within a few events. Counts are identical
 * anywhere from 4 to 24.
 */
const WHEEL_RISE_MARGIN = 12

interface SwipeIntentOptions {
  /** Off while zoomed (a drag there pans, it does not turn the page) or while any part disables the gesture. */
  enabled: boolean
  /** `-1` for the previous slide, `1` for the next — already RTL-mirrored. */
  onIntent: (delta: -1 | 1) => void
  rootRef: RefObject<HTMLElement | null>
  stageRef: RefObject<HTMLElement | null>
}

/**
 * Decides *that* a drag turned the page and *which way* — nothing more.
 *
 * The stack has no scroll position for a finger to drag, and spec §2.4 is an
 * explicit owner ruling that none should be simulated: the photo, the chrome,
 * and everything else stay motionless for the whole gesture. This hook never
 * touches a style, a class, or a transform; it only watches pointer samples
 * and calls `onIntent` once, on release, if the gesture earned it. The actual
 * page turn — and its crossfade — happens through the normal index change,
 * exactly like an arrow key or a thumbnail click.
 *
 * Horizontal is this hook's half of the axis. Vertical belongs to
 * `usePullToDismiss`, which runs alongside it and claims the gesture first
 * whenever `|dy| > |dx|`.
 *
 * A two-finger trackpad swipe reports the same horizontal intent through
 * `wheel` events instead of pointer samples — spec §2.2's "触控板滚轮" half.
 * A single swipe fires dozens of them, and macOS keeps firing more as
 * momentum after the fingers lift, so this accumulates `deltaX` and reports
 * once per gesture: crossing the threshold turns the page and locks out any
 * further report until the wheel has been quiet long enough to be a new
 * gesture (see `WHEEL_QUIET_MS`).
 */
export function useSwipeIntent({ enabled, onIntent, rootRef, stageRef }: SwipeIntentOptions): void {
  // Held in a ref so a new `onIntent` identity — which an `index` change
  // produces on every turn — cannot re-attach the listeners mid-gesture.
  const intentRef = useRef(onIntent)
  intentRef.current = onIntent

  useEffect(() => {
    const root = rootRef.current
    const stage = stageRef.current
    if (!enabled || !root || !stage) {
      return
    }

    let pointerId: number | null = null
    let startX = 0
    let startY = 0
    const velocity = createVelocityTracker()
    /** Locked once the pointer has moved enough to pick an axis; `null` while undecided. */
    let axis: 'horizontal' | 'vertical' | null = null
    /**
     * A horizontal gesture that ends over `SlideCloseArea` — the full-bleed
     * hit area behind the media — or over the backdrop's own margins still
     * fires a synthetic `click` right after `pointerup`; that click is not a
     * click, and acting on it would close the lightbox the swipe just turned
     * the page in. Mirrors the retired `useDragToScroll`'s
     * `suppressNextClick` / `handleClickCapture` pair, moved from the track
     * it used to bind to onto `root`, which is what this hook covers instead.
     */
    let suppressNextClick = false
    let suppressTimer: ReturnType<typeof setTimeout> | null = null

    const handlePointerDown = (event: PointerEvent) => {
      if (event.button !== 0 || pointerId !== null) {
        return
      }
      if ((event.target as HTMLElement | null)?.closest(NO_SWIPE_SELECTOR)) {
        return
      }
      pointerId = event.pointerId
      startX = event.clientX
      startY = event.clientY
      axis = null
      velocity.reset(event.clientX, event.timeStamp)
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
          return
        }
      }

      // Deliberately no DOM write here, on any frame of the drag — spec §2.4.
      velocity.push(event.clientX, event.timeStamp)
    }

    const endGesture = (event: PointerEvent, report: boolean) => {
      if (event.pointerId !== pointerId) {
        return
      }
      const dx = event.clientX - startX
      const wasHorizontal = axis === 'horizontal'
      pointerId = null
      axis = null

      if (wasHorizontal) {
        suppressNextClick = true
        if (suppressTimer) {
          clearTimeout(suppressTimer)
        }
        // Not every drag is followed by a click; the flag must not outlive
        // this one.
        suppressTimer = setTimeout(() => {
          suppressNextClick = false
        }, 0)
      }

      if (!report || !wasHorizontal) {
        return
      }

      velocity.push(event.clientX, event.timeStamp)
      // Trailing speed, not the whole drag's average — a flick is judged on
      // how fast the pointer was moving as it let go.
      const speed = velocity.velocity()
      const distanceThreshold = Math.min(
        SWIPE_DISTANCE_CAP,
        (window.innerWidth || SWIPE_DISTANCE_CAP) * SWIPE_DISTANCE_RATIO
      )
      const passedDistance = Math.abs(dx) > distanceThreshold
      const passedVelocity = Math.abs(speed) > SWIPE_VELOCITY
      if (!passedDistance && !passedVelocity) {
        return
      }

      // A drag left reads the same as pressing the physical right arrow —
      // the viewport moves rightward, revealing what was next — so the same
      // reading-direction mirror `arrowIndexDelta` already applies to keys
      // applies here without a second RTL rule.
      const rtl = isRtlTrack(stage)
      const key = dx < 0 ? 'ArrowRight' : 'ArrowLeft'
      const delta = arrowIndexDelta(key, rtl)
      if (delta !== 1 && delta !== -1) {
        return
      }
      intentRef.current(delta)
    }

    const handlePointerUp = (event: PointerEvent) => {
      endGesture(event, true)
    }
    const handlePointerCancel = (event: PointerEvent) => {
      endGesture(event, false)
    }

    /** Accumulated `deltaX` for the gesture currently being measured. */
    let wheelAccumulated = 0
    /** Raised once this gesture has reported; cleared when a new gesture starts. */
    let wheelLocked = false
    /** True once the reported gesture's coast has begun — see `WHEEL_DECAY_RATIO`. */
    let wheelCoasting = false
    /** Largest `|deltaX|` seen since the lock engaged, while still driving. */
    let wheelPeak = 0
    /** Smallest `|deltaX|` seen since the coast began. */
    let wheelFloor = Number.POSITIVE_INFINITY
    let wheelQuietTimer: ReturnType<typeof setTimeout> | null = null

    const resetWheelGesture = () => {
      wheelLocked = false
      wheelCoasting = false
      wheelAccumulated = 0
      wheelPeak = 0
      wheelFloor = Number.POSITIVE_INFINITY
    }

    const armWheelQuietTimer = () => {
      if (wheelQuietTimer) {
        clearTimeout(wheelQuietTimer)
      }
      wheelQuietTimer = setTimeout(() => {
        wheelQuietTimer = null
        resetWheelGesture()
      }, WHEEL_QUIET_MS)
    }

    const handleWheel = (event: WheelEvent) => {
      // Sideways scrolling is ours; up/down belongs to pull-to-dismiss, and it
      // is already watching the same `wheel` events through its own listener.
      if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) {
        return
      }
      // Stops the browser's own edge-swipe navigation and page scroll from
      // fighting the page turn. Guarded because whether a wheel sequence can
      // be cancelled is latched at its first event.
      if (event.cancelable) {
        event.preventDefault()
      }

      // Every relevant event re-arms this, so it fires only once the hand has
      // genuinely stopped — a coast alone keeps it at bay. It is the backstop
      // that clears leftover state; the release that matters mid-burst is the
      // re-acceleration check below.
      armWheelQuietTimer()

      const magnitude = Math.abs(event.deltaX)

      if (wheelLocked) {
        if (!wheelCoasting) {
          // Still driving. The swipe that already reported is free to keep
          // accelerating — and to dip and climb again on the way to its peak —
          // without any of that counting as a second gesture.
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
        // Climbing back out of the coast: the fingers are back down, and this
        // is a new gesture. Momentum only ever decays, so it cannot get here.
        resetWheelGesture()
      }

      wheelAccumulated += event.deltaX
      if (Math.abs(wheelAccumulated) <= WHEEL_DISTANCE_THRESHOLD) {
        return
      }

      // Locked immediately, before the direction is even resolved, so nothing
      // past this point can report a second time for the same gesture.
      wheelLocked = true
      wheelCoasting = false
      wheelPeak = magnitude
      wheelFloor = Number.POSITIVE_INFINITY
      const dx = wheelAccumulated
      wheelAccumulated = 0

      // Positive `deltaX` is the same "content scrolled left" motion as a
      // pointer drag ending to the left of where it started, so it reuses
      // that path's key mapping and RTL mirror rather than a second rule.
      const rtl = isRtlTrack(stage)
      const key = dx > 0 ? 'ArrowRight' : 'ArrowLeft'
      const delta = arrowIndexDelta(key, rtl)
      if (delta !== 1 && delta !== -1) {
        return
      }
      intentRef.current(delta)
    }

    /**
     * Capture phase, so it runs before the close button's own `onClick` — by
     * the bubble phase the damage is already done.
     */
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

    root.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    window.addEventListener('pointercancel', handlePointerCancel)
    // Not passive: a horizontal event's default (page/edge-swipe scroll) is
    // conditionally prevented above, and a listener's passive-ness is fixed at
    // registration. Vertical events pass straight through untouched.
    root.addEventListener('click', handleClickCapture, true)
    root.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      if (wheelQuietTimer) {
        clearTimeout(wheelQuietTimer)
      }
      if (suppressTimer) {
        clearTimeout(suppressTimer)
      }
      root.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
      window.removeEventListener('pointercancel', handlePointerCancel)
      root.removeEventListener('click', handleClickCapture, true)
      root.removeEventListener('wheel', handleWheel)
    }
  }, [enabled, rootRef, stageRef])
}
