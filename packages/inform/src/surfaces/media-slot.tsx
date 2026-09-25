import type { ReactElement, ReactNode } from 'react'

import { cn } from '../lib/cn'

export type InformThumbnailProps = {
  children: ReactNode
  className?: string
}

/**
 * Bounded leading thumbnail, for surfaces whose height is load-bearing.
 *
 * A flyout's height feeds the stack's offsets, and three cards have to fit a
 * phone: full-width 16:9 media would add ~198px per card at this width, so
 * three would overflow a laptop viewport, never mind a phone. A fixed square
 * keeps the card's height within a few pixels of its text.
 */
export function InformThumbnail({ children, className }: InformThumbnailProps): ReactElement {
  return (
    <span className={cn('a63-InformThumbnail', className)} data-slot="inform-thumbnail">
      {children}
    </span>
  )
}

export type InformMediaProps = {
  children: ReactNode
  className?: string
}

/**
 * Full-width media, for surfaces that can afford the height.
 *
 * The aspect ratio is fixed so the surface does not resize when the image
 * finally decodes — in a dialog that would shift the text under the pointer.
 */
export function InformMedia({ children, className }: InformMediaProps): ReactElement {
  return (
    <div className={cn('a63-InformMedia', className)} data-slot="inform-media">
      {children}
    </div>
  )
}
