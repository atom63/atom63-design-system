'use client'

import { type ProgressTone, progressContract } from '@atom63/ui-foundation'
import { Progress as ProgressPrimitive } from '@base-ui/react/progress'
import type * as React from 'react'

import { cn } from '../../lib/cn'

/* Progress — a determinate/indeterminate bar (Base UI Progress). Faithful to
   prod @atom63/ui: a recessed track + a filled indicator that animates its
   width, plus optional Label/Value rows. Chrome (track inset, indicator sheen)
   reads --a63-* tokens. Renders its default Track+Indicator when given no
   children. */
export type ProgressProps = ProgressPrimitive.Root.Props & {
  /**
   * The indicator's colour. `accent` (the default) is the brand primary;
   * `neutral` is the primary text colour on a muted track.
   */
  tone?: ProgressTone
}

export function Progress({
  className,
  children,
  tone = progressContract.defaultTone,
  ...props
}: ProgressProps): React.ReactElement {
  return (
    <ProgressPrimitive.Root
      className={cn('a63-Progress', className)}
      data-slot="progress"
      data-tone={tone}
      {...props}
    >
      {children ?? (
        <ProgressTrack>
          <ProgressIndicator />
        </ProgressTrack>
      )}
    </ProgressPrimitive.Root>
  )
}

export function ProgressLabel({
  className,
  ...props
}: ProgressPrimitive.Label.Props): React.ReactElement {
  return (
    <ProgressPrimitive.Label
      className={cn('a63-Progress-label', className)}
      data-slot="progress-label"
      {...props}
    />
  )
}

export function ProgressTrack({
  className,
  ...props
}: ProgressPrimitive.Track.Props): React.ReactElement {
  return (
    <ProgressPrimitive.Track
      className={cn('a63-Progress-track', className)}
      data-slot="progress-track"
      {...props}
    />
  )
}

export function ProgressIndicator({
  className,
  ...props
}: ProgressPrimitive.Indicator.Props): React.ReactElement {
  return (
    <ProgressPrimitive.Indicator
      className={cn('a63-Progress-indicator', className)}
      data-slot="progress-indicator"
      {...props}
    />
  )
}

export function ProgressValue({
  className,
  ...props
}: ProgressPrimitive.Value.Props): React.ReactElement {
  return (
    <ProgressPrimitive.Value
      className={cn('a63-Progress-value', className)}
      data-slot="progress-value"
      {...props}
    />
  )
}

export { ProgressPrimitive }
