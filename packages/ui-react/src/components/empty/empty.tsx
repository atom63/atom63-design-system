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
  ...props
}: React.ComponentProps<'div'>): React.ReactElement {
  return (
    <div
      aria-level={3}
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

export function EmptyErrorDetail({
  className,
  error,
  ...props
}: React.ComponentProps<'div'> & { error: string }): React.ReactElement {
  const [expanded, setExpanded] = useState(false)
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
        onClick={() => setExpanded(value => !value)}
        size="sm"
        type="button"
        variant="ghost"
      >
        {expanded ? 'Hide details' : 'Show details'}
      </Button>
      {expanded && (
        <div className="a63-Empty-errorBox" data-slot="empty-error-box" id={detailId}>
          <pre className="a63-Empty-errorText" data-slot="empty-error-text">
            {error}
          </pre>
          <div className="a63-Empty-errorCopy" data-slot="empty-error-copy">
            <CopyButton label="Error" size="icon-sm" value={error} variant="ghost" />
          </div>
        </div>
      )}
    </div>
  )
}
