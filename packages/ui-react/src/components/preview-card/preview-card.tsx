'use client'

import { PreviewCard as PreviewCardPrimitive } from '@base-ui/react/preview-card'
import type * as React from 'react'

import { cn } from '../../lib/cn'
import { usePortalContainer } from '../portal-container'

/*
 * PreviewCard — a hover-triggered rich preview popover (Base UI PreviewCard), the
 * OVERLAY archetype. Faithful to prod @atom63/ui: same parts (Root/Trigger/Popup)
 * + Popup align/sideOffset props, and the same HoverCard aliases. The popup reads
 * the overlay contract (--a63-overlay-shadow) + semantics at the use-site, so the
 * 4 themes restyle it for free.
 *
 * The prod trigger slot helper (splitTriggerSlotProps/asChild) is replaced by
 * Base UI's native `render` prop (DS convention): pass `render={<a … />}` for a
 * custom trigger element.
 */

export function PreviewCard(props: PreviewCardPrimitive.Root.Props): React.ReactElement {
  return <PreviewCardPrimitive.Root data-slot="preview-card" {...props} />
}

export function PreviewCardTrigger({
  className,
  ...props
}: PreviewCardPrimitive.Trigger.Props): React.ReactElement {
  return (
    <PreviewCardPrimitive.Trigger
      className={cn('a63-PreviewCard-trigger', className)}
      data-slot="preview-card-trigger"
      {...props}
    />
  )
}

export interface PreviewCardPopupProps extends PreviewCardPrimitive.Popup.Props {
  align?: PreviewCardPrimitive.Positioner.Props['align']
  portalContainer?: PreviewCardPrimitive.Portal.Props['container']
  side?: PreviewCardPrimitive.Positioner.Props['side']
  sideOffset?: PreviewCardPrimitive.Positioner.Props['sideOffset']
}

export function PreviewCardPopup({
  align = 'center',
  children,
  className,
  portalContainer,
  side = 'bottom',
  sideOffset = 4,
  ...props
}: PreviewCardPopupProps): React.ReactElement {
  const contextPortalContainer = usePortalContainer()
  const container = portalContainer ?? contextPortalContainer

  return (
    <PreviewCardPrimitive.Portal container={container} data-slot="preview-card-portal">
      <PreviewCardPrimitive.Positioner
        align={align}
        className="a63-PreviewCard-positioner"
        data-slot="preview-card-positioner"
        side={side}
        sideOffset={sideOffset}
      >
        <PreviewCardPrimitive.Popup
          className={cn('a63-PreviewCard-popup', className)}
          data-slot="preview-card-content"
          {...props}
        >
          {children}
        </PreviewCardPrimitive.Popup>
      </PreviewCardPrimitive.Positioner>
    </PreviewCardPrimitive.Portal>
  )
}

// Prod aliases: HoverCard === PreviewCard, etc.
export {
  PreviewCard as HoverCard,
  PreviewCardPopup as HoverCardContent,
  PreviewCardTrigger as HoverCardTrigger,
}
