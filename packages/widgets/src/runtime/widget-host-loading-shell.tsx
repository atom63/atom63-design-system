import type { ReactNode } from 'react'
import { WidgetCard, WidgetCardContent } from '../primitives'
import type { WidgetSize } from '../types'
import { WidgetContentFallback } from './widget-content-fallback'
import { WIDGET_FILL_STYLE } from './widget-fill'

/**
 * Card shell with a centered spinner only — no title (avoids header flash on
 * resolve). Takes the footprint it is standing in for, so the chrome it paints
 * while loading matches the chrome the widget paints once resolved.
 */
export function WidgetHostLoadingShell({
  content,
  size,
}: {
  content?: ReactNode
  size: WidgetSize
}) {
  return (
    <div className="a63-WidgetHostFallback" data-slot="widget-host-loading-shell">
      <WidgetCard size={size} style={WIDGET_FILL_STYLE}>
        <WidgetCardContent className="a63-WidgetHostLoadingShell-content">
          {content ?? <WidgetContentFallback />}
        </WidgetCardContent>
      </WidgetCard>
    </div>
  )
}
