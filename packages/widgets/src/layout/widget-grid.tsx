import {
  createContext,
  useContext,
  type ComponentPropsWithRef,
  type CSSProperties,
  type ReactNode,
} from 'react'
import type { WidgetSize } from '../types'

const WidgetSizeContext = createContext<WidgetSize>('small')

/**
 * Reports the size a widget is being rendered at, so a widget supporting more
 * than one size can pick the matching composition.
 */
export function useWidgetSize(): WidgetSize {
  return useContext(WidgetSizeContext)
}

export interface WidgetSizeProviderProps {
  children: ReactNode
  size: WidgetSize
}

export function WidgetSizeProvider({ children, size }: WidgetSizeProviderProps) {
  return <WidgetSizeContext.Provider value={size}>{children}</WidgetSizeContext.Provider>
}

type WidgetGridStyle = CSSProperties & {
  '--widget-cols': string
  '--widget-gap': string
}

export interface WidgetGridProps extends ComponentPropsWithRef<'div'> {
  /** Track count. Fixed, not responsive — every size keeps its shape at every width. @default 2 */
  columns?: number
  /** Gutter in CSS px. @default 12 */
  gap?: number
}

/**
 * Widget grid container. Owns track count and gap, and publishes both as custom
 * properties so each tile's cell-derived unit can divide them out.
 *
 * Tracks are explicit rather than `auto-fill`: with intrinsic tracks a narrow
 * container resolves to one column and a `span 2` tile would create an implicit
 * second column and overflow.
 *
 * Rows are sized here rather than on the tile: an element cannot resolve
 * container-query units against the `@container` it establishes itself, so the
 * grid is wrapped in a container and `grid-auto-rows` resolves `100cqi` against
 * that ancestor. Tiles just fill their area, and spanning tiles inherit the
 * inter-row gaps from the grid.
 */
export function WidgetGrid({
  children,
  columns = 2,
  gap = 12,
  ref,
  style,
  ...props
}: WidgetGridProps) {
  const gridStyle: WidgetGridStyle = {
    '--widget-cols': String(columns),
    '--widget-gap': `${gap}px`,
    display: 'grid',
    gap: `${gap}px`,
    gridAutoRows:
      'calc((100cqi - (var(--widget-cols) - 1) * var(--widget-gap)) / var(--widget-cols))',
    gridTemplateColumns: 'repeat(var(--widget-cols), minmax(0, 1fr))',
    ...style,
  }

  return (
    <div ref={ref} style={{ containerType: 'inline-size' }} {...props}>
      <div style={gridStyle}>{children}</div>
    </div>
  )
}
