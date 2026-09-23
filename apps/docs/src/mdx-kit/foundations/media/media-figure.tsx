import { clsx } from 'clsx'
import type { ReactNode } from 'react'
import { mdxStyles } from '../../mdx-styles'
import { MediaCaption } from '../../blocks/media-caption'

export const mediaSpacingClasses = {
  none: '',
  sm: mdxStyles.spacing.mediaSm,
  default: mdxStyles.spacing.media,
  lg: mdxStyles.spacing.mediaLg,
} as const

export type MediaSpacing = keyof typeof mediaSpacingClasses

export type MediaFrameProps = {
  bordered?: boolean
  children: ReactNode
  className?: string
}

export function MediaFrame({ bordered = true, children, className }: MediaFrameProps) {
  return (
    <div className={clsx('overflow-hidden rounded-xl', bordered && 'mdx-media-framed', className)}>
      {children}
    </div>
  )
}

export type MediaFigureProps = {
  aside?: ReactNode
  caption?: ReactNode
  children: ReactNode
  className?: string
  spacing?: MediaSpacing
}

export function MediaFigure({
  aside,
  caption,
  children,
  className,
  spacing = 'default',
}: MediaFigureProps) {
  return (
    <figure
      className={clsx('not-mdx', mediaSpacingClasses[spacing], className)}
      data-mdx-width="wide"
      data-media=""
    >
      {children}
      {caption ? <MediaCaption>{caption}</MediaCaption> : null}
      {aside ? (
        <aside
          className="mdx-text-secondary mt-2 text-center text-xs leading-relaxed"
          data-slot="aside"
        >
          {aside}
        </aside>
      ) : null}
    </figure>
  )
}
