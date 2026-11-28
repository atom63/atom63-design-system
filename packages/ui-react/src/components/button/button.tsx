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
import type { ReactNode } from 'react'

import { cn } from '../../lib/cn'
import { wrapTextRuns } from '../../lib/wrap-text-runs'

export interface ButtonProps extends useRender.ComponentProps<'button'> {
  /** An unread dot (`true`) or a count at the top-end corner, such as unread notifications. */
  indicator?: boolean | number
  /** What the indicator means, added to the accessible name. Defaults to "New" for a dot and "{n} new" for a count, with "99+" above 99 as drawn. Include the drawn count in your own label. */
  indicatorLabel?: string
  /** Busy: shows a spinner and blocks activation, but keeps the button focusable (`aria-disabled`), so keyboard focus stays on a submit button while it works. */
  loading?: boolean
  /**
   * Whether the rendered element is a native `<button>`. Defaults to `true`, or `false` when
   * `render` is set. A non-native element (a link) gets no `type` and no native `disabled`;
   * `disabled` then sets `aria-disabled` and blocks activation.
   */
  nativeButton?: boolean
  /** `round` gives a full radius: a circle for icon sizes, a pill for labelled ones. */
  shape?: ButtonShape
  size?: ButtonSize
  /** `muted` (ghost only) rests in the secondary text colour and goes to full contrast on hover, focus and press: a quiet secondary action. */
  tone?: ButtonTone
  variant?: ButtonVariant
  /** Mirrored to `data-trigger-slot`; root `data-slot` stays `"button"`. */
  'data-slot'?: string
}

/* Each run of label text goes in one `.a63-Button-text`, which truncates with
   an ellipsis when the button is narrower than its label. */
function compactButtonChildren(children: ReactNode): ReactNode {
  return wrapTextRuns(children, (text, key) => (
    <span className="a63-Button-text" data-slot="button-text" key={key}>
      {text}
    </span>
  ))
}

/* Cancel activation of a button that is busy or (when not native) disabled. */
function blockActivation(event: React.SyntheticEvent) {
  event.preventDefault()
  event.stopPropagation()
}

export function Button({
  children,
  className,
  disabled,
  indicator,
  indicatorLabel,
  loading = false,
  nativeButton,
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
  const isNative = nativeButton ?? render === undefined
  /* Only an explicitly disabled native button takes the `disabled` attribute.
     A loading one stays focusable, so a focused submit button keeps focus. */
  const nativeDisabled = isNative && Boolean(disabled)
  const softDisabled = isDisabled && !nativeDisabled
  const hasIndicator = indicator === true || (typeof indicator === 'number' && indicator > 0)
  /* The count as drawn: above 99 it reads "99+". The default name uses the same
     text, so what a sighted voice-control user sees is part of the name (WCAG 2.5.3). */
  const indicatorCount =
    typeof indicator === 'number' ? (indicator > 99 ? '99+' : String(indicator)) : null
  const indicatorText = !hasIndicator
    ? undefined
    : (indicatorLabel ?? (indicator === true ? 'New' : `${indicatorCount} new`))
  /* An aria-label replaces the content as the accessible name, so the indicator
     text joins it there; otherwise it is visually hidden text after the label. */
  const ariaLabel = props['aria-label']
  const defaultProps = {
    'aria-busy': loading ? true : undefined,
    'aria-disabled': softDisabled ? true : undefined,
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
            {indicatorCount}
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
    ...(isNative ? { disabled: nativeDisabled, type: type ?? 'button' } : type && { type }),
  }
  const ownProps =
    hasIndicator && ariaLabel ? { ...props, 'aria-label': `${ariaLabel}, ${indicatorText}` } : props

  const merged = mergeProps<'button'>(defaultProps, ownProps)
  /* The caller's onClick does not run, and a submit or a link does not fire. */
  if (softDisabled) merged.onClick = blockActivation

  return useRender({
    defaultTagName: 'button',
    props: merged,
    render,
  })
}
