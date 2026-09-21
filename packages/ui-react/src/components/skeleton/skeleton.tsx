import type * as React from 'react'

import { cn } from '../../lib/cn'

/* Skeleton — a presentational loading placeholder (the muted animated block).
   Size it with className/style; renders a `<div>` with data-slot="skeleton". */
export function Skeleton({ className, ...props }: React.ComponentProps<'div'>): React.ReactElement {
  return (
    <div
      aria-hidden="true"
      className={cn('a63-Skeleton', className)}
      data-slot="skeleton"
      {...props}
    />
  )
}
