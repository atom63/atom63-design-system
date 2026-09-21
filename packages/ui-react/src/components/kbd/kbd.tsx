import { type KbdSize, kbdContract } from '@atom63/ui-foundation'
import type * as React from 'react'

import { cn } from '../../lib/cn'

export type KbdProps = React.ComponentProps<'kbd'> & {
  size?: KbdSize
}

/* Presentational keyboard-key cap. `KbdGroup` lays out a sequence (e.g. ⌘ + K). */
export function Kbd({
  className,
  size = kbdContract.defaultSize,
  ...props
}: KbdProps): React.ReactElement {
  return <kbd className={cn('a63-Kbd', className)} data-size={size} data-slot="kbd" {...props} />
}

export function KbdGroup({ className, ...props }: React.ComponentProps<'div'>): React.ReactElement {
  return <div className={cn('a63-KbdGroup', className)} data-slot="kbd-group" {...props} />
}
