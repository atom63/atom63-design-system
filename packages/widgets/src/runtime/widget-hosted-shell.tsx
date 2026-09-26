import type { ComponentProps, ReactNode } from 'react'
import { widgetInsetStyle } from '../layout'
import { WidgetBlock, WidgetBlockFooter, WidgetCard } from '../primitives'
import { cn } from '../utils'
import { WIDGET_FILL_STYLE } from './widget-fill'
import { WidgetHostContentTransition } from './widget-host-content-transition'

/**
 * Stable widget card shell with optional header and crossfading body content.
 *
 * ⚠ **`children` must supply their own inset** when there is no `footer`. This
 * shell only wraps the body in a padded `WidgetBlock` when a `footer` is given.
 * Pass a raw `<div>` and it sits flush against the face edge — which reads as a
 * misaligned widget, not a missing wrapper, so it is easy to miss.
 *
 * Use one of:
 * - `WidgetCardContent` — footprint-aware `widgetInsetStyle(size, 'body')`
 * - `WidgetBlock` with `style={widgetInsetStyle(size, 'body')}`
 * - chrome-less faces with `style={widgetInsetStyle(size, 'face')}`
 *
 * Give that slot `flex: 1` when the composition anchors anything to the bottom
 * (`justify-content: space-between`, a pinned footer row). The slot otherwise
 * sizes to its content, leaving the children bunched at the top above dead
 * space.
 *
 * The padding is deliberately NOT unconditional: widgets that pad themselves
 * would double up.
 *
 * The shell fills its host box. A `style` passed here lands on the surface's
 * outer shell, after that fill.
 */
export function WidgetHostedShell({
  children,
  className,
  contentClassName,
  contentKey,
  contentSlotClassName,
  footer,
  header,
  size,
  style,
  ...cardProps
}: {
  children: ReactNode
  className?: string
  contentClassName?: string
  contentKey: string
  contentSlotClassName?: string
  /** Pinned below the crossfading body inside the same block gap rhythm. */
  footer?: ReactNode
  header?: ReactNode
} & Omit<ComponentProps<typeof WidgetCard>, 'children'>) {
  const transition = (
    <WidgetHostContentTransition
      className={contentSlotClassName}
      contentClassName={contentClassName}
      contentKey={contentKey}
    >
      {children}
    </WidgetHostContentTransition>
  )

  return (
    // A widget with a header reads as two anchored bands — title at the top,
    // content settling against the bottom — so the slack lands BETWEEN them
    // rather than under the content. A consumer `justify-*` utility in
    // `className` still wins, for the widgets that ask for something else.
    <WidgetCard
      className={cn(header && 'a63-WidgetHostedShell-anchored', className)}
      size={size}
      style={{ ...WIDGET_FILL_STYLE, ...style }}
      {...cardProps}
    >
      {header}
      {footer ? (
        <WidgetBlock style={widgetInsetStyle(size, header ? 'body' : 'face')}>
          {transition}
          <WidgetBlockFooter>{footer}</WidgetBlockFooter>
        </WidgetBlock>
      ) : (
        transition
      )}
    </WidgetCard>
  )
}
