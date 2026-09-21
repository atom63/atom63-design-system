import {
  getCrossRendererContract,
  type LoadMoreTriggerState,
  type LoadMoreTriggerVariant,
  loadMoreTriggerContract,
} from '@atom63/ui-foundation'
import { AlertCircle, CheckCircle, LoaderCircle } from 'lucide-react'
import { forwardRef, type ReactNode } from 'react'

import { cn } from '../../lib/cn'

export type { LoadMoreTriggerState, LoadMoreTriggerVariant }

export interface LoadMoreTriggerProps {
  children?: ReactNode
  className?: string
  exhaustedMessage?: string
  failedMessage?: string
  hasMore?: boolean
  idleMessage?: string
  isLoading?: boolean
  loadingMessage?: string
  onRetry?: () => void
  retryLabel?: string
  state?: Exclude<LoadMoreTriggerState, 'custom'>
  variant?: LoadMoreTriggerVariant
}

const stateTones = getCrossRendererContract('load-more-trigger').stateTones

/* LoadMoreTrigger — a sentinel row for infinite scroll, ported from prod
   @atom63/ui. It renders only while there's more to load (or a load is in
   flight); the consumer wires an IntersectionObserver to the forwarded ref to
   fire the fetch when the row scrolls into view. */
export const LoadMoreTrigger = forwardRef<HTMLDivElement, LoadMoreTriggerProps>(
  (
    {
      children,
      className,
      exhaustedMessage = 'All items loaded',
      failedMessage = 'Couldn’t load more',
      hasMore,
      idleMessage = 'Scroll down to load more',
      isLoading,
      loadingMessage = 'Loading more...',
      onRetry,
      retryLabel = 'Retry',
      state,
      variant = loadMoreTriggerContract.defaultVariant,
    },
    ref
  ) => {
    const resolvedState = state ?? (isLoading ? 'loading' : hasMore ? 'idle' : 'hidden')

    if (resolvedState === 'hidden') {
      return null
    }

    if (children) {
      return (
        <div
          className={cn('a63-LoadMoreTrigger', className)}
          data-state="custom"
          data-slot="load-more-trigger"
          data-variant={variant}
          ref={ref}
        >
          {children}
        </div>
      )
    }

    const tone = stateTones[resolvedState] ?? 'neutral'
    const isStatus = resolvedState !== 'idle'

    return (
      <div
        aria-live={isStatus ? 'polite' : undefined}
        className={cn('a63-LoadMoreTrigger', className)}
        data-has-message=""
        data-state={resolvedState}
        data-slot="load-more-trigger"
        data-tone={tone}
        data-variant={variant}
        ref={ref}
        role={isStatus ? 'status' : undefined}
      >
        <div
          className="a63-LoadMoreTrigger-message"
          data-slot="load-more-trigger-message"
          data-variant={variant}
        >
          {resolvedState === 'loading' ? (
            <span
              aria-hidden
              className="a63-LoadMoreTrigger-spinner"
              data-slot="load-more-trigger-spinner"
            >
              <LoaderCircle />
            </span>
          ) : null}
          {resolvedState === 'failed' ? (
            <AlertCircle
              aria-hidden
              className="a63-LoadMoreTrigger-icon"
              data-slot="load-more-trigger-icon"
            />
          ) : null}
          {resolvedState === 'exhausted' ? (
            <CheckCircle
              aria-hidden
              className="a63-LoadMoreTrigger-icon"
              data-slot="load-more-trigger-icon"
            />
          ) : null}
          <span>
            {resolvedState === 'loading'
              ? loadingMessage
              : resolvedState === 'failed'
                ? failedMessage
                : resolvedState === 'exhausted'
                  ? exhaustedMessage
                  : idleMessage}
          </span>
          {resolvedState === 'failed' && onRetry ? (
            <button
              className="a63-LoadMoreTrigger-action"
              data-slot="load-more-trigger-action"
              onClick={onRetry}
              type="button"
            >
              {retryLabel}
            </button>
          ) : null}
        </div>
      </div>
    )
  }
)

LoadMoreTrigger.displayName = 'LoadMoreTrigger'
