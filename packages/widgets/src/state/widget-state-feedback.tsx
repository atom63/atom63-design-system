import {
  Button,
  CopyButton,
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from '@atom63/ui-react'
import { AlertTriangle, Ellipsis, Inbox, LoaderCircle, RefreshCw } from 'lucide-react'
import { memo } from 'react'
import { widgetTypeStyle } from '../layout'
import { useWidgetSurfaceSize } from '../primitives'
import type { WidgetSize } from '../types'
import { cn } from '../utils'
import type { WidgetFeedbackCopy, WidgetFeedbackState } from './types'

const STATE_ICON = {
  empty: Inbox,
  error: AlertTriangle,
  loading: LoaderCircle,
} as const

const RETRY_LABEL = 'Try again'

function WidgetErrorActions({
  description,
  onRetry,
}: {
  description?: string
  onRetry?: () => void
}) {
  if (!description && !onRetry) {
    return null
  }

  return (
    <div
      // The row gap is `--a63-space-2`, which follows the density axis like the
      // a63 controls in it, so the row keeps its proportion under compact
      // density instead of the controls shrinking around a fixed gap.
      className="a63-WidgetStateFeedback-actions"
      data-slot="widget-state-actions"
    >
      {onRetry ? (
        <Button
          className="a63-WidgetStateFeedback-action"
          onClick={onRetry}
          size="sm"
          type="button"
          variant="outline"
        >
          <RefreshCw aria-hidden className="a63-WidgetStateFeedback-retryIcon" />
          {RETRY_LABEL}
        </Button>
      ) : null}
      {description ? (
        <Popover>
          <PopoverTrigger
            render={
              <Button
                aria-label="View error details"
                className="a63-WidgetStateFeedback-action"
                size="icon-sm"
                type="button"
                variant="outline"
              >
                <Ellipsis aria-hidden className="a63-WidgetStateFeedback-detailsIcon" />
              </Button>
            }
          />
          <PopoverContent
            align="center"
            className="a63-WidgetErrorDetails"
            side="top"
            sideOffset={8}
          >
            <div className="a63-WidgetErrorDetails-header">
              <PopoverTitle>Error details</PopoverTitle>
              <PopoverDescription>
                Technical information you can copy when reporting this problem.
              </PopoverDescription>
            </div>
            {/* Fixed type, not the widget ramp, on purpose: this sits inside a
                portalled Popover, which renders at document level where
                `--widget-u` is not inherited. */}
            <p className="a63-WidgetErrorDetails-message">{description}</p>
            <CopyButton label="Error details" size="sm" value={description} variant="outline">
              Copy details
            </CopyButton>
          </PopoverContent>
        </Popover>
      ) : null}
    </div>
  )
}

export interface WidgetStateFeedbackProps {
  className?: string
  copy: WidgetFeedbackCopy
  onRetry?: () => void
  /** Falls back to the nearest WidgetSurface size when omitted. */
  size?: WidgetSize
  state: WidgetFeedbackState
}

/**
 * The one way a widget reports loading, error, or empty.
 *
 * Deliberately owns its own inset and draws no border or fill. A widget-wide
 * failure has no region to mark, and inheriting host padding made the same
 * state render three different ways — flush and clipped where the shell had no
 * padding, full-bleed where the shell passed none, correct only where the shell
 * happened to pad. Self-padding makes the treatment identical wherever it is
 * mounted.
 *
 * The one-row footprints (1x1 and 2x1) differ in width, not height, so they
 * share the compact density. Stepping them apart put a 28px badge beside a 32px
 * one in tiles of identical height. The 2x2 footprint gets the large density.
 *
 * On the error state the description moves into a disclosure next to the retry
 * button, so technical detail never crowds the tile.
 */
export const WidgetStateFeedback = memo<WidgetStateFeedbackProps>(
  ({ className, copy, onRetry, size, state }) => {
    const surfaceSize = useWidgetSurfaceSize()
    const resolvedSize = size ?? surfaceSize ?? 'small'
    const density = resolvedSize === 'large' ? 'large' : 'compact'
    const typeSize = density === 'large' ? 'large' : 'medium'
    const Icon = STATE_ICON[state]
    const description = state === 'error' ? undefined : copy.description

    return (
      <div
        className={cn('a63-WidgetStateFeedback', className)}
        data-density={density}
        data-slot="widget-state-feedback"
        data-state={state}
        role={state === 'error' ? 'alert' : 'status'}
      >
        <div className="a63-WidgetStateFeedback-badge">
          <Icon
            aria-hidden
            className={cn('a63-WidgetStateFeedback-icon', state === 'loading' && 'a63-Widget-spin')}
          />
        </div>
        <div className="a63-WidgetStateFeedback-text">
          <p
            className="a63-WidgetStateFeedback-title"
            style={widgetTypeStyle('body', typeSize, { weight: 500 })}
          >
            {copy.title}
          </p>
          {description ? (
            <p
              className="a63-WidgetStateFeedback-description"
              style={widgetTypeStyle('body', typeSize)}
            >
              {description}
            </p>
          ) : null}
        </div>
        {state === 'error' ? (
          <WidgetErrorActions description={copy.description} onRetry={onRetry} />
        ) : null}
      </div>
    )
  }
)

WidgetStateFeedback.displayName = 'WidgetStateFeedback'
