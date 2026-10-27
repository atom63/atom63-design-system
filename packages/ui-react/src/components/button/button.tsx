'use client'

import {
  type ButtonShape,
  type ButtonSize,
  type ButtonTone,
  type ButtonVariant,
  buttonContract,
} from '@atom63/ui-foundation'
import { mergeProps } from '@base-ui/react/merge-props'
import { useRender } from '@base-ui/react/use-render'
import { Children, type ReactNode } from 'react'

import { cn } from '../../lib/cn'

export interface ButtonProps extends useRender.ComponentProps<'button'> {
  /** An unread dot (`true`) or a count at the top-end corner, such as unread notifications. */
  indicator?: boolean | number
  /** What the indicator means, added to the accessible name. Defaults to "New" for a dot and "{n} new" for a count. */
  indicatorLabel?: string
  loading?: boolean
  /** `round` gives a full radius: a circle for icon sizes, a pill for labelled ones. */
  shape?: ButtonShape
  size?: ButtonSize
  /** `muted` (ghost only) rests in the secondary text colour and goes to full contrast on hover, focus and press: a quiet secondary action. */
  tone?: ButtonTone
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
  indicator,
  indicatorLabel,
  loading = false,
  render,
  shape = buttonContract.defaultShape,
  size = buttonContract.defaultSize,
  tone = buttonContract.defaultTone,
  type,
  variant = buttonContract.defaultVariant,
  'data-slot': triggerSlot,
  ...props
}: ButtonProps): React.ReactElement {
  const isDisabled = Boolean(disabled || loading)
  const hasIndicator = indicator === true || (typeof indicator === 'number' && indicator > 0)
  const indicatorText = !hasIndicator
    ? undefined
    : (indicatorLabel ?? (indicator === true ? 'New' : `${indicator} new`))
  /* An aria-label replaces the content as the accessible name, so the indicator
     text joins it there; otherwise it is visually hidden text after the label. */
  const ariaLabel = props['aria-label']
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
        {hasIndicator ? (
          <span
            aria-hidden
            className="a63-Button-indicator"
            data-count={typeof indicator === 'number' ? '' : undefined}
            data-slot="button-indicator"
          >
            {typeof indicator === 'number' ? (indicator > 99 ? '99+' : indicator) : null}
          </span>
        ) : null}
        {hasIndicator && !ariaLabel ? (
          <span className="a63-Button-indicator-label">{`, ${indicatorText}`}</span>
        ) : null}
      </>
    ),
    className: cn('a63-Button', className),
    'data-button': '',
    'data-disabled': isDisabled ? '' : undefined,
    'data-loading': loading ? '' : undefined,
    'data-shape': shape,
    'data-size': size,
    'data-slot': 'button',
    'data-tone': tone,
    'data-trigger-slot': triggerSlot,
    'data-variant': variant,
    disabled: isDisabled,
    type: type ?? 'button',
  }
  const ownProps =
    hasIndicator && ariaLabel ? { ...props, 'aria-label': `${ariaLabel}, ${indicatorText}` } : props

  return useRender({
    defaultTagName: 'button',
    props: mergeProps<'button'>(defaultProps, ownProps),
    render,
  })
}
