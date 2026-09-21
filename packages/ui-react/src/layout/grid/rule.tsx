import type { ComponentPropsWithoutRef } from 'react'
import { cn } from '../../lib/cn'
import { containerFrameClassName, containerMaxWidthStyles } from '../max-width'
import { useGridChrome } from './chrome'
import { GridCrosshair } from './crosshair'
import { GRID_HAIRLINE_CENTER_PX } from './hairline'

export interface GridRuleProps extends Omit<ComponentPropsWithoutRef<'div'>, 'children'> {
  /**
   * Stretch the hairline across the full scrollport width (crosshairs still sit on the rails).
   * @default false
   */
  bleed?: boolean
  /**
   * Sparkle marks at each rail intersection. Defaults to {@link GridChrome} context, else true.
   */
  crosshairs?: boolean
}

/**
 * Horizontal section hairline. Optional sparkle crosshairs at the left/right rails.
 */
export function GridRule({
  bleed = false,
  className,
  crosshairs: crosshairsProp,
  style,
  ...props
}: GridRuleProps) {
  const chrome = useGridChrome()
  const crosshairs = crosshairsProp ?? chrome?.crosshairs ?? true
  const lineStyle = chrome?.lineStyle ?? 'dashed'
  const maxWidth = chrome?.maxWidth ?? 'default'

  return (
    <div
      aria-hidden
      className={cn('relative w-full', className)}
      data-slot="grid-rule"
      style={{ height: 'var(--a63-grid-hairline-width, 1px)', ...style }}
      {...props}
    >
      <div
        className={cn(
          'absolute inset-x-0 top-0 border-t border-[color:var(--a63-grid-line-color,var(--input,var(--a63-border-subtle)))]',
          lineStyle === 'solid' ? 'border-solid' : 'border-dashed',
          bleed ? null : cn('mx-auto w-full', containerMaxWidthStyles[maxWidth])
        )}
        data-slot="grid-rule-line"
        style={{
          borderTopWidth: 'var(--a63-grid-hairline-width, 1px)',
        }}
      />
      {crosshairs ? (
        <div
          className={cn(
            'pointer-events-none absolute inset-x-0 inset-y-0',
            containerFrameClassName(maxWidth)
          )}
          data-slot="grid-rule-crosshairs"
        >
          {/*
            Frame left/right = outer edge of the border-box rails. Sparkle center
            sits on the stroke midline: outerEdge + hairline/2.
          */}
          <GridCrosshair
            className="absolute z-1 -translate-x-1/2 -translate-y-1/2"
            style={{ left: GRID_HAIRLINE_CENTER_PX, top: GRID_HAIRLINE_CENTER_PX }}
          />
          <GridCrosshair
            className="absolute z-1 translate-x-1/2 -translate-y-1/2"
            style={{ right: GRID_HAIRLINE_CENTER_PX, top: GRID_HAIRLINE_CENTER_PX }}
          />
        </div>
      ) : null}
    </div>
  )
}
