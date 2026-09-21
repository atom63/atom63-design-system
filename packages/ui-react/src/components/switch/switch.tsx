'use client'

import { type SwitchSize, switchContract } from '@atom63/ui-foundation'
import { Switch as SwitchPrimitive } from '@base-ui/react/switch'
import type * as React from 'react'

import { cn } from '../../lib/cn'

export type SwitchProps = Omit<SwitchPrimitive.Root.Props, 'className'> & {
  className?: string
  /** Optional content rendered inside the thumb (e.g. sun/moon icons). */
  children?: React.ReactNode
  size?: SwitchSize
}

/*
 * Switch — the selection archetype (bistate on/off), the iOS-vs-web
 * design-language showcase. Two-part anatomy (mirrors production @atom63/ui):
 * `Switch.Root` is the track, `Switch.Thumb` the knob. Checked = the brand-accent
 * fill + thumb slides right; the track geometry is driven by --a63-switch-thumb-size
 * (enlarged for iOS). Base UI stamps data-checked/data-disabled.
 *
 * Pass `children` to decorate the thumb (icons, glyphs).
 */
export function Switch({
  children,
  className,
  size = switchContract.defaultSize,
  ...props
}: SwitchProps): React.ReactElement {
  return (
    <SwitchPrimitive.Root
      className={cn('a63-Switch', className)}
      data-size={size}
      data-slot="switch"
      {...props}
    >
      <SwitchPrimitive.Thumb className="a63-Switch-thumb" data-slot="switch-thumb">
        {children}
      </SwitchPrimitive.Thumb>
    </SwitchPrimitive.Root>
  )
}
