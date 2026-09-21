/**
 * Reading and writing the slide track along the *inline* axis.
 *
 * `scrollLeft` is a physical-axis property, and in a right-to-left track its
 * origin moves to the right edge: the first slide sits at `0` and later slides
 * run negative. Index arithmetic written against the physical axis therefore
 * asks for a positive offset the browser clamps straight back to zero — the
 * caption says slide seven while the picture is still slide one, with no error
 * anywhere to notice.
 *
 * Everything here works in inline space, where the first slide is always at 0
 * and later slides are always positive, and converts at the boundary.
 */

export function isRtlTrack(track: HTMLElement): boolean {
  return getComputedStyle(track).direction === 'rtl'
}

/**
 * Which way the horizontal arrows move.
 *
 * Right means "onward" only in a left-to-right reading order; mirroring it is
 * the whole reason a right-to-left reader can use the gallery at all. The
 * vertical arrows never mirror — up is not a reading direction.
 */
export function arrowIndexDelta(key: string, rtl: boolean): number | undefined {
  if (key === 'ArrowRight') {
    return rtl ? -1 : 1
  }
  if (key === 'ArrowLeft') {
    return rtl ? 1 : -1
  }
  return undefined
}
