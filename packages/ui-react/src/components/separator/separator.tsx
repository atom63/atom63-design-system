'use client'

import { type SeparatorVariant, separatorContract } from '@atom63/ui-foundation'
import { Separator as SeparatorPrimitive } from '@base-ui/react/separator'
import type React from 'react'

import { cn } from '../../lib/cn'

export type SeparatorProps = SeparatorPrimitive.Props & {
  /** Hide a purely visual divider from assistive technology. */
  decorative?: boolean
  /** Solid hairline (default) or a soft edge-to-edge gradient fade. */
  variant?: SeparatorVariant
}

/* A visual divider — the Base UI Separator primitive (faithful to prod
   @atom63/ui). The line color/thickness + optional gradient fade come from the
   recipe reading --a63-* tokens off orientation + variant data attributes. */
export function Separator({
  className,
  decorative = false,
  orientation = separatorContract.defaultOrientation,
  variant = separatorContract.defaultVariant,
  ...props
}: SeparatorProps): React.ReactElement {
  return (
    <SeparatorPrimitive
      {...(decorative ? { 'aria-hidden': true, role: 'presentation' } : {})}
      className={cn('a63-Separator', className)}
      data-slot="separator"
      data-variant={variant}
      orientation={orientation}
      {...props}
    />
  )
}

export { SeparatorPrimitive }
