'use client'

import { type ToggleSize, type ToggleTone, toggleContract } from '@atom63/ui-foundation'
import { Toggle as TogglePrimitive } from '@base-ui/react/toggle'
import type * as React from 'react'

import { cn } from '../../lib/cn'

export type ToggleProps = Omit<TogglePrimitive.Props, 'className'> & {
  className?: string
  size?: ToggleSize
  tone?: ToggleTone
}

/*
 * Toggle — a quiet bistate pressable (Base UI Toggle → data-pressed). Geometry
 * reuses the --a63-control-* ramp; pressed fill uses the segment/toggle tokens
 * (not Button chrome). For a welded segmented set, use ToggleGroup — that owns
 * the special joined gel style. For a gapped row, compose individual Toggles.
 */
export function Toggle({
  children,
  className,
  size = toggleContract.defaultSize,
  tone = toggleContract.defaultTone,
  ...props
}: ToggleProps): React.ReactElement {
  return (
    <TogglePrimitive
      className={cn('a63-Toggle', className)}
      data-size={size}
      data-slot="toggle"
      data-tone={tone}
      {...props}
    >
      <span className="a63-Toggle-content" data-slot="toggle-content">
        {children}
      </span>
    </TogglePrimitive>
  )
}
