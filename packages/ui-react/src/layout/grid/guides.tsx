import type { ComponentPropsWithoutRef } from 'react'
import { cn } from '../../lib/cn'
import { containerFrameClassName } from '../max-width'
import { useGridChrome } from './chrome'

export type GridGuidesColumns = 2 | 3 | 4

export interface GridGuidesProps extends Omit<ComponentPropsWithoutRef<'div'>, 'children'> {
  /**
   * Number of equal inset vertical columns (draws columns − 1 inner hairlines).
   * @default 3
   */
  columns?: GridGuidesColumns
}

/**
 * Nested vertical guides inside the chrome width for denser compositions.
 * Hidden below `md` to avoid noise on narrow viewports.
 */
export function GridGuides({ className, columns = 3, ...props }: GridGuidesProps) {
  const chrome = useGridChrome()
  const lineStyle = chrome?.lineStyle ?? 'dashed'
  const maxWidth = chrome?.maxWidth ?? 'default'
  const innerLines = Math.max(columns - 1, 0)

  return (
    <div
      aria-hidden
      className={cn('pointer-events-none absolute inset-0 z-0 hidden md:block', className)}
      data-slot="grid-guides"
      {...props}
    >
      <div className={cn('relative h-full', containerFrameClassName(maxWidth))}>
        {Array.from({ length: innerLines }, (_, index) => {
          const position = ((index + 1) / columns) * 100
          return (
            <span
              className={cn(
                'absolute inset-y-0 border-l border-[color:var(--a63-grid-guide-color,var(--input,var(--a63-border-subtle)))]',
                lineStyle === 'solid' ? 'border-solid' : 'border-dashed'
              )}
              data-slot="grid-guide"
              key={position}
              style={{
                borderLeftWidth: 'var(--a63-grid-hairline-width, 1px)',
                left: `${position}%`,
              }}
            />
          )
        })}
      </div>
    </div>
  )
}
