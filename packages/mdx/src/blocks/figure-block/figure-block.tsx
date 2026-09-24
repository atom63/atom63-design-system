import { clsx } from 'clsx'
import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { MDX_FIGURE_LIGHTBOX_GALLERY_ID } from '../../lightbox/constants'
import { getImageDimensions, getRealImageDimensions } from '../../lightbox/dimensions'
import { FigureLightboxTrigger } from '../../lightbox/figure-lightbox-trigger'
import { MediaFigure, MediaFrame, type MediaSpacing } from '../../foundations/media/media-figure'
import { createSlot, pickSlot } from '../../primitives/slots'

const aspectRatioClasses = {
  '1/1': 'aspect-square object-cover',
  '4/3': 'aspect-[4/3] object-cover',
  '3/4': 'aspect-[3/4] object-cover',
  '16/9': 'aspect-video object-cover',
  '9/16': 'aspect-[9/16] object-cover',
} as const

const FigureCaptionSlot = createSlot('figure-caption')
const FigureAsideSlot = createSlot('figure-aside')

export type FigureBlockProps = {
  alt: string
  aspectRatio?: keyof typeof aspectRatioClasses
  bordered?: boolean
  caption?: string
  className?: string
  /** Click-to-zoom; multiple figures on a page share one connected gallery. */
  enableLightbox?: boolean
  /** Gallery id for connected lightbox (default: all FigureBlocks on the page). */
  lightboxGalleryId?: string
  loading?: 'eager' | 'lazy'
  spacing?: MediaSpacing
  src: string
  children?: ReactNode
}

/**
 * Portable figure + image for MDX content.
 * Requires FigureLightboxHost on the MDX provider (included in MDXContentProvider).
 */
export function FigureBlock({
  src,
  alt,
  caption,
  aspectRatio,
  bordered = true,
  spacing = 'default',
  loading = 'lazy',
  enableLightbox = true,
  lightboxGalleryId = MDX_FIGURE_LIGHTBOX_GALLERY_ID,
  className,
  children,
}: FigureBlockProps) {
  const [dimensions, setDimensions] = useState(() => getImageDimensions(aspectRatio))

  useEffect(() => {
    if (!enableLightbox) {
      return
    }

    let cancelled = false

    const loadDimensions = async () => {
      const next = await getRealImageDimensions(src, aspectRatio)
      if (!cancelled && next.width > 0 && next.height > 0) {
        setDimensions(next)
      }
    }

    // getRealImageDimensions() catches its own failures and falls back to the
    // aspect-ratio estimate, so this promise can never reject.
    void loadDimensions()

    return () => {
      cancelled = true
    }
  }, [enableLightbox, src, aspectRatio])

  const slotCaption = pickSlot(children, FigureCaptionSlot)
  const slotAside = pickSlot(children, FigureAsideSlot)

  const image = (
    <img
      alt={alt}
      className={clsx('mt-0 w-full rounded-xl', aspectRatio && aspectRatioClasses[aspectRatio])}
      decoding="async"
      loading={loading}
      src={src}
    />
  )

  const media = enableLightbox ? (
    <MediaFrame bordered={bordered}>
      <FigureLightboxTrigger
        alt={alt}
        caption={caption}
        className="overflow-hidden rounded-xl"
        galleryId={lightboxGalleryId}
        height={dimensions.height}
        src={src}
        width={dimensions.width}
      >
        {image}
      </FigureLightboxTrigger>
    </MediaFrame>
  ) : (
    <MediaFrame bordered={bordered}>{image}</MediaFrame>
  )

  return (
    <MediaFigure
      aside={slotAside}
      caption={slotCaption ?? caption}
      className={className}
      spacing={spacing}
    >
      {media}
    </MediaFigure>
  )
}

FigureBlock.Caption = FigureCaptionSlot
FigureBlock.Aside = FigureAsideSlot
