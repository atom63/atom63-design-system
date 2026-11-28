'use client'

import { type EmptyMediaVariant, emptyContract } from '@atom63/ui-foundation'
import type * as React from 'react'
import { useId, useState } from 'react'

import { cn } from '../../lib/cn'
import { Button } from '../button'
import { CopyButton } from '../copy-button'

export type { EmptyMediaVariant }

/*
 * Empty — the empty/error-state layout parts ported faithfully from prod
 * @atom63/ui. Prod used cva only for EmptyMedia's variant; here that axis is a
 * `data-variant` data-attr fed by the foundation contract (mirrors Badge), and
 * every Tailwind class maps to the `.a63-Empty*` recipe. The error slot
 * (EmptyErrorDetail) still composes the DS CopyButton for the collapsible
 * error text.
 */

export function Empty({ className, ...props }: React.ComponentProps<'div'>): React.ReactElement {
  return <div className={cn('a63-Empty', className)} data-slot="empty" {...props} />
}

export function EmptyHeader({
  className,
  ...props
}: React.ComponentProps<'div'>): React.ReactElement {
  return <div className={cn('a63-Empty-header', className)} data-slot="empty-header" {...props} />
}

export function EmptyMedia({
  className,
  variant = emptyContract.defaultMediaVariant,
  ...props
}: React.ComponentProps<'div'> & { variant?: EmptyMediaVariant }): React.ReactElement {
  return (
    <div
      className={cn('a63-Empty-media', className)}
      data-slot="empty-icon"
      data-variant={variant}
      {...props}
    />
  )
}

export function EmptyTitle({
  className,
  level = 3,
  ...props
}: React.ComponentProps<'div'> & {
  /** Heading level of the title, to fit the page outline. Defaults to 3. */
  level?: 1 | 2 | 3 | 4 | 5 | 6
}): React.ReactElement {
  return (
    <div
      aria-level={level}
      className={cn('a63-Empty-title', className)}
      data-slot="empty-title"
      role="heading"
      {...props}
    />
  )
}

export function EmptyDescription({
  className,
  ...props
}: React.ComponentProps<'div'>): React.ReactElement {
  return (
    <div
      className={cn('a63-Empty-description', className)}
      data-slot="empty-description"
      {...props}
    />
  )
}

export function EmptyContent({
  className,
  ...props
}: React.ComponentProps<'div'>): React.ReactElement {
  return <div className={cn('a63-Empty-content', className)} data-slot="empty-content" {...props} />
}

export interface EmptyErrorDetailLabels {
  /** The toggle while the detail is hidden. Defaults to "Show details". */
  showDetails?: string
  /** The toggle while the detail shows. Defaults to "Hide details". */
  hideDetails?: string
  /** What the copy button copies, in its name ("Copy …"). Defaults to "Error". */
  copy?: string
}

export type EmptyErrorDetailProps = React.ComponentProps<'div'> & {
  error: string
  labels?: EmptyErrorDetailLabels
  /** Whether the detail shows, when you control it. */
  expanded?: boolean
  /** Whether the detail shows at first, when you don't control it. Defaults to `false`. */
  defaultExpanded?: boolean
  /** Called with the next value when the toggle is pressed. */
  onExpandedChange?: (expanded: boolean) => void
}

export function EmptyErrorDetail({
  className,
  defaultExpanded = false,
  error,
  expanded: expandedProp,
  labels,
  onExpandedChange,
  ...props
}: EmptyErrorDetailProps): React.ReactElement {
  const [uncontrolledExpanded, setUncontrolledExpanded] = useState(defaultExpanded)
  const expanded = expandedProp ?? uncontrolledExpanded
  const toggle = () => {
    const next = !expanded
    if (expandedProp === undefined) setUncontrolledExpanded(next)
    onExpandedChange?.(next)
  }
  const detailId = useId()

  return (
    <div
      className={cn('a63-Empty-errorDetail', className)}
      data-slot="empty-error-detail"
      data-state={expanded ? 'expanded' : 'collapsed'}
      {...props}
    >
      <Button
        aria-controls={detailId}
        aria-expanded={expanded}
        className="a63-Empty-errorToggle"
        data-slot="empty-error-toggle"
        onClick={toggle}
        size="sm"
        tone="muted"
        type="button"
        variant="ghost"
      >
        {expanded
          ? (labels?.hideDetails ?? 'Hide details')
          : (labels?.showDetails ?? 'Show details')}
      </Button>
      {expanded && (
        <div className="a63-Empty-errorBox" data-slot="empty-error-box" id={detailId}>
          <pre className="a63-Empty-errorText" data-slot="empty-error-text">
            {error}
          </pre>
          <div className="a63-Empty-errorCopy" data-slot="empty-error-copy">
            <CopyButton
              label={labels?.copy ?? 'Error'}
              size="icon-sm"
              value={error}
              variant="ghost"
            />
          </div>
        </div>
      )}
    </div>
  )
}
