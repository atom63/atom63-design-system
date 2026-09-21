import { type ComponentPropsWithoutRef, createContext, type ReactNode, useContext } from 'react'
import { cn } from '../../lib/cn'
import { containerFrameClassName, type ContainerMaxWidth } from '../max-width'
import {
  gridChromeStyle,
  type GridChromeLineStyle,
  type GridChromeStyle,
  type GridChromeTone,
} from './style'

export interface GridChromeContextValue {
  crosshairs: boolean
  /** True when page rails are painted by {@link GridChrome}. */
  fixedRails: boolean
  lineStyle: GridChromeLineStyle
  maxWidth: ContainerMaxWidth
}

const GridChromeContext = createContext<GridChromeContextValue | null>(null)

export function useGridChrome(): GridChromeContextValue | null {
  return useContext(GridChromeContext)
}

export interface GridChromeProps extends Omit<ComponentPropsWithoutRef<'div'>, 'children'> {
  children: ReactNode
  /**
   * Default sparkle crosshairs on nested `GridRule`s.
   * @default true
   */
  crosshairs?: boolean
  /**
   * Full-height vertical rails matching `maxWidth`. Absolute inside the chrome
   * (not `position: fixed` / sticky-on-self) so `max-w-*` + `mx-auto` keep working
   * and edges stay symmetric with the scroll container.
   * @default true
   */
  fixedRails?: boolean
  /**
   * Stroke style shared by rails, rules, and guides.
   * @default 'dashed'
   */
  lineStyle?: GridChromeLineStyle
  maxWidth?: ContainerMaxWidth
  /**
   * Central color preset for rails, rules, guides, and crosshairs.
   * Override individual values with CSS variables on `style`.
   * @default 'default'
   */
  tone?: GridChromeTone
  style?: GridChromeStyle
}

/**
 * Firecrawl-style page frame: continuous column rails + crosshair context.
 *
 * Wrap the **entire scroll document** (header, main, footer) so one pair of
 * rails meets every band. Nesting `GridChrome` only around a page body leaves
 * the footer as a floating card — the opposite of Firecrawl’s T-junctions.
 */
export function GridChrome({
  children,
  className,
  crosshairs = true,
  fixedRails = true,
  lineStyle = 'dashed',
  maxWidth = 'default',
  style,
  tone = 'default',
  ...props
}: GridChromeProps) {
  return (
    <GridChromeContext.Provider value={{ crosshairs, fixedRails, lineStyle, maxWidth }}>
      <div
        className={cn('relative isolate flex min-h-svh flex-col', className)}
        data-slot="grid-chrome"
        style={gridChromeStyle({ lineStyle, style, tone })}
        {...props}
      >
        {fixedRails ? (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-[60]"
            data-slot="grid-chrome-rails-root"
          >
            {/*
              z-60 sits above sticky header (z-50) so backdrop-blur never frosts
              the hairlines. Width is constrained here (not sticky-on-self) so
              max-w + mx-auto stay aligned with the scrollport.
            */}
            <div
              className={cn(
                'h-full min-h-svh border-y-0 border-[color:var(--a63-grid-line-color)]',
                lineStyle === 'solid' ? 'border-solid' : 'border-dashed',
                containerFrameClassName(maxWidth)
              )}
              data-slot="grid-chrome-rails"
              style={{
                borderLeftWidth: 'var(--a63-grid-hairline-width)',
                borderRightWidth: 'var(--a63-grid-hairline-width)',
              }}
            />
          </div>
        ) : null}
        <div className="relative z-1 flex min-h-svh flex-1 flex-col">{children}</div>
      </div>
    </GridChromeContext.Provider>
  )
}
