'use client'

import { type AlertVariant, alertContract } from '@atom63/ui-foundation'
import type * as React from 'react'

import { cn } from '../../lib/cn'

export type AlertProps = React.ComponentProps<'div'> & {
  variant?: AlertVariant
}

/*
 * Status callout — faithful to prod @atom63/ui alert.tsx. A grid card with a
 * default (neutral) variant plus four semantic tones (error/info/success/
 * warning); an AlertIcon / leading <svg> and an AlertAction slot re-flow the
 * grid columns.
 * Recolored with --a63-* status tokens.
 */
export function Alert({ className, variant, ...props }: AlertProps): React.ReactElement {
  const alertVariant = variant ?? alertContract.defaultVariant
  return (
    <div
      className={cn('a63-Alert', className)}
      data-slot="alert"
      data-variant={alertVariant}
      role="alert"
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
