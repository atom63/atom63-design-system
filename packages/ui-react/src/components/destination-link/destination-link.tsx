'use client'

import { type DestinationKind, destinationLinkContract } from '@atom63/ui-foundation'
import { mergeProps } from '@base-ui/react/merge-props'
import { useRender } from '@base-ui/react/use-render'
import { ExternalLink, Eye } from 'lucide-react'
import * as React from 'react'
import { cn } from '../../lib/cn'

export type { DestinationKind }

export type DestinationLinkProps = Omit<useRender.ComponentProps<'a'>, 'rel' | 'target'> & {
  kind: DestinationKind
}

/**
 * Router-neutral link semantics. Internal destinations may supply a router link
 * through `render`; external destinations always use a native new-tab anchor.
 */
export function DestinationLink({
  'aria-label': ariaLabel,
  children,
  kind,
  render,
  ...props
}: DestinationLinkProps): React.ReactElement {
  const external = kind === 'external'
  const resolvedAriaLabel = external && ariaLabel ? `${ariaLabel} (opens in new tab)` : ariaLabel
  const resolvedChildren =
    external && !ariaLabel ? (
      <>
        {children} <span className="sr-only">(opens in new tab)</span>
      </>
    ) : (
      children
    )

  return useRender({
    defaultTagName: 'a',
    props: mergeProps<'a'>(
      {
        'aria-label': resolvedAriaLabel,
        children: resolvedChildren,
        rel: external ? 'noopener noreferrer' : undefined,
        target: external ? '_blank' : undefined,
      },
      props,
      {
        'data-destination-kind': kind,
        'data-slot': destinationLinkContract.slots[0],
      } as React.ComponentProps<'a'>
    ),
    render: external ? undefined : render,
    state: {
      slot: 'destination-link',
    },
  })
}

/**
 * The glyph that names a destination: it opens a new tab, or it stays in the app.
 *
 * External is `open-in-new`, not a bare diagonal arrow. Measured by rasterising
 * each candidate and taking the alpha-weighted centroid, every bare arrow in the
 * set is ~12% ink with nearly all of it in the head, so its mass sits 1.3+ units
 * off the viewBox centre and it reads as crooked in a centred box unless each
 * call site carries a magic nudge (`north-east` needs 1.24px at 16px;
 * `arrow-outward-rounded`, 1.42px). `open-in-new` needs 0.14px — under a
 * rasterised pixel — so it is self-centring wherever it is used.
 *
 * It also pairs with `eye`: 25% ink in an 18×18 square against the eye's 35%,
 * rather than a wispy 15×15 diagonal beside a solid one. And it states what the
 * link actually does, matching the "(opens in new tab)" that `DestinationLink`
 * appends to the accessible name.
 */
export function DestinationIndicator({
  className,
  kind,
}: {
  className?: string
  kind: DestinationKind
}): React.ReactElement {
  const Icon = kind === 'external' ? ExternalLink : Eye
  return (
    <span
      aria-hidden
      className={cn('inline-flex shrink-0', className)}
      data-destination-kind={kind}
      data-slot={destinationLinkContract.slots[1]}
    >
      <Icon aria-hidden className="size-full" />
    </span>
  )
}
