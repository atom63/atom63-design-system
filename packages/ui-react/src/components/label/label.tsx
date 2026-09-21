'use client'

import type * as React from 'react'

import { cn } from '../../lib/cn'

export type LabelProps = React.ComponentProps<'label'>

/* A form field label — a plain <label> (faithful to prod @atom63/ui). Follows
   its associated control's disabled state via the peer/group `data-disabled`
   selectors handled in the recipe. */
export function Label({ className, ...props }: LabelProps): React.ReactElement {
  // eslint-disable-next-line jsx-a11y/label-has-associated-control -- association is supplied by each composition via htmlFor or nesting
  return <label className={cn('a63-Label', className)} data-slot="label" {...props} />
}
