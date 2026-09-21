'use client'

import { type TextareaSize, textareaContract } from '@atom63/ui-foundation'
import type * as React from 'react'

import { cn } from '../../lib/cn'

export type TextareaProps = Omit<React.ComponentProps<'textarea'>, 'className'> & {
  /** Class applied to the control wrapper. */
  className?: string
  /** Marks the field invalid and switches focus feedback to the danger color. */
  invalid?: boolean
  /** Control-ramp size used for padding, type, and minimum height. */
  size?: TextareaSize
  /** Drop the recessed field shadow on flat or translucent parent surfaces. */
  shadow?: boolean
  /** Class applied directly to the native textarea element. */
  textareaClassName?: string
  /** Drop the field chrome (border/bg/shadow) so it can nest inside a parent
   *  that provides the chrome. The control wrapper collapses to `display:
   *  contents`. */
  unstyled?: boolean
}

/*
 * Multiline text field — the recessed control, faithful to prod @atom63/ui
 * textarea.tsx. Two-part anatomy: a `textarea-control` wrapper owns the field
 * chrome (border, recessed --a63-field-shadow, focus-within ring) and the inner
 * <textarea> is the transparent, auto-sizing text field. Shares the recessed
 * field vocabulary with Input. `className` targets the control box.
 */
export function Textarea({
  'aria-invalid': ariaInvalid,
  className,
  disabled,
  invalid = false,
  shadow = true,
  size = textareaContract.defaultSize,
  textareaClassName,
  unstyled = false,
  ...props
}: TextareaProps): React.ReactElement {
  const isInvalid = invalid || ariaInvalid === true || ariaInvalid === 'true'

  return (
    <span
      className={cn('a63-Textarea', className)}
      data-disabled={disabled ? '' : undefined}
      data-invalid={isInvalid ? '' : undefined}
      data-shadow={shadow ? undefined : 'false'}
      data-size={size}
      data-slot="textarea-control"
      data-unstyled={unstyled ? '' : undefined}
    >
      <textarea
        aria-invalid={isInvalid ? true : ariaInvalid}
        className={cn('a63-Textarea-field', textareaClassName)}
        data-slot="textarea"
        disabled={disabled}
        {...props}
      />
    </span>
  )
}
