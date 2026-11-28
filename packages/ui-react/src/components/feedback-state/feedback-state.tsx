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

/** Replaces the built-in English copy, per kind. The `title` and `description` props still win. */
export interface FeedbackStateLabels {
  /** The default title of each kind, e.g. `{ error: 'Etwas ist schiefgelaufen' }`. */
  titles?: Partial<Record<FeedbackStateKind, string>>
  /** The default description of each kind. */
  descriptions?: Partial<Record<FeedbackStateKind, string>>
  /** The no-results description when `query` is set. Defaults to `No results found for "{query}"`. */
  noResults?: (query: string) => string
}

/** Native `div` attributes and `ref` reach the root (`title` is the heading text). */
export interface FeedbackStateProps extends Omit<
  React.ComponentProps<'div'>,
  'children' | 'title'
> {
  actions?: FeedbackStateAction[]
  className?: string
  description?: string
  error?: unknown
  icon?: FeedbackStateIcon
  /** Heading level of the title, to fit the page outline. Defaults to 3. */
  level?: 1 | 2 | 3 | 4 | 5 | 6
  query?: string
  showIcon?: boolean
  size?: FeedbackStateSize
  state?: FeedbackStateKind
  title?: string
  labels?: FeedbackStateLabels
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
    defaultDescription: 'This will only take a moment',
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
  labels,
  query,
  state,
}: Pick<FeedbackStateProps, 'description' | 'labels' | 'query'> & {
  state: FeedbackStateKind
}) {
  if (description) {
    return description
  }

  if (state === 'no-results' && query) {
    return labels?.noResults ? labels.noResults(query) : `No results found for "${query}"`
  }

  return labels?.descriptions?.[state] ?? stateConfig[state].defaultDescription
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
   `.a63-FeedbackState-*` elements so this pattern stays self-contained.
   The root is one live region that stays mounted across states, so a change of
   state only changes its text and screen readers announce it: polite
   (role=status) for loading and the result states. An error mounts a fresh
   role=alert root instead, since screen readers announce an alert when it is
   inserted but not reliably when a live region changes its role. It is never
   aria-busy, which would silence it; mark the content being loaded busy instead. */
export function FeedbackState({
  actions,
  className,
  description,
  error,
  icon,
  labels,
  level = 3,
  query,
  showIcon = true,
  size = feedbackStateContract.defaultSize,
  state = feedbackStateContract.defaultKind,
  title,
  ...props
}: FeedbackStateProps): React.ReactElement {
  const config = stateConfig[state]
  const finalDescription = getFeedbackDescription({ description, labels, query, state })
  const finalTitle = title || labels?.titles?.[state] || config.defaultTitle
  // An Error's message is technical detail, so it sits under the friendly description.
  const detail = state === 'error' && error instanceof Error ? error.message : ''
  const iconNode = renderFeedbackIcon(icon ?? config.icon)
  const Heading = `h${level}` as const

  return (
    <div
      aria-live={state === 'error' ? 'assertive' : 'polite'}
      className={cn('a63-FeedbackState', className)}
      data-size={size}
      data-slot="feedback-state"
      data-state={state}
      key={state === 'error' ? 'alert' : 'status'}
      role={state === 'error' ? 'alert' : 'status'}
      {...props}
    >
      <div className="a63-FeedbackState-header" data-slot="feedback-state-header">
        {showIcon && iconNode ? (
          <div className="a63-FeedbackState-media" data-slot="feedback-state-media">
            {iconNode}
          </div>
        ) : null}

        <Heading className="a63-FeedbackState-title" data-slot="feedback-state-title">
          {finalTitle}
        </Heading>
        <div className="a63-FeedbackState-description" data-slot="feedback-state-description">
          {finalDescription}
        </div>
        {detail ? (
          <div className="a63-FeedbackState-detail" data-slot="feedback-state-detail">
            {detail}
          </div>
        ) : null}
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
