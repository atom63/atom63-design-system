import { clsx } from 'clsx'
import { MDX_FIGURE_LIGHTBOX_GALLERY_ID } from './constants'
import { FigureLightboxTrigger } from './figure-lightbox-trigger'
import type { PhotoSwipeImageData } from './types'

export { MDX_FIGURE_LIGHTBOX_GALLERY_ID } from './constants'
export { getImageDimensions, getRealImageDimensions, loadImageDimensions } from './dimensions'
export { FigureLightboxHost } from './figure-lightbox-host'
export { FigureLightboxTrigger } from './figure-lightbox-trigger'
export { collectFigureLightboxImages, openFigureLightbox } from './open-lightbox'
export type { PhotoSwipeImageData } from './types'

/**
 * @deprecated Prefer `FigureLightboxHost` + `FigureLightboxTrigger`. Kept for external consumers.
 *
 * Migration: (1) mount `FigureLightboxHost` once at the app root; (2) replace each
 * `PhotoSwipeImage` with a `FigureLightboxTrigger` (button semantics + connected gallery);
 * (3) use `collectFigureLightboxImages` + `openFigureLightbox` for dimension loading and
 * open handling (no per-component state). Preserve existing aspect-ratio logic when porting
 * image grids. Tracked in issue #236.
 */
export type PhotoSwipeGalleryProps = {
  children: React.ReactNode
  className?: string
  galleryId?: string
  /** Unused — images are read from trigger data attributes at click time. */
  images?: PhotoSwipeImageData[]
}

/**
 * Layout wrapper for legacy media blocks. Click handling is delegated to FigureLightboxHost.
 */
export function PhotoSwipeGallery({
  children,
  className,
  galleryId = MDX_FIGURE_LIGHTBOX_GALLERY_ID,
  images: _images,
}: PhotoSwipeGalleryProps) {
  return (
    <section
      aria-label="Image gallery"
      className={clsx('photoswipe-gallery', className)}
      data-gallery-id={galleryId}
    >
      {children}
    </section>
  )
}

/** @deprecated Prefer FigureLightboxTrigger. */
export type PhotoSwipeImageProps = {
  alt: string
  caption?: string
  children?: React.ReactNode
  className?: string
  galleryId?: string
  height?: number
  index: number
  noCursor?: boolean
  src: string
  width?: number
}

/** @deprecated Prefer FigureLightboxTrigger. */
export function PhotoSwipeImage({
  src,
  alt,
  index: _index,
  width = 1200,
  height = 800,
  caption,
  className,
  children,
  noCursor = false,
  galleryId,
}: PhotoSwipeImageProps) {
  return (
    <FigureLightboxTrigger
      alt={alt}
      caption={caption}
      className={clsx(!noCursor && 'cursor-zoom-in', className)}
      galleryId={galleryId}
      height={height}
      src={src}
      width={width}
    >
      {children}
    </FigureLightboxTrigger>
  )
}

/** @deprecated Use openFigureLightbox via FigureLightboxHost. */
export function usePhotoSwipe(_images: PhotoSwipeImageData[]) {
  return {
    openPhotoSwipe: () => {},
    closePhotoSwipe: () => {},
    photoSwipe: null,
  }
}
