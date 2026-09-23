import {
  type FeedbackStateKind,
  type FeedbackStateSize,
  feedbackStateContract,
} from '@atom63/ui-foundation'
import { AlertTriangle, Clock, FileSearch, Inbox, RefreshCw, SearchX, WifiOff } from 'lucide-react'
import type * as React from 'react'

import { cn } from '../../lib/cn'
import type { ButtonProps } from '../button'
import { Button } from '../button'
import { Spinner } from '../spinner'

export type { FeedbackStateKind, FeedbackStateSize }

const feedbackIcons = {
  alertTriangle: AlertTriangle,
  clock: Clock,
  fileSearch: FileSearch,
  inbox: Inbox,
  refreshCw: RefreshCw,
  searchX: SearchX,
  spinner: Spinner,
  wifiOff: WifiOff,
} satisfies Record<string, React.ComponentType<React.ComponentProps<'svg'>>>

/** A built-in icon name, or any element (for icons outside the built-in set). */
export type FeedbackStateIconName = keyof typeof feedbackIcons
export type FeedbackStateIcon = FeedbackStateIconName | React.ReactElement

function renderFeedbackIcon(icon: FeedbackStateIcon | undefined): React.ReactNode {
  if (icon === undefined) return null
  if (typeof icon !== 'string') return icon
  // Types reject unknown names; untyped callers get no icon rather than a crash.
  const IconComponent = (
    feedbackIcons as Record<string, React.ComponentType<React.ComponentProps<'svg'>> | undefined>
  )[icon]
  return IconComponent ? <IconComponent aria-hidden /> : null
}

export interface FeedbackStateAction {
  href?: string
  icon?: FeedbackStateIcon
  label: string
  onClick?: () => void
  variant?: ButtonProps['variant']
}

export interface FeedbackStateProps {
  actions?: FeedbackStateAction[]
  className?: string
  description?: string
  error?: unknown
  icon?: FeedbackStateIcon
  query?: string
  showIcon?: boolean
  size?: FeedbackStateSize
  state?: FeedbackStateKind
  title?: string
}

const stateConfig = {
  empty: {
    icon: 'inbox',
    defaultTitle: 'No content yet',
    defaultDescription: "There's nothing here at the moment",
  },
  error: {
    icon: 'alertTriangle',
    defaultTitle: 'Something went wrong',
    defaultDescription: 'An unexpected error occurred',
  },
  loading: {
    icon: 'spinner',
    defaultTitle: 'Loading',
    defaultDescription: 'Loading...',
  },
  'not-found': {
    icon: 'searchX',
    defaultTitle: 'Nothing found',
    defaultDescription: "We couldn't find what you're looking for",
  },
  'no-results': {
    icon: 'fileSearch',
    defaultTitle: 'No results',
    defaultDescription: 'No items match your search criteria',
  },
  offline: {
    icon: 'wifiOff',
    defaultTitle: 'You are offline',
    defaultDescription: 'Reconnect to continue with the latest content',
  },
  stale: {
    icon: 'clock',
    defaultTitle: 'Showing saved content',
    defaultDescription: 'This content may be out of date',
  },
} as const satisfies Record<
  FeedbackStateKind,
  { icon: FeedbackStateIconName; defaultTitle: string; defaultDescription: string }
>

function getFeedbackDescription({
  description,
  error,
  query,
  state,
}: Pick<FeedbackStateProps, 'description' | 'error' | 'query'> & {
  state: FeedbackStateKind
}) {
  if (description) {
    return description
  }

  if (state === 'error' && error instanceof Error) {
    return error.message
  }

  if (state === 'no-results' && query) {
    return `No results found for "${query}"`
  }

  return stateConfig[state].defaultDescription
}

function FeedbackStateActionButton({ action }: { action: FeedbackStateAction }) {
  const inner = (
    <>
      {renderFeedbackIcon(action.icon)}
      {action.label}
    </>
  )

  if (action.href) {
    return (
      <Button
        render={<a href={action.href}>{inner}</a>}
        size="sm"
        variant={action.variant ?? 'outline'}
      />
    )
  }

  return (
    <Button onClick={action.onClick} size="sm" type="button" variant={action.variant ?? 'outline'}>
      {inner}
    </Button>
  )
}

/* FeedbackState — the empty/error/loading/not-found/no-results pattern, ported
   from prod @atom63/ui. Prod composed a separate `Empty` (which pulled in
   CopyButton → sonner); here the empty-state layout is inlined as
   `.a63-FeedbackState-*` elements so this pattern stays self-contained. */
export function FeedbackState({
  actions,
  className,
  description,
  error,
  icon,
  query,
  showIcon = true,
  size = feedbackStateContract.defaultSize,
  state = feedbackStateContract.defaultKind,
  title,
}: FeedbackStateProps): React.ReactElement {
  const config = stateConfig[state]
  const finalDescription = getFeedbackDescription({ description, error, query, state })
  const finalTitle = title || config.defaultTitle
  const iconNode = renderFeedbackIcon(icon ?? config.icon)

  return (
    <div
      aria-busy={state === 'loading' ? true : undefined}
      aria-live={state === 'error' ? 'assertive' : state === 'loading' ? 'polite' : undefined}
      className={cn('a63-FeedbackState', className)}
      data-size={size}
      data-slot="feedback-state"
      data-state={state}
      role={state === 'error' ? 'alert' : state === 'loading' ? 'status' : undefined}
    >
      <div className="a63-FeedbackState-header" data-slot="feedback-state-header">
        {showIcon && iconNode ? (
          <div className="a63-FeedbackState-media" data-slot="feedback-state-media">
            {iconNode}
          </div>
        ) : null}

        <div className="a63-FeedbackState-title" data-slot="feedback-state-title">
          {finalTitle}
        </div>
        <div className="a63-FeedbackState-description" data-slot="feedback-state-description">
          {finalDescription}
        </div>
      </div>

      {actions && actions.length > 0 ? (
        <div className="a63-FeedbackState-content" data-slot="feedback-state-content">
          {actions.map(action => (
            <FeedbackStateActionButton
              action={action}
              key={`${action.label}-${action.href ?? 'button'}`}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}
