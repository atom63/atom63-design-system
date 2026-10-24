import type { BadgeDotColor, BadgeSize, BadgeVariant } from '@atom63/ui-foundation'
import { badgeContract } from '@atom63/ui-foundation'
import { mergeProps } from '@base-ui/react/merge-props'
import { useRender } from '@base-ui/react/use-render'
import type * as React from 'react'

import { cn } from '../../lib/cn'

export type BadgeProps = useRender.ComponentProps<'span'> & {
  variant?: BadgeVariant
  size?: BadgeSize
  /** A leading dot: `true` draws it in the text color, a palette hue in that hue. */
  dot?: boolean | BadgeDotColor
}

/* A small labeled chip — the marker archetype. Renders a <span> by default;
   pass `render={<a />}` / `render={<button />}` for an interactive badge. */
export function Badge({
  className,
  render,
  variant = badgeContract.defaultVariant,
  size = badgeContract.defaultSize,
  dot,
  children,
  ...props
}: BadgeProps): React.ReactElement {
  const defaultProps = {
    className: cn('a63-Badge', className),
    'data-slot': 'badge',
    'data-variant': variant,
    'data-size': size,
    children: dot ? (
      <>
        <span
          aria-hidden
          className="a63-Badge-dot"
          data-color={dot === true ? undefined : dot}
          data-slot="badge-dot"
        />
        {children}
      </>
    ) : (
      children
    ),
  }
  return useRender({
    defaultTagName: 'span',
    props: mergeProps<'span'>(defaultProps, props),
    render,
  })
}
