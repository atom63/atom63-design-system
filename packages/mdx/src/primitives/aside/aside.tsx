import { clsx } from 'clsx'
import type { ReactNode } from 'react'

export type AsideSide = 'left' | 'right'

export type AsideProps = {
  children: ReactNode
  className?: string
  side?: AsideSide
}

const sideStyles: Record<AsideSide, string> = {
  right: 'xl:float-right xl:clear-right xl:-me-64 xl:ms-8 xl:w-56',
  left: 'xl:float-left xl:clear-left xl:-ms-64 xl:me-8 xl:w-56',
}

export function Aside({ children, className, side = 'right' }: AsideProps) {
  return (
    <aside
      data-aside-side={side}
      className={clsx(
        'text-muted-foreground my-4 text-sm leading-relaxed',
        sideStyles[side],
        className
      )}
    >
      {children}
    </aside>
  )
}
