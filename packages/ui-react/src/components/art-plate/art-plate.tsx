import {
  type ArtPlateSafeArea,
  type ArtPlateSize,
  type ArtPlateTone,
  type ArtPlateVeil,
  artPlateContract,
} from '@atom63/ui-foundation'
import type * as React from 'react'

import { cn } from '../../lib/cn'
import { Image } from '../../media/image'

/** A focal point in the picture, 0–1 from the start (x) and the top (y) edge. */
export interface ArtPlateFocus {
  x: number
  y: number
}

export type ArtPlateProps = Omit<React.ComponentProps<'div'>, 'children'> & {
  /** Describes the picture; pass `''` when it is purely decorative. */
  alt: string
  children?: React.ReactNode
  /** Point of the picture kept in frame on wide screens. Defaults to the centre. */
  focus?: ArtPlateFocus
  /** Point kept in frame below the medium breakpoint. Defaults to `focus`. */
  focusMobile?: ArtPlateFocus
  /** Slow scroll-driven drift of the picture (transform only, off under reduced motion). */
  parallax?: boolean
  /** Above the fold: load eagerly with high fetch priority, so the plate can be the LCP element. */
  priority?: boolean
  safeArea?: ArtPlateSafeArea
  size?: ArtPlateSize
  /** Layout width hint for `srcSet`. Defaults to `100vw`. */
  sizes?: string
  /** The wide picture. */
  src: string
  /** Width candidates of the wide picture, such as `plate-960.webp 960w, plate-1920.webp 1920w`. */
  srcSet?: string
  /** An art-directed picture for phones (a URL or a `srcSet`), used below the medium breakpoint. */
  srcMobile?: string
  tone?: ArtPlateTone
  veil?: ArtPlateVeil
}

const MOBILE_QUERY = '(max-width: 767px)'

const percent = (value: number) => `${Math.min(Math.max(value, 0), 1) * 100}%`

/**
 * ArtPlate is a full-bleed picture that owns its crop, with a content region in the picture's
 * calm area: a landing hero, a section band or a portfolio cover. It is not an inline figure
 * (use `Image`) or a card thumbnail (use `CardMedia`). Pair it with `LayeredScene` to float
 * product UI and a foreground cut-out over the picture.
 */
export function ArtPlate({
  alt,
  children,
  className,
  focus,
  focusMobile,
  parallax = false,
  priority = false,
  safeArea = artPlateContract.defaultSafeArea,
  size = artPlateContract.defaultSize,
  sizes = '100vw',
  src,
  srcMobile,
  srcSet,
  style,
  tone = artPlateContract.defaultTone,
  veil = artPlateContract.defaultVeil,
  ...props
}: ArtPlateProps): React.ReactElement {
  const wide = focus ?? { x: 0.5, y: 0.5 }
  const narrow = focusMobile ?? wide
  const focusStyle = {
    '--a63-art-plate-focus': `${percent(wide.x)} ${percent(wide.y)}`,
    '--a63-art-plate-focus-mobile': `${percent(narrow.x)} ${percent(narrow.y)}`,
  } as React.CSSProperties

  return (
    <div
      className={cn('a63-ArtPlate', className)}
      data-parallax={parallax ? '' : undefined}
      data-safe-area={safeArea}
      data-size={size}
      data-slot="art-plate"
      data-tone={tone}
      data-veil={veil}
      style={{ ...focusStyle, ...style }}
      {...props}
    >
      <div className="a63-ArtPlate-image" data-slot="art-plate-image">
        <Image
          alt={alt}
          aspectRatio="fill"
          className="h-full"
          fetchPriority={priority ? 'high' : 'auto'}
          priority={priority}
          showSkeleton={false}
          sizes={sizes}
          sources={srcMobile ? [{ media: MOBILE_QUERY, srcSet: srcMobile }] : undefined}
          src={src}
          srcSet={srcSet ?? src}
        />
      </div>
      {children === undefined ? null : (
        <div className="a63-ArtPlate-content" data-slot="art-plate-content">
          {children}
        </div>
      )}
    </div>
  )
}
