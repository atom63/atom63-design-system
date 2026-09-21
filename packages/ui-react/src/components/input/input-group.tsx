'use client'

import { type InputGroupAlign, type InputSize, inputContract } from '@atom63/ui-foundation'
import * as React from 'react'
import { cn } from '../../lib/cn'
import { Button, type ButtonProps } from '../button'
import { Textarea, type TextareaProps } from '../textarea'
import { Input, type InputProps } from './input'

export type { InputGroupAlign }

interface InputGroupContextValue {
  disabled: boolean
  invalid: boolean
  size: InputSize
}

const InputGroupContext = React.createContext<InputGroupContextValue>({
  disabled: false,
  invalid: false,
  size: inputContract.defaultSize,
})

export interface InputGroupProps extends Omit<React.ComponentProps<'div'>, 'className'> {
  className?: string
  disabled?: boolean
  invalid?: boolean
  size?: InputSize
  /** Drop the recessed field shadow — for groups on translucent/flat chrome
   *  (search bars, toolbars). Mirrors Input's `shadow`. Defaults to true. */
  shadow?: boolean
}

const ADDON_INTERACTIVE_SELECTOR =
  "button, a, input, select, textarea, [role='button'], [role='combobox'], [role='listbox'], [data-slot='select-trigger']"

/*
 * Composable field: the group owns the recessed chrome (shared with .a63-Input)
 * and lays out `[leading addon] [field] [trailing addon]`. Compose it from
 * InputGroupInput + InputGroupAddon (+ Button/Text). `size`/`disabled`/`invalid`
 * propagate to the nested input via context, so you set state once on the group.
 *
 * Block (vertical) addon alignment + InputGroupTextarea stacking match prod
 * @atom63/ui and the foundation input-group contract.
 */
export function InputGroup({
  children,
  className,
  disabled = false,
  invalid = false,
  shadow = true,
  size = inputContract.defaultSize,
  ...props
}: InputGroupProps): React.ReactElement {
  const context = React.useMemo(() => ({ disabled, invalid, size }), [disabled, invalid, size])
  return (
    <InputGroupContext.Provider value={context}>
      <div
        className={cn('a63-InputGroup', className)}
        data-disabled={disabled ? '' : undefined}
        data-invalid={invalid ? '' : undefined}
        data-shadow={shadow ? undefined : 'false'}
        data-size={size}
        data-slot="input-group"
        role="group"
        {...props}
      >
        {children}
      </div>
    </InputGroupContext.Provider>
  )
}

export type InputGroupAddonAlign = InputGroupAlign

export interface InputGroupAddonProps extends Omit<React.ComponentProps<'div'>, 'className'> {
  align?: InputGroupAddonAlign
  className?: string
}

/*
 * A leading/trailing (or block) slot for icons, text, buttons, or shortcuts.
 * Clicking dead space in the addon focuses the field (unless an interactive
 * child was clicked) — prod @atom63/ui parity.
 */
export function InputGroupAddon({
  align = 'inline-start',
  children,
  className,
  onMouseDown,
  ...props
}: InputGroupAddonProps): React.ReactElement {
  return (
    // mousedown only delegates focus to the field (the real control); the addon is a decorative slot
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions -- the input remains the sole interactive control
    <div
      className={cn('a63-InputGroup-addon', className)}
      data-align={align}
      data-slot="input-group-addon"
      onMouseDown={(event: React.MouseEvent<HTMLDivElement>) => {
        onMouseDown?.(event)
        if (event.defaultPrevented) {
          return
        }
        const target = event.target as HTMLElement
        if (target.closest(ADDON_INTERACTIVE_SELECTOR)) {
          return
        }
        event.preventDefault()
        const parent = event.currentTarget.parentElement
        const field = parent?.querySelector<HTMLInputElement | HTMLTextAreaElement>(
          'input, textarea'
        )
        if (field && !parent?.querySelector('input:focus, textarea:focus')) {
          field.focus()
        }
      }}
      {...props}
    >
      {children}
    </div>
  )
}

export type InputGroupInputProps = Omit<InputProps, 'unstyled'>

/*
 * The chrome-less field for a group — reads size/disabled/invalid from context.
 * A per-input `size` overrides the group's context size (prod parity: prod's
 * InputGroupInput passes InputProps through unchanged so an individual field can
 * override the group).
 */
export function InputGroupInput({
  disabled,
  invalid,
  size,
  ...props
}: InputGroupInputProps): React.ReactElement {
  const {
    disabled: groupDisabled,
    invalid: groupInvalid,
    size: groupSize,
  } = React.useContext(InputGroupContext)
  return (
    <Input
      disabled={disabled ?? groupDisabled}
      invalid={invalid ?? groupInvalid}
      size={size ?? groupSize}
      unstyled
      {...props}
    />
  )
}

export type InputGroupTextareaProps = Omit<TextareaProps, 'unstyled'>

/* Chrome-less textarea for block-aligned groups (prod InputGroupTextarea). */
export function InputGroupTextarea({
  disabled,
  ...props
}: InputGroupTextareaProps): React.ReactElement {
  const { disabled: groupDisabled, invalid: groupInvalid } = React.useContext(InputGroupContext)
  return (
    <Textarea
      aria-invalid={props['aria-invalid'] ?? (groupInvalid || undefined)}
      disabled={disabled ?? groupDisabled}
      unstyled
      {...props}
    />
  )
}

export type InputGroupButtonProps = ButtonProps

/* A compact ghost button sized to sit inside the field (e.g. clear / submit). */
export function InputGroupButton({
  size = 'xs',
  variant = 'ghost',
  ...props
}: InputGroupButtonProps): React.ReactElement {
  return <Button data-slot="input-group-button" size={size} variant={variant} {...props} />
}

export type InputGroupTextProps = Omit<React.ComponentProps<'span'>, 'className'> & {
  className?: string
}

/* Muted inline text — a prefix like `https://` or a unit suffix. */
export function InputGroupText({
  children,
  className,
  ...props
}: InputGroupTextProps): React.ReactElement {
  return (
    <span className={cn('a63-InputGroup-text', className)} data-slot="input-group-text" {...props}>
      {children}
    </span>
  )
}
