'use client'

import { type AlertVariant, alertContract } from '@atom63/ui-foundation'
import type * as React from 'react'

import { cn } from '../../lib/cn'

export type AlertProps = React.ComponentProps<'div'> & {
  variant?: AlertVariant
}

/* The live-region role each tone defaults to: a persistent info or success
   notice waits its turn instead of cutting off what a screen reader is reading. */
const alertRoles = {
  default: 'status',
  error: 'alert',
  info: 'status',
  success: 'status',
  warning: 'alert',
} as const satisfies Record<AlertVariant, 'alert' | 'status'>

/**
 * A status callout: a neutral default plus the error, info, success and warning
 * tones. AlertIcon and AlertAction re-flow its grid columns.
 *
 * It is a live region whose politeness follows the tone: error and warning
 * render `role="alert"` (assertive), default, info and success render
 * `role="status"` (polite). Pass `role` to override. Colour alone does not
 * carry the tone, so name it in AlertTitle ("Saved", "Couldn't save").
 */
export function Alert({ className, variant, ...props }: AlertProps): React.ReactElement {
  const alertVariant = variant ?? alertContract.defaultVariant
  return (
    <div
      className={cn('a63-Alert', className)}
      data-slot="alert"
      data-variant={alertVariant}
      role={alertRoles[alertVariant]}
      {...props}
    />
  )
}

export function AlertTitle({
  className,
  ...props
}: React.ComponentProps<'div'>): React.ReactElement {
  return <div className={cn('a63-Alert-title', className)} data-slot="alert-title" {...props} />
}

export function AlertIcon({
  className,
  ...props
}: React.ComponentProps<'div'>): React.ReactElement {
  return <div className={cn('a63-Alert-icon', className)} data-slot="alert-icon" {...props} />
}

export function AlertDescription({
  className,
  ...props
}: React.ComponentProps<'div'>): React.ReactElement {
  return (
    <div
      className={cn('a63-Alert-description', className)}
      data-slot="alert-description"
      {...props}
    />
  )
}

export function AlertAction({
  className,
  ...props
}: React.ComponentProps<'div'>): React.ReactElement {
  return <div className={cn('a63-Alert-action', className)} data-slot="alert-action" {...props} />
}
