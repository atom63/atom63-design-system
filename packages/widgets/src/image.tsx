import { Skeleton } from '@atom63/ui-react'
import { useReducedMotion } from 'motion/react'
import { useEffect, useState } from 'react'
import { cn } from './utils'

type WidgetImageAspect = '1/1' | '16/9' | '2/3' | 'none'

interface WidgetImageProps {
  alt: string
  aspectRatio?: WidgetImageAspect
  className?: string
  containerClassName?: string
  /**
   * Crossfade when `src` swaps after the first painted frame (shuffle / fan tiles).
   * First paint still mounts immediately; only later swaps wait on decode.
   */
  crossfade?: boolean
  /** Prefer eager decode for above-the-fold / widget tiles that swap on shuffle. */
  priority?: boolean
  /**
   * Callback with the painted element, for canvas work that needs pixels —
   * dominant-color extraction, for instance.
   *
   * This is the element already on screen, so sampling it issues no second
   * request and composes with lazy loading. Prefer it over re-fetching the URL
   * (`useExtractColor`), which pulls every full-size source in a lazy grid.
   * Cross-origin sources are loaded without `crossOrigin`, so sampling one
   * taints the canvas and the extractor reports no colour rather than throwing.
   */
  onLoadedImage?: (image: HTMLImageElement) => void
  showSkeleton?: boolean
  src?: string
}

/**
 * The aspect ratio is a `data-aspect` attribute that the stylesheet maps to
 * `aspect-ratio` (`none` sets none), so a consumer class can still override it.
 */
export function WidgetImage({
  alt,
  aspectRatio = '16/9',
  className,
  containerClassName,
  crossfade = false,
  onLoadedImage,
  priority = false,
  showSkeleton = true,
  src,
}: WidgetImageProps) {
  const reduceMotion = useReducedMotion()
  const [displaySrc, setDisplaySrc] = useState<string | undefined>(src)
  const [incomingSrc, setIncomingSrc] = useState<string | undefined>(undefined)
  const [incomingShown, setIncomingShown] = useState(false)
  const [isLoading, setIsLoading] = useState(Boolean(src))
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    if (!src) {
      setDisplaySrc(undefined)
      setIncomingSrc(undefined)
      setIncomingShown(false)
      setIsLoading(false)
      setHasError(false)
      return
    }

    if (src === displaySrc || src === incomingSrc) {
      setHasError(false)
      return
    }

    const canCrossfade = crossfade && !reduceMotion && Boolean(displaySrc)

    // Default path mounts immediately so covers stay in the DOM (album 1×1,
    // content cards). Crossfade waits on decode so the outgoing frame holds.
    if (!canCrossfade) {
      setDisplaySrc(src)
      setIncomingSrc(undefined)
      setIncomingShown(false)
      setIsLoading(true)
      setHasError(false)
      return
    }

    let cancelled = false
    const promote = () => {
      if (cancelled) {
        return
      }
      setIncomingSrc(src)
      setIncomingShown(false)
      setIsLoading(false)
      setHasError(false)
    }

    const preload = new window.Image()
    preload.decoding = 'async'
    preload.onload = promote
    preload.onerror = () => {
      if (cancelled) {
        return
      }
      // Keep the held frame if the next decode fails.
      setIsLoading(false)
    }
    preload.src = src

    if (preload.complete && preload.naturalWidth > 0) {
      promote()
    }

    return () => {
      cancelled = true
    }
  }, [crossfade, displaySrc, incomingSrc, reduceMotion, src])

  useEffect(() => {
    if (!incomingSrc) {
      return
    }

    const frame = window.requestAnimationFrame(() => {
      setIncomingShown(true)
    })
    return () => window.cancelAnimationFrame(frame)
  }, [incomingSrc])

  if (!src || (hasError && !displaySrc && !incomingSrc)) {
    return (
      <div className={cn('a63-WidgetImage-empty', containerClassName)} data-aspect={aspectRatio}>
        No image provided
      </div>
    )
  }

  const showSkeletonOverlay = Boolean(showSkeleton && isLoading && !displaySrc && !incomingSrc)
  const paintedSrc = incomingSrc ?? displaySrc

  return (
    <div
      className={cn('a63-WidgetImage', containerClassName)}
      data-aspect={aspectRatio}
      data-slot="widget-image"
      data-widget-image-crossfade={crossfade ? 'true' : undefined}
      data-widget-image-loading={isLoading ? 'true' : undefined}
      data-widget-image-src={paintedSrc}
    >
      {showSkeletonOverlay ? <Skeleton className="a63-WidgetImage-skeleton" /> : null}
      {displaySrc ? (
        <img
          alt={incomingSrc ? '' : alt}
          aria-hidden={incomingSrc ? true : undefined}
          className={cn('a63-WidgetImage-img', className)}
          decoding={priority ? 'sync' : 'async'}
          loading={priority ? 'eager' : 'lazy'}
          onError={() => {
            if (incomingSrc) {
              return
            }
            setHasError(true)
            setIsLoading(false)
          }}
          onLoad={event => {
            setIsLoading(false)
            onLoadedImage?.(event.currentTarget)
          }}
          src={displaySrc}
        />
      ) : null}
      {incomingSrc ? (
        <img
          alt={alt}
          className={cn('a63-WidgetImage-img', 'a63-WidgetImage-incoming', className)}
          data-shown={incomingShown ? 'true' : undefined}
          decoding={priority ? 'sync' : 'async'}
          loading={priority ? 'eager' : 'lazy'}
          onLoad={event => onLoadedImage?.(event.currentTarget)}
          onTransitionEnd={event => {
            if (event.propertyName !== 'opacity') {
              return
            }
            setDisplaySrc(incomingSrc)
            setIncomingSrc(undefined)
            setIncomingShown(false)
            setIsLoading(false)
          }}
          src={incomingSrc}
        />
      ) : null}
    </div>
  )
}
