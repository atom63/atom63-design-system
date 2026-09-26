import type { ReactElement, ReactNode } from 'react'

import { cn } from '../lib/cn'
import { SLOT_SIZE_CLASS } from './control-slot'

export type InformIconSlotProps = {
  children: ReactNode
  className?: string
}

/**
 * Fixed-footprint holder for a leading icon.
 *
 * The box is one line tall regardless of what is passed, so a 14px glyph and a
 * 20px glyph produce the same layout and the glyph lands on the optical centre
 * of the first line beside it. Being decorative, it owes no touch target.
 *
 * Severity must be carried by the message text, not the glyph, so anything
 * passed here should be `aria-hidden`.
 */
export function InformIconSlot({ children, className }: InformIconSlotProps): ReactElement {
  return (
    <span className={cn(SLOT_SIZE_CLASS, 'a63-InformIconSlot', className)} data-slot="inform-icon">
      {children}
    </span>
  )
}
