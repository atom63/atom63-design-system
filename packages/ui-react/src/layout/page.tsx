import type { ReactNode } from 'react'
import { cn } from '../lib/cn'

export interface PageProps {
  children: ReactNode
  className?: string
  id?: string
  noPadding?: boolean
}

export function Page({ children, className, id, noPadding = false }: PageProps) {
  return (
    <main
      className={cn('min-h-full', !noPadding && 'pt-8 pb-20', className)}
      data-slot="page"
      id={id}
    >
      {children}
    </main>
  )
}
