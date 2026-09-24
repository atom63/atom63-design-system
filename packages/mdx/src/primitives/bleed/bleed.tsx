import { clsx } from 'clsx'
import type { ReactNode } from 'react'

export type BleedProps = {
  children: ReactNode
  className?: string
}

export function Bleed({ children, className }: BleedProps) {
  return (
    <div
      data-bleed=""
      className={clsx('relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2', className)}
    >
      {children}
    </div>
  )
}
