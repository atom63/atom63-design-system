import type { BadgeSize, BadgeVariant } from '@atom63/ui-foundation'
import { badgeContract } from '@atom63/ui-foundation'
import { mergeProps } from '@base-ui/react/merge-props'
import { useRender } from '@base-ui/react/use-render'
import type * as React from 'react'

import { cn } from '../../lib/cn'

export type BadgeProps = useRender.ComponentProps<'span'> & {
  variant?: BadgeVariant
  size?: BadgeSize
}

/* A small labeled chip — the marker archetype. Renders a <span> by default;
   pass `render={<a />}` / `render={<button />}` for an interactive badge. */
export function Badge({
  className,
  render,
  variant = badgeContract.defaultVariant,
  size = badgeContract.defaultSize,
  ...props
}: BadgeProps): React.ReactElement {
  const defaultProps = {
    className: cn('a63-Badge', className),
    'data-slot': 'badge',
    'data-variant': variant,
    'data-size': size,
  }
  return useRender({
    defaultTagName: 'span',
    props: mergeProps<'span'>(defaultProps, props),
    render,
  })
}
