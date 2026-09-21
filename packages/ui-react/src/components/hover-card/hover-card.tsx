'use client'

import { PreviewCard as HoverCardPrimitive } from '@base-ui/react/preview-card'
import type * as React from 'react'

import { cn } from '../../lib/cn'
import { usePortalContainer } from '../portal-container'

/*
 * HoverCard — a hover-triggered preview popover (Base UI PreviewCard), the
 * OVERLAY archetype. `HoverCard` is the root, `HoverCardTrigger` the anchor,
 * `HoverCardContent` the portaled/positioned popup that reads the overlay
 * contract (--a63-overlay-shadow) + semantics at the use-site.
 *
 * Faithful to prod @atom63/ui: Content defaults (side=bottom, align=center,
 * sideOffset=4). portalContainer falls back to PortalContainerProvider for
 * parity with Tooltip/Popover in this package (prod ui HoverCard had no portal
 * hook). Trigger slot helper replaced by Base UI `render`.
 */

export function HoverCard(props: HoverCardPrimitive.Root.Props): React.ReactElement {
  return <HoverCardPrimitive.Root data-slot="hover-card" {...props} />
}

export function HoverCardTrigger({
  className,
  ...props
}: HoverCardPrimitive.Trigger.Props): React.ReactElement {
  return (
    <HoverCardPrimitive.Trigger
      className={cn('a63-HoverCard-trigger', className)}
      data-slot="hover-card-trigger"
      {...props}
    />
  )
}

export type HoverCardContentProps = HoverCardPrimitive.Popup.Props & {
  align?: HoverCardPrimitive.Positioner.Props['align']
  portalContainer?: HoverCardPrimitive.Portal.Props['container']
  side?: HoverCardPrimitive.Positioner.Props['side']
  sideOffset?: HoverCardPrimitive.Positioner.Props['sideOffset']
}

export function HoverCardContent({
  className,
  align = 'center',
  portalContainer,
  side = 'bottom',
  sideOffset = 4,
  ...props
}: HoverCardContentProps): React.ReactElement {
  const contextPortalContainer = usePortalContainer()
  const container = portalContainer ?? contextPortalContainer

  return (
    <HoverCardPrimitive.Portal container={container} data-slot="hover-card-portal">
      <HoverCardPrimitive.Positioner
        align={align}
        className="a63-HoverCard-positioner"
        data-slot="hover-card-positioner"
        side={side}
        sideOffset={sideOffset}
      >
        <HoverCardPrimitive.Popup
          className={cn('a63-HoverCard-popup', className)}
          data-slot="hover-card-content"
          {...props}
        />
      </HoverCardPrimitive.Positioner>
    </HoverCardPrimitive.Portal>
  )
}

export { HoverCardPrimitive }
