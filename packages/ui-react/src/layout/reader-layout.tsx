import type { ReactNode } from 'react'
import { cn } from '../lib/cn'

export interface ReaderLayoutProps {
  aside?: ReactNode
  asideClassName?: string
  children: ReactNode
  className?: string
  contentClassName?: string
  /** Keep the aside column even with no aside, so the content measure holds across pages. */
  reserveAside?: boolean
}

export function ReaderLayout({
  aside,
  asideClassName,
  children,
  className,
  contentClassName,
  reserveAside = false,
}: ReaderLayoutProps) {
  return (
    <div className={cn('mx-auto flex w-full max-w-5xl', className)} data-slot="reader-layout">
      <article
        className={cn(
          'min-w-0 flex-1 space-y-8 px-4 pt-8 pb-8 sm:px-6 lg:px-8 xl:max-w-4xl',
          contentClassName
        )}
        data-slot="reader-layout-content"
      >
        {children}
      </article>
      {aside || reserveAside ? (
        <div
          aria-hidden={aside ? undefined : true}
          className={cn('hidden w-64 shrink-0 px-4 pt-8 xl:block', asideClassName)}
          data-slot="reader-layout-aside"
        >
          {aside}
        </div>
      ) : null}
    </div>
  )
}
