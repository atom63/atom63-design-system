import type { ReactNode } from 'react'
import { cn } from '../lib/cn'
import { useGridChrome } from './grid'
import { type ContainerMaxWidth, containerFrameClassName } from './max-width'

export type { ContainerMaxWidth }

export type ContainerPadding = 'all' | 'x' | 'none'

export type ContainerChrome = 'none' | 'grid'

export interface ContainerProps {
  children: ReactNode
  /**
   * In-flow vertical rails (`border-x`). Skipped automatically when nested under
   * {@link GridChrome} with `fixedRails` so lines don’t double up.
   * @default 'none'
   */
  chrome?: ContainerChrome
  className?: string
  maxWidth?: ContainerMaxWidth
  padding?: ContainerPadding
}

const paddingStyles: Record<ContainerPadding, string> = {
  all: 'p-6',
  x: 'px-6',
  none: 'p-0',
}

export function Container({
  children,
  chrome = 'none',
  maxWidth = 'default',
  padding = 'all',
  className,
}: ContainerProps) {
  const grid = useGridChrome()
  const showGridBorder = chrome === 'grid' && !grid?.fixedRails

  return (
    <div
      className={cn(
        'flex min-w-0 flex-col gap-8',
        containerFrameClassName(maxWidth),
        paddingStyles[padding],
        showGridBorder &&
          'relative border-y-0 border-[color:var(--a63-grid-line-color,var(--a63-border-subtle))]',
        showGridBorder && (grid?.lineStyle === 'solid' ? 'border-solid' : 'border-dashed'),
        className
      )}
      data-chrome={showGridBorder ? 'grid' : undefined}
      data-slot="container"
      style={
        showGridBorder
          ? {
              borderLeftWidth: 'var(--a63-grid-hairline-width, 1px)',
              borderRightWidth: 'var(--a63-grid-hairline-width, 1px)',
            }
          : undefined
      }
    >
      {children}
    </div>
  )
}
