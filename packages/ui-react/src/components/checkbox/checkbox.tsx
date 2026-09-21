'use client'

import { type CheckboxSize, checkboxContract } from '@atom63/ui-foundation'
import { Checkbox as CheckboxPrimitive } from '@base-ui/react/checkbox'
import type * as React from 'react'

import { cn } from '../../lib/cn'

export type CheckboxProps = Omit<CheckboxPrimitive.Root.Props, 'className'> & {
  className?: string
  size?: CheckboxSize
}

const CheckIcon = (
  <svg aria-hidden="true" fill="none" viewBox="0 0 16 16">
    <path
      d="M13 4.5 6.5 11 3 7.5"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
  </svg>
)
const MinusIcon = (
  <svg aria-hidden="true" fill="none" viewBox="0 0 16 16">
    <path d="M3.5 8h9" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
  </svg>
)

/*
 * Checkbox — the selection archetype (bistate + indeterminate). `Checkbox.Root`
 * is the box, `Checkbox.Indicator` the accent fill + icon overlay. Checked fills
 * with the shared --a63-selection-accent (brand primary). Base UI stamps
 * data-checked / data-indeterminate / data-unchecked / data-disabled.
 */
export function Checkbox({
  className,
  size = checkboxContract.defaultSize,
  ...props
}: CheckboxProps): React.ReactElement {
  return (
    <CheckboxPrimitive.Root
      className={cn('a63-Checkbox', className)}
      data-size={size}
      data-slot="checkbox"
      {...props}
    >
      <CheckboxPrimitive.Indicator
        className="a63-Checkbox-indicator"
        data-slot="checkbox-indicator"
        render={(indicatorProps, state) => (
          <span {...indicatorProps}>{state.indeterminate ? MinusIcon : CheckIcon}</span>
        )}
      />
    </CheckboxPrimitive.Root>
  )
}

export { CheckboxPrimitive }
