import { useEffect, useState } from 'react'

/**
 * The aspect ratio of a picture, as early as anything can know it.
 *
 * Nothing in the lightbox can lay out a placeholder without this. The media box
 * is sized by the photo itself, so before the file arrives there is no box — a
 * stand-in told to fill its container collapses it to nothing, because the
 * container was waiting on the stand-in. Something outside that loop has to
 * supply the shape.
 *
 * The thumbnail is that something. It is the same picture, so it has the same
 * ratio, and at a couple of kilobytes it is usually already decoded — the strip
 * fetched it — which makes `complete` true on the first effect and the shape
 * known before the first paint. The full-size file then refines it, because a
 * thumbnail's integer dimensions round the ratio by a fraction of a percent.
 */
export function useMediaAspect(
  thumbSrc: string | undefined,
  src: string | undefined
): number | undefined {
  const [aspect, setAspect] = useState<number | undefined>(undefined)

  useEffect(() => {
    if (typeof Image === 'undefined' || (!thumbSrc && !src)) {
      setAspect(undefined)
      return
    }

    let cancelled = false
    const detachers: (() => void)[] = []

    // The thumbnail answers first and the photo answers better, so let both run
    // and keep whichever is more authoritative.
    const watch = (candidate: string | undefined, authoritative: boolean) => {
      if (!candidate) {
        return
      }
      const probe = new Image()
      const read = () => {
        if (cancelled || probe.naturalWidth <= 0 || probe.naturalHeight <= 0) {
          return
        }
        const ratio = probe.naturalWidth / probe.naturalHeight
        setAspect(current => (current === undefined || authoritative ? ratio : current))
      }
      probe.addEventListener('load', read)
      detachers.push(() => {
        probe.removeEventListener('load', read)
      })
      probe.src = candidate
      if (probe.complete) {
        read()
      }
    }

    watch(thumbSrc, false)
    watch(src, true)

    return () => {
      cancelled = true
      for (const detach of detachers) {
        detach()
      }
    }
  }, [src, thumbSrc])

  return aspect
}
