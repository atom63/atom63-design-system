import { clsx } from 'clsx'
import type { ReactNode } from 'react'
import { mdxStyles } from '../../mdx-styles'

export type StatGridProps = {
  children: ReactNode
  className?: string
}

/**
 * MDX `StatGrid` block — a static, SSR-safe responsive grid for laying out
 * `StatCard`s (or any children). Adds prose-context block spacing.
 */
function StatGrid({ children, className }: StatGridProps) {
  return (
    <div
      className={clsx(
        'not-mdx mdx-block grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3',
        mdxStyles.spacing.block,
        className
      )}
      data-mdx-width="wide"
    >
      {children}
    </div>
  )
}

export { StatGrid }
