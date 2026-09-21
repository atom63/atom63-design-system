/**
 * Geometry for the measured FLIP that grows the enlarged media out of its
 * thumbnail.
 *
 * The thumbnail is a `cover` crop of the photo; the enlarged media is the whole
 * photo, `contain`ed. Mapping one onto the other with a single scale — the
 * ratio of their widths — only lines the two boxes up when they happen to share
 * an aspect ratio. They rarely do, so the first frame of the open showed a
 * smaller, uncropped photo sitting inside where the tile had been, which reads
 * as a jump.
 *
 * So the morph reproduces the crop instead: at rest the media is scaled to
 * *cover* the tile's rect and clipped to it, with the tile's corner radius, and
 * the clip opens up as the scale unwinds. The first frame is then the same
 * pixels the tile was already showing. This is what the View Transitions path
 * gets from the browser for free via `object-fit`; here it is done by hand.
 */

export interface Box {
  height: number
  left: number
  top: number
  width: number
}

export interface OriginMorph {
  /** The media's own layout size, before any ancestor transform. */
  mediaHeight: number
  mediaWidth: number
  /** The thumbnail's box, the state the morph starts and ends at. */
  originHeight: number
  originWidth: number
  /** Translation onto the thumbnail's centre, in the media's local pixels. */
  dx: number
  dy: number
  /** Scale at which the media covers the thumbnail's box. */
  scale: number
  mediaRadius: number
  originRadius: number
  /**
   * Uniform scale the media inherits from its ancestors.
   *
   * A pull-to-dismiss leaves the stage translated and scaled, and the morph
   * runs on an element inside it. Anything written to that element lands in its
   * own coordinate system, so a distance measured in viewport pixels has to be
   * divided back through this to travel as far as it was meant to.
   */
  ancestorScale: number
}

/** Is the thumbnail still somewhere the user can see it? */
function isOnScreen(rect: DOMRect): boolean {
  return (
    rect.width > 0 &&
    rect.bottom > 0 &&
    rect.right > 0 &&
    rect.top < window.innerHeight &&
    rect.left < window.innerWidth
  )
}

function readRadius(element: Element): number {
  const value = Number.parseFloat(getComputedStyle(element).borderTopLeftRadius)
  return Number.isFinite(value) ? value : 0
}

function lerp(from: number, to: number, progress: number): number {
  return from + (to - from) * progress
}

/**
 * Destination box before the image has decoded — contain the tile's aspect in
 * the stage, which is the best guess available while the media has no box.
 */
export function guessedMediaBox(media: HTMLElement, origin: HTMLElement): Box | null {
  const originRect = origin.getBoundingClientRect()
  const stage = media.parentElement
  if (!stage || originRect.width === 0 || originRect.height === 0) {
    return null
  }
  const stageRect = stage.getBoundingClientRect()
  if (stageRect.width <= 0 || stageRect.height <= 0) {
    return null
  }
  const aspect = originRect.width / originRect.height
  let width = stageRect.width
  let height = width / aspect
  if (height > stageRect.height) {
    height = stageRect.height
    width = height * aspect
  }
  return {
    height,
    left: stageRect.left + (stageRect.width - width) / 2,
    top: stageRect.top + (stageRect.height - height) / 2,
    width,
  }
}

/**
 * `null` when there is nothing to grow from, or the thumbnail has scrolled off
 * screen — the caller falls back to a cross-fade.
 */
export function measureOriginMorph(
  media: HTMLElement,
  mediaBox: Box,
  origin: HTMLElement | null
): OriginMorph | null {
  if (!origin || mediaBox.width <= 0 || mediaBox.height <= 0) {
    return null
  }

  const originRect = origin.getBoundingClientRect()
  if (!isOnScreen(originRect)) {
    return null
  }

  // `offsetWidth` is the layout box, which no ancestor transform touches;
  // `mediaBox` is what that box currently looks like on screen. Their ratio is
  // everything the ancestors are doing to this element.
  const layoutWidth = media.offsetWidth
  const layoutHeight = media.offsetHeight
  const measured = layoutWidth > 0 ? mediaBox.width / layoutWidth : 1
  // `offsetWidth` is an integer, so an untransformed element reports a scale a
  // hair off 1. Treating that as real would put sub-pixel drift into the common
  // case, which has nothing to correct.
  const ancestorScale = Math.abs(measured - 1) < 0.01 ? 1 : measured
  const mediaWidth = ancestorScale === 1 ? mediaBox.width : layoutWidth
  const mediaHeight = ancestorScale === 1 ? mediaBox.height : layoutHeight
  if (mediaWidth <= 0 || mediaHeight <= 0) {
    return null
  }

  return {
    ancestorScale,
    dx:
      (originRect.left + originRect.width / 2 - (mediaBox.left + mediaBox.width / 2)) /
      ancestorScale,
    dy:
      (originRect.top + originRect.height / 2 - (mediaBox.top + mediaBox.height / 2)) /
      ancestorScale,
    mediaHeight,
    mediaRadius: readRadius(media),
    mediaWidth,
    originHeight: originRect.height,
    originRadius: readRadius(origin),
    originWidth: originRect.width,
    scale: Math.max(originRect.width / mediaBox.width, originRect.height / mediaBox.height),
  }
}

/**
 * Paints the morph at `progress`: 0 is the thumbnail, 1 is the enlarged media.
 *
 * Sizes are decided in viewport pixels — that is where the thumbnail is — and
 * then converted into the media's own coordinates, because the clip and the
 * radius are written there and every ancestor transform sits between the two.
 */
export function paintOriginMorph(media: HTMLElement, morph: OriginMorph, progress: number): void {
  const scale = lerp(morph.scale, 1, progress)
  const x = lerp(morph.dx, 0, progress)
  const y = lerp(morph.dy, 0, progress)
  const toLocal = morph.ancestorScale * scale
  const visibleWidth = lerp(morph.originWidth, morph.mediaWidth * morph.ancestorScale, progress)
  const visibleHeight = lerp(morph.originHeight, morph.mediaHeight * morph.ancestorScale, progress)
  const insetX = Math.max((morph.mediaWidth - visibleWidth / toLocal) / 2, 0)
  const insetY = Math.max((morph.mediaHeight - visibleHeight / toLocal) / 2, 0)
  const radius =
    lerp(morph.originRadius, morph.mediaRadius * morph.ancestorScale, progress) / toLocal

  media.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`
  media.style.clipPath = `inset(${insetY}px ${insetX}px round ${radius}px)`
}

/** Hands the element back to its stylesheet. */
export function clearOriginMorph(media: HTMLElement): void {
  media.style.transform = ''
  media.style.clipPath = ''
  media.style.transformOrigin = ''
  media.style.willChange = ''
}
