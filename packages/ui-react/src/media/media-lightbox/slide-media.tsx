import type { ReactElement } from 'react'
import { cn } from '../../lib/cn'
import type { MediaLightboxItem } from './types'

/**
 * The media's own box. Height comes from a variable the lightbox sets so the
 * picture fills the stage above the dock rather than a guessed viewport share.
 */
const MEDIA_BOX =
  'max-h-[var(--a63-media-lightbox-media-h,100%)] max-w-[min(92vw,1400px)] object-contain'

/** Matches the media box so a `srcSet` can pick a width instead of the wallpaper's native pixels. */
export const LIGHTBOX_IMAGE_SIZES = 'min(92vw, 1400px)'

/**
 * Resolves the source the lightbox should show for the caller's appearance map.
 */
export function resolveMediaSrc(
  item: MediaLightboxItem,
  appearance: 'light' | 'dark' | undefined
): string | undefined {
  if (item.lightSrc && item.darkSrc) {
    return appearance === 'light' ? item.lightSrc : item.darkSrc
  }
  return item.src ?? item.lightSrc ?? item.darkSrc
}

/**
 * The small stand-in for the same picture, if the caller supplied one.
 *
 * Mirrors `resolveMediaSrc` so a light/dark pair stays a light/dark pair at
 * thumbnail size — a strip that keeps showing the dark variant after the photo
 * has been switched to light is worse than no thumbnail at all.
 */
export function resolveThumbSrc(
  item: MediaLightboxItem,
  appearance: 'light' | 'dark' | undefined
): string | undefined {
  if (item.thumbLightSrc && item.thumbDarkSrc) {
    return appearance === 'light' ? item.thumbLightSrc : item.thumbDarkSrc
  }
  return item.thumbSrc ?? item.thumbLightSrc ?? item.thumbDarkSrc
}

/** Is there anything to show for this item at all? */
export function hasMedia(item: MediaLightboxItem, src: string | undefined): boolean {
  if (item.render) {
    return true
  }
  if (item.kind === 'video') {
    return Boolean(item.sources?.length)
  }
  return Boolean(src)
}

/**
 * The media itself: an image, a video, or whatever the caller handed over.
 *
 * The lightbox has no opinion about `render` content beyond boxing it, which is
 * what makes a 3D viewer or an embed as ordinary here as a photo.
 */
export function SlideMedia({
  active,
  filled,
  item,
  src,
  thumbSrc,
}: {
  active: boolean
  /** The frame knows its own shape, so the media can simply fill it. */
  filled?: boolean
  item: MediaLightboxItem
  src: string | undefined
  thumbSrc?: string
}): ReactElement | null {
  if (item.render) {
    return (
      <div className={cn(MEDIA_BOX, 'overflow-auto')} data-slot="media-lightbox-custom">
        {item.render}
      </div>
    )
  }

  if (item.kind === 'video') {
    if (!item.sources?.length) {
      return null
    }
    return (
      // eslint-disable-next-line jsx-a11y/media-has-caption -- captions are the caller's to supply through `tracks`; nothing here can invent them.
      <video
        aria-label={item.alt}
        className={MEDIA_BOX}
        controls
        data-slot="media-lightbox-video"
        // Controls are the point of a video; the gallery's own drag and pull
        // gestures stand down over it.
        data-a63-no-drag=""
        playsInline
        poster={item.poster}
        preload={active ? 'metadata' : 'none'}
      >
        {item.sources.map(source => (
          <source key={source.src} src={source.src} type={source.type} />
        ))}
      </video>
    )
  }

  if (!src) {
    return null
  }

  const photo = (
    <img
      alt={item.alt}
      // Positioned when it shares the box with a placeholder: a positioned
      // element paints above unpositioned content in the same stacking context
      // whatever the DOM order, so leaving this one static buried the real
      // photograph under its own thumbnail.
      className={filled ? 'absolute inset-0 size-full object-contain' : MEDIA_BOX}
      data-slot="media-lightbox-image"
      decoding="async"
      draggable={false}
      fetchPriority={active ? 'high' : 'low'}
      loading={active ? 'eager' : 'lazy'}
      sizes={item.sizes ?? LIGHTBOX_IMAGE_SIZES}
      src={src}
      srcSet={item.srcSet}
    />
  )

  if (!filled || !thumbSrc || thumbSrc === src) {
    return photo
  }

  return (
    <>
      {/*
        The same picture at a couple of kilobytes, filling the frame the photo
        is about to fill. It needs no fading out: the photo lands on exactly
        this rect and covers it, so the only thing the eye catches is the
        picture getting sharper.
      */}
      <img
        alt=""
        aria-hidden
        className="absolute inset-0 size-full object-contain"
        data-slot="media-lightbox-placeholder"
        decoding="async"
        draggable={false}
        src={thumbSrc}
      />
      {photo}
    </>
  )
}
