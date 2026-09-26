import type { CSSProperties, ReactNode } from 'react'
import { WIDGET_CANONICAL_CELL_PX, WidgetGrid, WidgetViewport } from '../layout'
import type { WidgetSize } from '../types'

/**
 * Story host: a WidgetGrid sized so one cell is `cellPx` wide, holding a
 * WidgetViewport per tile. This is the fluid host path — the viewport measures
 * its cell and publishes `--widget-u`, so design-px content renders at the
 * scale a real host gives it rather than at the `1px` fallback.
 *
 * Not part of the package entry points; stories and the docs page import it.
 */
export function WidgetFrame({
  cellPx = WIDGET_CANONICAL_CELL_PX,
  children,
  columns,
  gap = 8,
}: {
  cellPx?: number
  children: ReactNode
  /** Grid tracks. Defaults to 2. */
  columns?: number
  gap?: number
}) {
  const tracks = columns ?? 2
  return (
    <div style={{ inlineSize: tracks * cellPx + (tracks - 1) * gap, maxInlineSize: '100%' }}>
      <WidgetGrid columns={tracks} gap={gap}>
        {children}
      </WidgetGrid>
    </div>
  )
}

/** One tile in a WidgetFrame. */
export function WidgetTile({ children, size }: { children: ReactNode; size: WidgetSize }) {
  return <WidgetViewport size={size}>{children}</WidgetViewport>
}

/** A single widget at its footprint, in a grid just wide enough for it. */
export function SingleWidget({
  cellPx,
  children,
  size,
}: {
  cellPx?: number
  children: ReactNode
  size: WidgetSize
}) {
  return (
    <WidgetFrame cellPx={cellPx} columns={size === 'small' ? 1 : 2}>
      <WidgetTile size={size}>{children}</WidgetTile>
    </WidgetFrame>
  )
}

/** Fills the tile: pass as `style` to a WidgetCard or WidgetSurface. */
export const FILL: CSSProperties = { blockSize: '100%', inlineSize: '100%' }

/** Muted supporting text on the widget type ramp. */
export const MUTED: CSSProperties = { color: 'var(--a63-text-secondary)', margin: 0 }
