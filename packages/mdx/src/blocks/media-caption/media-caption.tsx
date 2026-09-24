import { clsx } from 'clsx'
import type { ReactNode } from 'react'
import { mdxStyles } from '../../mdx-styles'

export type MediaCaptionProps = {
  children: ReactNode
  className?: string
}

/** Consistent caption styling for all media blocks. */
export function MediaCaption({ children, className }: MediaCaptionProps) {
  return (
    <figcaption className={clsx(mdxStyles.content.figcaption, className)}>{children}</figcaption>
  )
}
