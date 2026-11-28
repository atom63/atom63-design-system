'use client'

import type { ReactNode } from 'react'
import { cn } from '../lib/cn'
import { useGridChrome } from './grid'
import { type ContainerMaxWidth, containerFrameClassName } from './max-width'

export type { ContainerMaxWidth }

export type ContainerPadding = 'all' | 'x' | 'none'

export type ContainerChrome = 'none' | 'grid'

/** Space between direct children, on the spacing scale (`gap-*`). */
export type ContainerGap = 0 | 2 | 4 | 6 | 8 | 10 | 12

export interface ContainerProps {
  children: ReactNode
  /**
   * In-flow vertical rails (`border-x`). Skipped automatically when nested under
   * {@link GridChrome} with `fixedRails` so lines don’t double up.
   * @default 'none'
   */
  chrome?: ContainerChrome
  className?: string
  /**
   * Space between direct children, as a spacing-scale step.
   * @default 8
   */
  gap?: ContainerGap
  maxWidth?: ContainerMaxWidth
  /**
   * Inline (and for `all`, block) padding. It does not add the safe-area
   * insets: `Page` or the app shell owns those.
   * @default 'all'
   */
  padding?: ContainerPadding
}

const gapStyles: Record<ContainerGap, string> = {
  0: 'gap-0',
  2: 'gap-2',
  4: 'gap-4',
  6: 'gap-6',
  8: 'gap-8',
  10: 'gap-10',
  12: 'gap-12',
}

const paddingStyles: Record<ContainerPadding, string> = {
  all: 'p-6',
  x: 'px-6',
  none: 'p-0',
}

export function Container({
  children,
  chrome = 'none',
  gap = 8,
  maxWidth = 'default',
  padding = 'all',
  className,
}: ContainerProps) {
  const grid = useGridChrome()
  const showGridBorder = chrome === 'grid' && !grid?.fixedRails

  return (
    <div
      className={cn(
        'flex min-w-0 flex-col',
        gapStyles[gap],
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
              borderInlineEndWidth: 'var(--a63-grid-hairline-width, 1px)',
              borderInlineStartWidth: 'var(--a63-grid-hairline-width, 1px)',
            }
          : undefined
      }
    >
      {children}
    </div>
  )
}
