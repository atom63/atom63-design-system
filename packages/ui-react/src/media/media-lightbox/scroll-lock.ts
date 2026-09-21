/**
 * A body scroll lock that can outlive the element which took it.
 *
 * The reason it has to is specific and not obvious. A trackpad keeps emitting
 * `wheel` events for up to a second after the fingers lift, so a swipe that
 * dismisses an overlay is still arriving when that overlay unmounts — and the
 * page underneath, now scrollable again, scrolls itself.
 *
 * Cancelling those events does not work. Both engines decide at gesture start
 * whether a wheel sequence is blocking, and then gate blocking dispatch on a
 * hit test against a *committed* region of non-passive wheel handlers
 * (Chromium's `InputHandlerProxy::HandleMouseWheel` /
 * `Layer::SetWheelEventRegion`; WebKit's `ScrollingTree::determineWheelEventProcessing`).
 * The moment the overlay unmounts, that region stops covering the pointer, and
 * momentum events are scrolled on the compositor without the main thread ever
 * being asked. A listener added at dismiss time only rejoins the region at the
 * next commit — several frames too late, which is why cancelling appears to
 * work and then intermittently does not.
 *
 * Holding the lock sidesteps all of it: with no viewport scroll container there
 * is nothing for the compositor to scroll, and `overflow` travels in the same
 * commit as the rest of the layout.
 */

/** Silence that means the coast is over. */
const QUIET_MS = 600
/** No trackpad coasts this long. A backstop, never the normal exit. */
const MAX_MS = 1500

let depth = 0
let previousOverflow: string | null = null
let quietTimer: ReturnType<typeof setTimeout> | null = null
let capTimer: ReturnType<typeof setTimeout> | null = null
let listening: ((event: WheelEvent) => void) | null = null

function engage(): void {
  if (previousOverflow === null) {
    previousOverflow = document.body.style.overflow
  }
  document.body.style.overflow = 'hidden'
}

function releaseIfIdle(): void {
  if (depth > 0 || quietTimer !== null || previousOverflow === null) {
    return
  }
  document.body.style.overflow = previousOverflow
  previousOverflow = null
}

/** Locks the page while the caller holds it. Ref-counted; call the result once. */
export function lockBodyScroll(): () => void {
  if (typeof document === 'undefined') {
    return () => {}
  }
  depth += 1
  engage()

  let released = false
  return () => {
    if (released) {
      return
    }
    released = true
    depth = Math.max(depth - 1, 0)
    releaseIfIdle()
  }
}

/**
 * Keeps the page locked past the caller's own lock, until the wheel falls
 * silent.
 *
 * The listener is deliberately passive: the lock is what stops the scrolling,
 * so there is nothing here to cancel and no cancellability to depend on. It
 * only needs to hear that events are still arriving.
 */
export function holdBodyScrollThroughMomentum(): void {
  if (typeof window === 'undefined') {
    return
  }
  engage()

  const stop = () => {
    if (quietTimer) {
      clearTimeout(quietTimer)
      quietTimer = null
    }
    if (capTimer) {
      clearTimeout(capTimer)
      capTimer = null
    }
    if (listening) {
      window.removeEventListener('wheel', listening, { capture: true })
      listening = null
    }
    releaseIfIdle()
  }

  const extend = () => {
    if (quietTimer) {
      clearTimeout(quietTimer)
    }
    quietTimer = setTimeout(stop, QUIET_MS)
  }

  if (listening) {
    extend()
    return
  }

  listening = extend
  window.addEventListener('wheel', listening, { capture: true, passive: true })
  capTimer = setTimeout(stop, MAX_MS)
  extend()
}
