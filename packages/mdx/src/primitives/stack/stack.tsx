import { clsx } from 'clsx'
import type { ReactNode } from 'react'
import { gapClass, type LayoutGap } from '../layout-tokens'

export type StackProps = {
  children: ReactNode
  className?: string
  gap?: LayoutGap
}

export function Stack({ children, className, gap = 'md' }: StackProps) {
  return (
    <div data-stack-gap={gap} className={clsx('flex flex-col', gapClass[gap], className)}>
      {children}
    </div>
  )
}
