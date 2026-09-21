'use client'

import { type InputSize, inputContract } from '@atom63/ui-foundation'
import { Input as InputPrimitive } from '@base-ui/react/input'
import type * as React from 'react'

import { cn } from '../../lib/cn'

export type InputProps = Omit<
  InputPrimitive.Props & React.RefAttributes<HTMLInputElement>,
  'size' | 'className'
> & {
  className?: string
  invalid?: boolean
  /** Control ramp size, or a `number` forwarded to the native `size` attribute
   *  for character-width sizing (prod parity — `<Input size={20} />`). */
  size?: InputSize | number
  /** Drop the field chrome (border/bg/shadow) so the input nests inside an
   *  InputGroup, which provides the chrome. The control wrapper collapses to
   *  `display: contents`. */
  unstyled?: boolean
  /** Render a plain `<input>` instead of Base UI Input (prod parity for
   *  composition sites that need a native element). */
  nativeInput?: boolean
  /** Extra class merged onto the inner `.a63-Input-field` (prod parity). Use for
   *  field-level tweaks the control-box `className` can't reach — e.g. `pl-9` to
   *  clear an absolutely-positioned leading icon. */
  inputClassName?: string
  /** Drop the recessed field shadow (`--field-shadow`) — for inputs on
   *  translucent/flat chrome (search bars, toolbars). Defaults to true. */
  shadow?: boolean
}

function isAriaInvalid(value: React.AriaAttributes['aria-invalid'] | undefined): boolean {
  return value === true || value === 'true'
}

/*
 * Text field — the recessed counterpart to Button. Two-part anatomy (mirrors
 * production @atom63/ui): a `input-control` wrapper owns the field chrome
 * (border, recessed --a63-field-shadow, focus-within ring) and the inner Base UI
 * `Input` is the transparent text field. `className` targets the control box.
 */
export function Input({
  'aria-invalid': ariaInvalid,
  className,
  disabled,
  inputClassName,
  invalid = false,
  nativeInput = false,
  shadow = true,
  size = inputContract.defaultSize,
  unstyled = false,
  ...props
}: InputProps): React.ReactElement {
  const isInvalid = invalid || isAriaInvalid(ariaInvalid)
  const isNumericSize = typeof size === 'number'
  // Numeric sizes drive the native char-width attribute; the ramp stays at the
  // default step. String sizes drive the [data-size] ramp (prod parity).
  const dataSize: InputSize = isNumericSize ? inputContract.defaultSize : size
  const fieldProps = {
    className: cn('a63-Input-field', inputClassName),
    'data-slot': 'input' as const,
    disabled,
    size: isNumericSize ? size : undefined,
    'aria-invalid': isInvalid ? true : ariaInvalid,
  }

  return (
    <span
      className={cn('a63-Input', className)}
      data-disabled={disabled ? '' : undefined}
      data-invalid={isInvalid ? '' : undefined}
      data-shadow={shadow ? undefined : 'false'}
      data-size={dataSize}
      data-slot="input-control"
      data-unstyled={unstyled ? '' : undefined}
    >
      {nativeInput ? (
        <input {...fieldProps} {...(props as React.ComponentProps<'input'>)} />
      ) : (
        <InputPrimitive {...fieldProps} {...props} />
      )}
    </span>
  )
}

export { InputPrimitive }
