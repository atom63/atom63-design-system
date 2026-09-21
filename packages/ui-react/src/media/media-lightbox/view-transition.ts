import { flushSync } from 'react-dom'
import type { LightboxTiming } from './timing'
import { applyTimingVars, clearTimingVars } from './timing'

/** The name both the thumbnail and the enlarged media answer to during a morph. */
export const MEDIA_VIEW_TRANSITION_NAME = 'a63-media-lightbox-media'

/** Scopes the lightbox's `::view-transition-*` rules to its own transitions. */
const TRANSITION_CLASS = 'a63-media-lightbox-vt'

const DIRECTION_CLASS = {
  in: 'a63-media-lightbox-vt-in',
  out: 'a63-media-lightbox-vt-out',
} as const

/**
 * Marks the one element allowed to keep a `view-transition-name` while the
 * lightbox owns the transition. See `media-lightbox.css` § name isolation.
 */
export const MORPH_TARGET_ATTRIBUTE = 'data-a63-morph-target'

/**
 * A view transition cannot be interrupted, and starting a second one while the
 * first is in flight loses updates and strands the morph name. One at a time.
 */
let inFlight = false

const settleWaiters: Array<() => void> = []

function notifySettled(): void {
  const waiters = settleWaiters.splice(0, settleWaiters.length)
  for (const waiter of waiters) {
    waiter()
  }
}

/** Resolves when the in-flight lightbox morph has released the document. */
export function whenMediaViewTransitionSettles(): Promise<void> {
  if (
    !inFlight &&
    (typeof document === 'undefined' ||
      !document.documentElement.classList.contains(TRANSITION_CLASS))
  ) {
    return Promise.resolve()
  }
  return new Promise(resolve => {
    settleWaiters.push(resolve)
  })
}

/**
 * Thumbnails this module marked imperatively.
 *
 * Only these are cleaned up. The lightbox's own media carries the same
 * attribute, but React owns it — stripping it from the DOM behind React's back
 * would leave it off on the next render and break the closing morph.
 */
const claimedOrigins = new Set<HTMLElement>()

export function supportsViewTransitions(): boolean {
  return typeof document !== 'undefined' && typeof document.startViewTransition === 'function'
}

/**
 * View Transitions snapshot the whole document. On a homepage that is already
 * a lot of compositor work, so constrained devices skip the morph and use the
 * measured FLIP (or a fade with no origin) instead.
 */
export function preferCheapMediaTransition(): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  if (
    typeof window.matchMedia === 'function' &&
    (window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      window.matchMedia('(prefers-reduced-data: reduce)').matches)
  ) {
    return true
  }

  const nav = navigator as Navigator & {
    connection?: { saveData?: boolean; effectiveType?: string }
    deviceMemory?: number
  }
  if (nav.connection?.saveData) {
    return true
  }
  const effectiveType = nav.connection?.effectiveType
  if (effectiveType === 'slow-2g' || effectiveType === '2g') {
    return true
  }
  // Fingerprint-rounded; 4 and under is a phone-class GPU for this morph.
  if (typeof nav.deviceMemory === 'number' && nav.deviceMemory <= 4) {
    return true
  }

  return false
}

interface MediaViewTransitionOptions {
  /** The thumbnail the morph starts from (opening) or returns to (closing). */
  origin: HTMLElement | null | undefined
  direction: 'in' | 'out'
  /** The state change that mounts or unmounts the lightbox. */
  update: () => void
  /** Timing preset for the view-transition duration and easing. */
  timing?: LightboxTiming
}

/**
 * Morphs between the thumbnail and the enlarged media with the View Transitions
 * API, and reports whether it ran.
 *
 * Only one element may carry a given `view-transition-name` in a captured state,
 * so ownership is handed over inside the update callback: opening, the thumbnail
 * holds the name for the old snapshot and gives it up before the new one;
 * closing, it takes the name back as the lightbox unmounts.
 *
 * Unlike a shared layout or a measured FLIP, this morphs the thumbnail's
 * *composition* — a cropped tile grows into the full frame — because the browser
 * animates snapshots of the whole document rather than one element's box.
 */
export function runMediaViewTransition({
  origin,
  direction,
  update,
  timing = 'default',
}: MediaViewTransitionOptions): boolean {
  if (!supportsViewTransitions() || inFlight) {
    // The caller applies the change without a morph rather than dropping it.
    return false
  }

  const root = document.documentElement
  const claim = () => {
    if (origin) {
      origin.style.viewTransitionName = MEDIA_VIEW_TRANSITION_NAME
      origin.setAttribute(MORPH_TARGET_ATTRIBUTE, '')
      claimedOrigins.add(origin)
    }
  }

  /**
   * Clears every thumbnail this module marked, not just this origin: a rapid
   * open/close can interleave two claims, and a stranded name would keep
   * painting over the page long after the lightbox is gone.
   */
  const release = () => {
    for (const marked of claimedOrigins) {
      marked.style.viewTransitionName = ''
      marked.removeAttribute(MORPH_TARGET_ATTRIBUTE)
    }
    claimedOrigins.clear()
  }

  inFlight = true
  const directionClass = DIRECTION_CLASS[direction]
  root.classList.add(TRANSITION_CLASS, directionClass)
  applyTimingVars(root, timing)
  if (direction === 'in') {
    claim()
  }

  const transition = document.startViewTransition(() => {
    if (direction === 'in') {
      release()
      flushSync(update)
      return
    }
    flushSync(update)
    claim()
  })

  const cleanup = () => {
    inFlight = false
    root.classList.remove(TRANSITION_CLASS, directionClass)
    clearTimingVars(root)
    release()
    notifySettled()
  }
  void transition.finished.then(cleanup, cleanup)

  return true
}
