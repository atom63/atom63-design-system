import type { ReactElement } from 'react'

import { cn } from '../lib/cn'
import { SLOT_SIZE_CLASS } from './control-slot'

export type InformDismissButtonProps = {
  label?: string
  onDismiss?: () => void
  className?: string
}

/**
 * Dismiss control for a message row's trailing gutter.
 *
 * Its layout box is one line tall so it aligns with the first line of text the
 * same way the leading icon does; the 24px WCAG target is an invisible
 * expansion that costs no layout. Sizing the box itself to the target is what
 * previously pushed the icon below the text and needed a per-surface offset to
 * undo.
 */
export function InformDismissButton({
  className,
  label = 'Dismiss',
  onDismiss,
}: InformDismissButtonProps): ReactElement {
  return (
    <button
      aria-label={label}
      className={cn(SLOT_SIZE_CLASS, 'a63-InformDismissButton', className)}
      onClick={onDismiss}
      type="button"
    >
      <svg
        aria-hidden
        fill="none"
        height="14"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.5"
        viewBox="0 0 16 16"
        width="14"
      >
        <path d="M4 4l8 8M12 4l-8 8" />
      </svg>
    </button>
  )
}
