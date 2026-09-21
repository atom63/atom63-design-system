'use client'

import { type RadioSize, radioContract } from '@atom63/ui-foundation'
import { Radio as RadioPrimitive } from '@base-ui/react/radio'
import { RadioGroup as RadioGroupPrimitive } from '@base-ui/react/radio-group'
import type * as React from 'react'

import { cn } from '../../lib/cn'

export type RadioGroupProps = Omit<RadioGroupPrimitive.Props, 'className'> & {
  className?: string
}

export function RadioGroup({ className, ...props }: RadioGroupProps): React.ReactElement {
  return (
    <RadioGroupPrimitive
      className={cn('a63-RadioGroup', className)}
      data-slot="radio-group"
      {...props}
    />
  )
}

export type RadioProps = Omit<RadioPrimitive.Root.Props, 'className'> & {
  className?: string
  size?: RadioSize
}

/*
 * Radio — the selection archetype (single-choice). `Radio.Root` is the circular
 * box, `Radio.Indicator` the accent fill + centered dot. Checked fills with the
 * shared --a63-selection-accent (brand primary). Base UI stamps data-checked /
 * data-unchecked / data-disabled. Exported also as `RadioGroupItem`.
 */
export function Radio({
  className,
  size = radioContract.defaultSize,
  ...props
}: RadioProps): React.ReactElement {
  return (
    <RadioPrimitive.Root
      className={cn('a63-Radio', className)}
      data-size={size}
      data-slot="radio"
      {...props}
    >
      <RadioPrimitive.Indicator className="a63-Radio-indicator" data-slot="radio-indicator" />
    </RadioPrimitive.Root>
  )
}

export { Radio as RadioGroupItem, RadioPrimitive }
