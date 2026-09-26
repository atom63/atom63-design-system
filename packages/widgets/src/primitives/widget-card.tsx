import type React from 'react'
import type { CSSProperties } from 'react'
import {
  WIDGET_BODY_INSET,
  widgetChromeIconStyle,
  widgetClampRelief,
  widgetInsetStyle,
  widgetTypeStyle,
  wu,
  wuMerge,
} from '../layout'
import type { WidgetSize } from '../types'
import { cn } from '../utils'
import { useWidgetSurfaceSize, WidgetSurface } from './widget-surface'

export { WIDGET_CARD_SURFACE_CLASS, WIDGET_RIM_SHELL_CLASS } from './widget-surface-classes'

interface WidgetCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  /** Grid size fed into the surface context for chrome-less content to read. */
  size: WidgetSize
}

/*
 * Footprint chrome/card rhythm (header height, card gap) lives in the
 * stylesheet, keyed on the surface size. Horizontal padding comes from
 * `widgetInsetStyle`.
 */

/**
 * @deprecated Prefer `widgetInsetStyle(size, 'body')`. Kept as a thin alias so
 * existing call sites can migrate without a flag day.
 */
export const WIDGET_BODY_INSET_CLASS: Record<WidgetSize, string> = {
  small: '',
  medium: '',
  large: '',
}

/**
 * Widget Card - Base container for widgets
 * Uses design system tokens for consistent styling.
 * Direct-child spacing follows the widget footprint: compact for one-row
 * surfaces and comfortable for the large canvas.
 */
export function WidgetCard({ children, className, size, ...props }: WidgetCardProps) {
  return (
    <WidgetSurface
      {...props}
      // `group` stays as a marker for consumer `group-hover:` utilities.
      className={cn('a63-WidgetCard', 'group', className)}
      data-slot="widget-card"
      size={size}
    >
      {children}
    </WidgetSurface>
  )
}

interface WidgetCardHeaderProps {
  children: React.ReactNode
  className?: string
  style?: CSSProperties
}

/**
 * Widget Card Header - Title/header section for widgets
 * Composed of left (icon + label) and right (optional badge/button) sections
 */
export function WidgetCardHeader({ children, className, style }: WidgetCardHeaderProps) {
  const size = useWidgetSurfaceSize() ?? 'large'

  return (
    <div
      className={cn('a63-WidgetCardHeader', className)}
      data-size={size}
      data-slot="widget-card-header"
      style={wuMerge(
        {
          paddingInline: wu(WIDGET_BODY_INSET[size]),
          columnGap: wu(size === 'small' ? 6 : 8),
        },
        style
      )}
    >
      {children}
    </div>
  )
}

interface WidgetCardHeaderLeftProps {
  children: React.ReactNode
  className?: string
}

/**
 * Widget Card Header Left - Left side of header (icon + label)
 */
export function WidgetCardHeaderLeft({ children, className }: WidgetCardHeaderLeftProps) {
  return (
    <div
      className={cn('a63-WidgetCardHeader-start', className)}
      data-slot="widget-card-header-left"
    >
      {children}
    </div>
  )
}

interface WidgetCardHeaderRightProps {
  children: React.ReactNode
  className?: string
}

/**
 * Widget Card Header Right - Right side of header (optional badge/button)
 */
export function WidgetCardHeaderRight({ children, className }: WidgetCardHeaderRightProps) {
  return (
    <div className={cn('a63-WidgetCardHeader-end', className)} data-slot="widget-card-header-right">
      {children}
    </div>
  )
}

interface WidgetCardContentProps {
  children: React.ReactNode
  className?: string
  style?: CSSProperties
}

/**
 * Widget Card Content - Main content area for widgets.
 * Padding/gap come from `widgetInsetStyle(size, 'body')`.
 */
export function WidgetCardContent({ children, className, style }: WidgetCardContentProps) {
  const size = useWidgetSurfaceSize() ?? 'large'

  return (
    <div
      className={cn('a63-WidgetCardContent', className)}
      data-slot="widget-card-content"
      style={wuMerge(widgetInsetStyle(size, 'body'), style)}
    >
      {children}
    </div>
  )
}

interface WidgetBlockProps {
  children: React.ReactNode
  className?: string
  style?: CSSProperties
}

/**
 * Widget block — stacks optional header, content, and footer regions.
 * Pass `style={widgetInsetStyle(size, 'body')}` when the block owns padding.
 */
export function WidgetBlock({ children, className, style }: WidgetBlockProps) {
  return (
    <div className={cn('a63-WidgetBlock', className)} data-slot="widget-block" style={style}>
      {children}
    </div>
  )
}

interface WidgetBlockRegionProps {
  children: React.ReactNode
  className?: string
}

/** Optional top region inside a widget block (title, metadata, controls). */
export function WidgetBlockHeader({ children, className }: WidgetBlockRegionProps) {
  return (
    <header className={cn('a63-WidgetBlock-header', className)} data-slot="widget-block-header">
      {children}
    </header>
  )
}

/** Primary widget body — grows to fill space between header and footer. */
export function WidgetBlockContent({ children, className }: WidgetBlockRegionProps) {
  return (
    <div className={cn('a63-WidgetBlock-content', className)} data-slot="widget-block-content">
      {children}
    </div>
  )
}

/** Optional bottom region (actions, status, pagination). */
export function WidgetBlockFooter({ children, className }: WidgetBlockRegionProps) {
  return (
    <footer className={cn('a63-WidgetBlock-footer', className)} data-slot="widget-block-footer">
      {children}
    </footer>
  )
}

interface WidgetCardTitleProps {
  children: React.ReactNode
  className?: string
  icon?: React.ReactNode
}

/**
 * Widget Card Title - Quiet chrome identity with optional leading icon.
 * Icon slot tracks the chrome type ramp (design 12 → ~10px at OS63) so the
 * pair stays optically matched when the label steps down.
 */
export function WidgetCardTitle({ children, icon, className }: WidgetCardTitleProps) {
  return (
    <div className={cn('a63-WidgetCardTitle', className)} data-slot="widget-card-title">
      {icon && (
        <span
          className="a63-WidgetCardTitle-icon"
          data-slot="widget-card-title-icon"
          style={widgetChromeIconStyle()}
        >
          {icon}
        </span>
      )}
      <div
        className="a63-WidgetCardTitle-text"
        data-slot="widget-card-title-text"
        style={wuMerge(widgetTypeStyle('chrome'), widgetClampRelief())}
      >
        {children}
      </div>
    </div>
  )
}

interface WidgetCardTextProps {
  children: React.ReactNode
  className?: string
}

/**
 * Widget Card Text Group - Flex column that clips content instead of wrapping.
 * Use around text blocks that should truncate during widget size transitions.
 */
export function WidgetCardTextGroup({ children, className }: WidgetCardTextProps) {
  return (
    <div className={cn('a63-WidgetCardTextGroup', className)} data-slot="widget-card-text-group">
      {children}
    </div>
  )
}

/**
 * Widget Card Row - Inline row that stays on one line and clips overflow.
 * Use for metadata rows (location, stats, labels) that shouldn't wrap.
 */
export function WidgetCardRow({ children, className }: WidgetCardTextProps) {
  return (
    <div className={cn('a63-WidgetCardRow', className)} data-slot="widget-card-row">
      {children}
    </div>
  )
}

interface WidgetShellProps extends Omit<WidgetCardProps, 'children' | 'title'> {
  children: React.ReactNode
  contentClassName?: string
  headerClassName?: string
  headerEnd?: React.ReactNode
  icon?: React.ReactNode
  title: React.ReactNode
}

export function WidgetShell({
  children,
  className,
  contentClassName,
  headerClassName,
  headerEnd,
  icon,
  title,
  ...props
}: WidgetShellProps) {
  return (
    <WidgetCard className={className} {...props}>
      <WidgetCardHeader className={headerClassName}>
        <WidgetCardTitle icon={icon}>{title}</WidgetCardTitle>
        {headerEnd}
      </WidgetCardHeader>
      <WidgetCardContent className={contentClassName}>{children}</WidgetCardContent>
    </WidgetCard>
  )
}
