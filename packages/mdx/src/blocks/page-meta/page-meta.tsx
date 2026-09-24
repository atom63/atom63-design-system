import { clsx } from 'clsx'
import type { ReactNode } from 'react'

export type PageMetaProps = {
  children?: ReactNode
  className?: string
  description?: ReactNode
  eyebrow?: ReactNode
  meta?: ReactNode
  title: ReactNode
}

/** Page-level title, description, and metadata that follows MDX provider variants. */
export function PageMeta({
  title,
  description,
  eyebrow,
  meta,
  children,
  className,
}: PageMetaProps) {
  const hasMetaRow = eyebrow || meta

  return (
    <header
      className={clsx(
        'not-mdx mdx-page-meta mx-auto mb-8 flex w-full max-w-xl flex-col items-start gap-4 text-left first:mt-0',
        className
      )}
    >
      {hasMetaRow ? (
        <div className="mdx-page-meta-eyebrow flex flex-wrap items-center justify-start gap-x-2 gap-y-1 font-mono text-xs tracking-wider">
          {eyebrow ? <span className="uppercase">{eyebrow}</span> : null}
          {eyebrow && meta ? <span aria-hidden="true">·</span> : null}
          {meta ? <span>{meta}</span> : null}
        </div>
      ) : null}
      <div className="flex flex-col items-start gap-3">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">{title}</h1>
        {description ? (
          <p className="mdx-text-secondary text-lg leading-relaxed">{description}</p>
        ) : null}
      </div>
      {children}
    </header>
  )
}
