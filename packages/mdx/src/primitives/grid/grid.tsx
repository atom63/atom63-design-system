import { clsx } from 'clsx'
import type { CSSProperties, ReactNode } from 'react'
import { gapClass, type LayoutGap } from '../layout-tokens'

export type GridProps = {
  children: ReactNode
  className?: string
  /** CSS grid-template-columns value, applied at the `md` breakpoint. */
  cols?: string
  gap?: LayoutGap
}

export function Grid({ children, className, cols = '1fr 1fr', gap = 'md' }: GridProps) {
  return (
    <div
      data-grid=""
      style={{ '--mdx-grid-cols': cols } as CSSProperties}
      className={clsx(
        'grid grid-cols-1',
        gapClass[gap],
        'md:[grid-template-columns:var(--mdx-grid-cols)]',
        className
      )}
    >
      {children}
    </div>
  )
}
