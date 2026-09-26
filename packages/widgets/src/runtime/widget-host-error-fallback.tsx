import { Button } from '@atom63/ui-react'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { widgetTypeStyle } from '../layout'
import { WidgetCard, WidgetCardContent, WidgetCardHeader, WidgetCardTitle } from '../primitives'
import type { WidgetSize } from '../types'
import { WIDGET_FILL_STYLE } from './widget-fill'

/** Widget card shell for runtime error boundaries (lazy load, render crash). */
export function WidgetHostErrorFallback({
  message,
  onRetry,
  size,
  title = 'Widget failed to load',
}: {
  message?: string
  onRetry?: () => void
  size: WidgetSize
  title?: string
}) {
  return (
    <div className="a63-WidgetHostFallback" data-slot="widget-host-error-fallback">
      <WidgetCard size={size} style={WIDGET_FILL_STYLE}>
        <WidgetCardHeader>
          <WidgetCardTitle
            icon={<AlertCircle aria-hidden className="a63-WidgetHostErrorFallback-icon" />}
          >
            {title}
          </WidgetCardTitle>
        </WidgetCardHeader>
        <WidgetCardContent className="a63-WidgetHostErrorFallback-content">
          {message ? (
            <p
              className="a63-WidgetHostErrorFallback-message"
              style={widgetTypeStyle('body', size)}
            >
              {message}
            </p>
          ) : null}
          {onRetry ? (
            <Button onClick={onRetry} size="sm" type="button" variant="ghost">
              <RefreshCw aria-hidden />
              Retry
            </Button>
          ) : null}
        </WidgetCardContent>
      </WidgetCard>
    </div>
  )
}
