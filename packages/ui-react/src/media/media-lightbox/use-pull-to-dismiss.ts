import { animate } from 'motion/react'
import { type RefObject, useEffect } from 'react'
import { PULL_SETTLE_SPRING } from './motion'
import { holdBodyScrollThroughMomentum } from './scroll-lock'
import { createVelocityTracker } from './velocity'
import { createWheelMomentum, swallowWheelMomentum } from './wheel-momentum'

/** How far the media must travel before letting go closes the lightbox. */
const DISMISS_DISTANCE_CAP = 120
/** Proportion of the viewport a pull must cover on a short screen. */
const DISMISS_DISTANCE_RATIO = 0.14
/** A flick closes below the distance threshold if it is fast enough. */
const DISMISS_VELOCITY = 0.6
/** Wheel gestures have no pointerup, so they settle on a quiet period instead. */
const WHEEL_SETTLE_MS = 140
/**
 * How long a stranded pull waits before it unwinds itself.
 *
 * Only reachable when a controlled consumer ignores the dismiss and leaves the
 * lightbox up. It has to outlast a real close: unwinding into one dragged the
 * stage out from under the closing morph, which is what made a dismissed photo
 * hitch on its way home.
 */
const DISMISSED_UNWIND_MS = 900
const MAX_SCALE_DROP = 0.2
const BACKDROP_FLOOR = 0.35

/**
 * Fixed at 120px a pull had to cross a fifth of a phone screen and a tenth of a
 * laptop's, so the same gesture felt heavy on the device most likely to make it.
 */
function dismissDistance(): number {
  if (typeof window === 'undefined') {
    return DISMISS_DISTANCE_CAP
  }
  return Math.min(DISMISS_DISTANCE_CAP, window.innerHeight * DISMISS_DISTANCE_RATIO)
}

interface PullToDismissOptions {
  enabled: boolean
  reducedMotion: boolean
  onDismiss: () => void
  stageRef: RefObject<HTMLDivElement | null>
  backdropRef: RefObject<HTMLDivElement | null>
  trackRef: RefObject<HTMLDivElement | null>
  /** Receives `data-pulling` and the progress variable so chrome can stand down. */
  rootRef: RefObject<HTMLDivElement | null>
}

/**
 * Drag the media off in either direction — touch, pen, mouse, or a trackpad's
 * wheel — to close.
 *
 * Up and down both dismiss, and symmetrically: a photo that can be flung away
 * has no reason to care which way the hand went, and resisting one of them only
 * teaches the user that half their gestures are wrong.
 *
 * Written against the DOM rather than React state on purpose: this runs on every
 * pointer sample, and re-rendering a gallery per frame is how a direct
 * manipulation stops feeling direct.
 */
export function usePullToDismiss({
  enabled,
  reducedMotion,
  onDismiss,
  stageRef,
  backdropRef,
  trackRef,
  rootRef,
}: PullToDismissOptions): void {
  useEffect(() => {
    const stage = stageRef.current
    const backdrop = backdropRef.current
    const track = trackRef.current
    const root = rootRef.current
    if (!enabled || !stage || !track) {
      return
    }

    let offset = 0
    let startX = 0
    let startY = 0
    let pointerId: number | null = null
    /** Re-read per gesture: the viewport can change between two of them. */
    let threshold = dismissDistance()
    const velocity = createVelocityTracker()
    /** null until the first move decides whether this is a pull or a swipe. */
    let claimed: boolean | null = null
    let wheelTimer: ReturnType<typeof setTimeout> | null = null
    /** The wheel gesture the events currently belong to, if any. */
    let wheelLastTime = 0
    let wheelOpen = false
    /**
     * Raised once a wheel gesture has had its say. The momentum that follows a
     * decision is the browser coasting, and must not start a second one.
     */
    let wheelSpent = false
    const wheelMomentum = createWheelMomentum()
    let suppressNextClick = false
    let suppressTimer: ReturnType<typeof setTimeout> | null = null
    let unwindTimer: ReturnType<typeof setTimeout> | null = null

    const paint = (value: number) => {
      // Promote only for the duration of the gesture. A permanent compositor
      // layer on a full-viewport element is memory nobody is using at rest.
      stage.style.willChange = 'transform'
      offset = value
      const progress = Math.min(Math.abs(value) / threshold, 1)
      if (root) {
        root.dataset.pulling = value === 0 ? 'false' : 'true'
        root.style.setProperty('--a63-media-lightbox-pull', String(progress))
        root.style.setProperty('--a63-lightbox-pull-progress', String(progress))
      }
      const fade = Math.min(Math.abs(value) / (threshold * 3), 1)
      const scale = reducedMotion ? 1 : 1 - fade * MAX_SCALE_DROP
      stage.style.transform = `translate3d(0, ${value}px, 0) scale(${scale})`
      if (backdrop) {
        backdrop.style.opacity = String(1 - fade * (1 - BACKDROP_FLOOR))
      }
    }

    const reset = () => {
      stage.style.transform = ''
      stage.style.transformOrigin = ''
      stage.style.willChange = ''
      if (backdrop) {
        backdrop.style.opacity = ''
      }
      if (root) {
        root.dataset.pulling = 'false'
        root.style.removeProperty('--a63-media-lightbox-pull')
        root.style.removeProperty('--a63-lightbox-pull-progress')
      }
      offset = 0
    }

    const settle = (velocityPxPerMs: number): boolean => {
      const shouldDismiss =
        Math.abs(offset) > threshold || Math.abs(velocityPxPerMs) > DISMISS_VELOCITY
      if (shouldDismiss) {
        // Deliberately keep the offset: the closing morph is captured from the
        // current state, so resetting first would snap the media back to centre
        // before it flies home. The stage then stays frozen for the whole close
        // — the morph measured against this transform, and moving it underneath
        // would drag the photo away from where the morph is aiming it.
        onDismiss()
        // Only for a consumer that ignores the request and leaves the lightbox
        // up: the media must not stay stranded off-centre. Long enough to be
        // sure a real close has finished, since unwinding into one is the hitch
        // this used to cause.
        unwindTimer = setTimeout(() => {
          unwindTimer = null
          if (stage.isConnected) {
            const from = offset
            if (reducedMotion) {
              paint(0)
              reset()
              return
            }
            void animate(from, 0, {
              ...PULL_SETTLE_SPRING,
              onComplete: reset,
              onUpdate: paint,
              velocity: velocityPxPerMs * 1000,
            })
          }
        }, DISMISSED_UNWIND_MS)
        return true
      }
      if (offset === 0) {
        return false
      }
      if (reducedMotion) {
        paint(0)
        reset()
        return false
      }
      const from = offset
      void animate(from, 0, {
        ...PULL_SETTLE_SPRING,
        onComplete: reset,
        onUpdate: paint,
        // Hand the spring the speed the finger let go at, so the rubber-band
        // continues the gesture instead of restarting from stationary.
        velocity: velocityPxPerMs * 1000,
      })
      return false
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (event.button !== 0 || pointerId !== null) {
        return
      }
      // Video controls and anything else opted out keep their own gestures. The
      // backdrop hit area is deliberately not one of them — it covers the whole
      // slide, and excluding it would disable the gesture entirely.
      if (
        (event.target as HTMLElement | null)?.closest(
          '[data-a63-no-drag], video, a, button:not([tabindex="-1"])'
        )
      ) {
        return
      }
      pointerId = event.pointerId
      claimed = null
      startX = event.clientX
      startY = event.clientY
      threshold = dismissDistance()
      velocity.reset(0, event.timeStamp)
      stage.style.transformOrigin = 'center'
    }

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerId !== pointerId) {
        return
      }
      const dx = event.clientX - startX
      const dy = event.clientY - startY

      if (claimed === null) {
        if (Math.abs(dx) < 8 && Math.abs(dy) < 8) {
          return
        }
        // The horizontal swipe axis gets first refusal — a swipe is a swipe.
        claimed = Math.abs(dy) > Math.abs(dx)
        if (claimed) {
          track.style.userSelect = 'none'
          track.style.cursor = 'grabbing'
        }
      }
      if (!claimed) {
        return
      }

      if (event.cancelable) {
        event.preventDefault()
      }
      // Either direction dismisses. Everything downstream already reads the
      // distance rather than the sign.
      velocity.push(dy, event.timeStamp)
      paint(dy)
    }

    const endPointer = (event: PointerEvent) => {
      if (event.pointerId !== pointerId) {
        return
      }
      pointerId = null
      track.style.userSelect = ''
      track.style.cursor = ''
      if (claimed) {
        velocity.push(offset, event.timeStamp)
        suppressNextClick = true
        if (suppressTimer) {
          clearTimeout(suppressTimer)
        }
        suppressTimer = setTimeout(() => {
          suppressNextClick = false
        }, 0)
        settle(velocity.velocity())
      }
      claimed = null
    }

    const handleClickCapture = (event: MouseEvent) => {
      if (!suppressNextClick) {
        return
      }
      suppressNextClick = false
      event.stopPropagation()
      event.preventDefault()
    }

    const endWheelGesture = (velocityPxPerMs: number) => {
      if (wheelTimer) {
        clearTimeout(wheelTimer)
        wheelTimer = null
      }
      // The gesture keeps its slot until the events stop, so the coast that
      // follows cannot be read as a fresh swipe.
      wheelSpent = true
      if (settle(velocityPxPerMs)) {
        // The page underneath becomes scrollable the moment this lightbox
        // unmounts, and the trackpad is still coasting from the swipe that
        // closed it. Holding the lock is what stops that; swallowing the events
        // is only a belt, because after the unmount they are scrolled on the
        // compositor without the main thread being asked.
        holdBodyScrollThroughMomentum()
        swallowWheelMomentum()
      }
    }

    const handleWheel = (event: WheelEvent) => {
      // Sideways scrolling is the swipe axis's, not ours.
      if (Math.abs(event.deltaX) >= Math.abs(event.deltaY)) {
        return
      }
      // Guarded: whether a wheel sequence can be cancelled is latched at its
      // first event, so a later one may simply refuse.
      if (event.cancelable) {
        event.preventDefault()
      }

      // A quiet spell ends whatever came before, momentum included.
      const idle = !wheelOpen || event.timeStamp - wheelLastTime > WHEEL_SETTLE_MS
      wheelLastTime = event.timeStamp
      if (idle) {
        wheelOpen = true
        wheelSpent = false
        threshold = dismissDistance()
        velocity.reset(offset, event.timeStamp)
        wheelMomentum.reset()
      }

      const coasting = wheelMomentum.push(event.deltaY, event.timeStamp)
      if (wheelSpent) {
        return
      }
      if (coasting) {
        // The fingers are already off the trackpad. Letting the coast move the
        // media is what made the photo drift on after the hand had stopped, and
        // waiting for the coast to finish is what made the decision arrive half
        // a second late. Decide now, on the speed the gesture really ended at.
        endWheelGesture(velocity.velocity())
        return
      }

      stage.style.transformOrigin = 'center'
      const next = offset - event.deltaY
      velocity.push(next, event.timeStamp)
      paint(next)

      // Past the threshold the answer cannot change, so there is nothing to wait
      // for. Committing here is what keeps the close on the user's hand.
      if (Math.abs(next) > threshold) {
        endWheelGesture(velocity.velocity())
        return
      }

      if (wheelTimer) {
        clearTimeout(wheelTimer)
      }
      wheelTimer = setTimeout(() => {
        wheelTimer = null
        wheelOpen = false
        // Nothing decayed and nothing crossed: a device with no momentum at all,
        // whose gesture ended some milliseconds ago. Distance alone decides.
        settle(0)
      }, WHEEL_SETTLE_MS)
    }

    track.addEventListener('pointerdown', handlePointerDown, { passive: true })
    window.addEventListener('pointermove', handlePointerMove, { passive: false })
    window.addEventListener('pointerup', endPointer, { passive: true })
    window.addEventListener('pointercancel', endPointer, { passive: true })
    track.addEventListener('click', handleClickCapture, { capture: true })
    track.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      if (wheelTimer) {
        clearTimeout(wheelTimer)
      }
      if (suppressTimer) {
        clearTimeout(suppressTimer)
      }
      if (unwindTimer) {
        clearTimeout(unwindTimer)
      }
      track.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', endPointer)
      window.removeEventListener('pointercancel', endPointer)
      track.removeEventListener('click', handleClickCapture, { capture: true })
      track.removeEventListener('wheel', handleWheel)
      reset()
    }
  }, [backdropRef, enabled, onDismiss, reducedMotion, rootRef, stageRef, trackRef])
}
