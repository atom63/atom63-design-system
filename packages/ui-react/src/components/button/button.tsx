'use client'

import { type ButtonSize, type ButtonVariant, buttonContract } from '@atom63/ui-foundation'
import { mergeProps } from '@base-ui/react/merge-props'
import { useRender } from '@base-ui/react/use-render'
import { Children, type ReactNode } from 'react'

import { cn } from '../../lib/cn'

export interface ButtonProps extends useRender.ComponentProps<'button'> {
  loading?: boolean
  size?: ButtonSize
  variant?: ButtonVariant
  /** Mirrored to `data-trigger-slot`; root `data-slot` stays `"button"`. */
  'data-slot'?: string
}

/** Drop whitespace-only text nodes and trim label strings so JSX newlines
 *  don't inflate the icon↔label gap inside `.a63-Button-label`. */
function compactButtonChildren(children: ReactNode): ReactNode {
  return Children.toArray(children)
    .filter(child => !(typeof child === 'string' && child.trim() === ''))
    .map(child => (typeof child === 'string' ? child.trim() : child))
}

export function Button({
  children,
  className,
  disabled,
  loading = false,
  render,
  size = buttonContract.defaultSize,
  type,
  variant = buttonContract.defaultVariant,
  'data-slot': triggerSlot,
  ...props
}: ButtonProps): React.ReactElement {
  const isDisabled = Boolean(disabled || loading)
  const defaultProps = {
    'aria-busy': loading ? true : undefined,
    children: (
      <>
        <span className="a63-Button-label" data-slot="button-label">
          {compactButtonChildren(children)}
        </span>
        {loading ? (
          <span aria-hidden className="a63-Button-spinner" data-slot="button-spinner" />
        ) : null}
      </>
    ),
    className: cn('a63-Button', className),
    'data-button': '',
    'data-disabled': isDisabled ? '' : undefined,
    'data-loading': loading ? '' : undefined,
    'data-size': size,
    'data-slot': 'button',
    'data-trigger-slot': triggerSlot,
    'data-variant': variant,
    disabled: isDisabled,
    type: type ?? 'button',
  }

  return useRender({
    defaultTagName: 'button',
    props: mergeProps<'button'>(defaultProps, props),
    render,
  })
}
