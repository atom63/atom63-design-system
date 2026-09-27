/**
 * Keeping the tile the lightbox returns to where the closing morph can see it.
 *
 * A gallery opened from a scrolling row can be paged far past the tile it
 * opened from. The tile for the photo on screen is then outside the row's
 * scroll viewport, and a morph aimed at it flies into a clipped or hidden box.
 * The fix is the one a native viewer uses: keep the timeline behind the viewer
 * in step, and check that the target is really visible before morphing to it.
 */

/**
 * Scrolls every scroll container around `element` just enough to show it.
 *
 * Instant, overriding any `scroll-behavior: smooth`: the lightbox covers the
 * page, so the jump is never seen, and a smooth scroll would still be moving
 * the tile when the morph measures it. The body scroll lock only sets
 * `overflow: hidden`, which stops the user scrolling, not a script.
 */
export function revealOrigin(element: HTMLElement | null | undefined): void {
  // `scrollIntoView` is missing in jsdom and any non-browser host.
  element?.scrollIntoView?.({ behavior: 'instant', block: 'nearest', inline: 'nearest' })
}

/**
 * The tile a closing morph should land on: revealed first, then `null` if an
 * `overflow` ancestor still cuts it off, in which case the caller cross-fades.
 * Being inside the viewport is not enough: a tile scrolled out of its row is
 * still on screen, only hidden by the row.
 */
export function revealReturnTarget(origin: HTMLElement | null | undefined): HTMLElement | null {
  if (!origin) {
    return null
  }
  revealOrigin(origin)
  return isClippedByAncestor(origin) ? null : origin
}

/** Subpixel layout leaves a tile a fraction of a pixel short of its container. */
const CLIP_TOLERANCE = 1

function clips(element: Element): boolean {
  const style = getComputedStyle(element)
  return style.overflowX !== 'visible' || style.overflowY !== 'visible'
}

/**
 * Whether an `overflow` ancestor cuts any of `element` off.
 *
 * `html` and `body` are skipped: their overflow applies to the viewport, which
 * the caller checks on its own, and the body scroll lock sets `overflow:
 * hidden` on `body` without clipping anything.
 */
export function isClippedByAncestor(element: Element): boolean {
  const rect = element.getBoundingClientRect()
  const root = element.ownerDocument.documentElement
  const body = element.ownerDocument.body
  for (
    let ancestor = element.parentElement;
    ancestor && ancestor !== root && ancestor !== body;
    ancestor = ancestor.parentElement
  ) {
    if (!clips(ancestor)) {
      continue
    }
    const bounds = ancestor.getBoundingClientRect()
    if (
      rect.left < bounds.left - CLIP_TOLERANCE ||
      rect.top < bounds.top - CLIP_TOLERANCE ||
      rect.right > bounds.right + CLIP_TOLERANCE ||
      rect.bottom > bounds.bottom + CLIP_TOLERANCE
    ) {
      return true
    }
  }
  return false
}
