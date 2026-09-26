import {
  type ComponentPropsWithRef,
  type ComponentType,
  type ReactNode,
  type Ref,
  useCallback,
  useLayoutEffect,
  useRef,
} from 'react'
import type { WidgetSize } from '../types'
import { cn } from '../utils'
import { WidgetSizeProvider } from './widget-grid'
import { widgetPresentationStyle, widgetSizeStyle } from './widget-scale'
import { WIDGET_CANONICAL_CELL_PX, WIDGET_MAX_PRESENTATION_SCALE } from './widget-units'

export interface WidgetViewportProps extends Omit<ComponentPropsWithRef<'article'>, 'children'> {
  /**
   * The host grid's cell width in CSS px, when the host already knows it.
   *
   * Left unset the viewport derives the cell from its own measured box, which
   * is right at rest and wrong while that box is moving: a host that animates
   * the shell between two sizes re-fires the observer every frame, the cell
   * follows the travelling width, and the composition zooms inside the growing
   * box instead of reflowing in it. The cell a tile lands in is a property of
   * the *grid*, identical for a 1x1 and a 2x1, so a host that measures its own
   * tracks can say so once and the observer never runs.
   *
   * Passing it also frees the canvas height to follow the host box rather than
   * the cell — the two are the same number at rest, and only the first of them
   * is still true mid-flight.
   */
  cellPx?: number
  children: ReactNode
  size: WidgetSize
}

function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === 'function') {
    ref(value)
  } else if (ref) {
    ref.current = value
  }
}

/**
 * Fluid host boundary for a canonical widget view.
 *
 * The viewport owns grid placement and publishes the design unit. The widget
 * view inside owns all visible surface, composition, and state styling.
 */
export function WidgetViewport({
  cellPx,
  children,
  className,
  ref,
  size,
  style,
  ...props
}: WidgetViewportProps) {
  const viewportRef = useRef<HTMLElement | null>(null)
  const canvasRef = useRef<HTMLDivElement | null>(null)
  const setViewportRef = useCallback(
    (node: HTMLElement | null) => {
      viewportRef.current = node
      assignRef(ref, node)
    },
    [ref]
  )

  useLayoutEffect(() => {
    const viewport = viewportRef.current
    const canvas = canvasRef.current
    if (!viewport || !canvas) return
    // The host told us the cell, so there is nothing to measure and nothing to
    // watch: the scale is already on the canvas, from `widgetPresentationStyle`.
    if (cellPx != null) return

    const updatePresentationScale = () => {
      const computedStyle = getComputedStyle(viewport)
      const span = Number.parseFloat(computedStyle.getPropertyValue('--widget-span')) || 1
      const gap = Number.parseFloat(computedStyle.getPropertyValue('--widget-gap')) || 0
      const cellPx = (viewport.getBoundingClientRect().width - (span - 1) * gap) / span
      const scale = Math.min(cellPx / WIDGET_CANONICAL_CELL_PX, WIDGET_MAX_PRESENTATION_SCALE)
      canvas.style.setProperty('--widget-presentation-scale', String(scale))
    }

    updatePresentationScale()

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', updatePresentationScale)
      return () => window.removeEventListener('resize', updatePresentationScale)
    }

    const observer = new ResizeObserver(updatePresentationScale)
    observer.observe(viewport)
    return () => observer.disconnect()
  }, [cellPx, size])

  const presentationStyle =
    cellPx == null
      ? widgetPresentationStyle()
      : {
          ...widgetPresentationStyle(cellPx),
          // Off the cell, onto the box. The cell-derived height is the row's
          // resting height, which is the same number — until the host animates
          // the shell between two sizes, when the box is the one that is still
          // true. `100%` resolves against the viewport, which is `size-full`.
          height: 'calc(100% / var(--widget-presentation-scale))',
        }

  return (
    <WidgetSizeProvider size={size}>
      <article
        className={cn('a63-WidgetViewport', className)}
        data-widget-viewport=""
        data-widget-viewport-size={size}
        ref={setViewportRef}
        style={{
          ...widgetSizeStyle(size),
          // A known cell replaces the `100cqi`-derived one, so `--widget-u`
          // stops tracking a travelling width along with it.
          ...(cellPx == null ? null : { '--widget-cell': `${cellPx}px` }),
          ...style,
        }}
        {...props}
      >
        <div data-widget-presentation-canvas="" ref={canvasRef} style={presentationStyle}>
          {children}
        </div>
      </article>
    </WidgetSizeProvider>
  )
}

/**
 * Wrap a sized widget component so it carries its own viewport.
 *
 * A widget's composition is authored on a 256 design-px canvas and only
 * resolves against real pixels once a host publishes `--widget-u`. Grid hosts
 * (the OS63 desktop, the atom63.io board) publish it by placing tiles in a
 * `WidgetViewport` themselves. Hosts that render a widget on its own — agent
 * chat renders one per message, in an intrinsically sized frame — have no grid
 * to hang that on, and a widget mounted without it silently renders design px
 * at 1:1: ~36% oversized type, padding and gaps, clipped by the shell wherever
 * the overflow lands.
 *
 * Use this at the registry boundary of such a host so the widget arrives
 * already scaled, rather than re-deriving the unit per call site.
 *
 * @example
 * component: () => import('./weather').then(m => withWidgetViewport(m.Weather))
 */
export function withWidgetViewport<P extends { size: WidgetSize }>(
  Component: ComponentType<P>
): ComponentType<P> {
  function WidgetViewportBoundary(props: P) {
    return (
      <WidgetViewport className="a63-WidgetViewport-fill" size={props.size}>
        <Component {...props} />
      </WidgetViewport>
    )
  }

  WidgetViewportBoundary.displayName = `withWidgetViewport(${Component.displayName ?? Component.name ?? 'Widget'})`

  return WidgetViewportBoundary
}
