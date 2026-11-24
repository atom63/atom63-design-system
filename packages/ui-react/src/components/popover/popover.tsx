'use client'

import { Popover as PopoverPrimitive } from '@base-ui/react/popover'
import * as React from 'react'

import { cn } from '../../lib/cn'
import { mergeRefs } from '../../lib/merge-refs'
import { usePortalContainer } from '../portal-container'

/*
 * Popover — a click-activated overlay for rich, interactive content (Base UI
 * Popover). The popup is the OVERLAY archetype: elevation reads the
 * --a63-overlay-shadow lever; bg (--a63-surface-overlay), border
 * (--a63-border-subtle), radius (--radius-lg), stacking (--z-layer-popover) and
 * entrance motion (--a63-control-feedback-*) resolve from semantics/foundation
 * at the use-site, so the 4 themes restyle it for free.
 *
 * Faithful to prod @atom63/ui: same parts (Root/Trigger/Content/Anchor/Header/
 * Title/Description) plus Close/Portal, Content defaults (side=bottom,
 * align=center, sideOffset=4), and portalContainer falling back to
 * PortalContainerProvider context. Content positions against its `anchor`, else
 * a PopoverAnchor inside the same Popover, else the trigger. The prod trigger slot helper
 * (splitTriggerSlotProps/asChild) is replaced by Base UI's native `render` prop
 * (DS convention) — app trigger sites that pass `asChild` must migrate to
 * `render={<Button …/>}`.
 */

/* PopoverAnchor registers its element here; PopoverContent positions against it
   unless it is given an `anchor` of its own. */
const PopoverAnchorContext = React.createContext<{
  anchor: HTMLElement | null
  setAnchor: (anchor: HTMLElement | null) => void
} | null>(null)

export function Popover(props: PopoverPrimitive.Root.Props): React.ReactElement {
  const [anchor, setAnchor] = React.useState<HTMLElement | null>(null)
  const value = React.useMemo(() => ({ anchor, setAnchor }), [anchor])
  return (
    <PopoverAnchorContext.Provider value={value}>
      <PopoverPrimitive.Root data-slot="popover" {...props} />
    </PopoverAnchorContext.Provider>
  )
}

export function PopoverClose({
  className,
  ...props
}: PopoverPrimitive.Close.Props): React.ReactElement {
  return (
    <PopoverPrimitive.Close
      className={cn('a63-Popover-close', className)}
      data-slot="popover-close"
      {...props}
    />
  )
}

export function PopoverPortal({
  container,
  ...props
}: PopoverPrimitive.Portal.Props): React.ReactElement {
  const contextPortalContainer = usePortalContainer()
  return (
    <PopoverPrimitive.Portal
      container={container ?? contextPortalContainer}
      data-slot="popover-portal"
      {...props}
    />
  )
}

export function PopoverTrigger({
  className,
  ...props
}: PopoverPrimitive.Trigger.Props): React.ReactElement {
  return (
    <PopoverPrimitive.Trigger
      className={cn('a63-Popover-trigger', className)}
      data-slot="popover-trigger"
      {...props}
    />
  )
}

export interface PopoverContentProps extends PopoverPrimitive.Popup.Props {
  align?: PopoverPrimitive.Positioner.Props['align']
  alignOffset?: PopoverPrimitive.Positioner.Props['alignOffset']
  /** The element the popup positions against. Defaults to a `PopoverAnchor`, then the trigger. */
  anchor?: PopoverPrimitive.Positioner.Props['anchor']
  collisionPadding?: PopoverPrimitive.Positioner.Props['collisionPadding']
  portalContainer?: PopoverPrimitive.Portal.Props['container']
  side?: PopoverPrimitive.Positioner.Props['side']
  sideOffset?: PopoverPrimitive.Positioner.Props['sideOffset']
}

export function PopoverContent({
  align = 'center',
  alignOffset,
  anchor,
  children,
  className,
  collisionPadding,
  portalContainer,
  side = 'bottom',
  sideOffset = 4,
  ...props
}: PopoverContentProps): React.ReactElement {
  const anchorContext = React.useContext(PopoverAnchorContext)

  return (
    <PopoverPortal container={portalContainer}>
      <PopoverPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        anchor={anchor ?? anchorContext?.anchor ?? undefined}
        className="a63-Popover-positioner"
        collisionPadding={collisionPadding}
        data-slot="popover-positioner"
        side={side}
        sideOffset={sideOffset}
      >
        <PopoverPrimitive.Popup
          className={cn('a63-Popover-popup', className)}
          data-slot="popover-content"
          {...props}
        >
          {children}
        </PopoverPrimitive.Popup>
      </PopoverPrimitive.Positioner>
    </PopoverPortal>
  )
}

/** An element inside `Popover` that the popup positions against instead of the trigger. */
export function PopoverAnchor({
  className,
  ref,
  ...props
}: React.ComponentProps<'div'>): React.ReactElement {
  const setAnchor = React.useContext(PopoverAnchorContext)?.setAnchor
  return (
    <div
      className={cn('a63-Popover-anchor', className)}
      data-slot="popover-anchor"
      ref={mergeRefs(ref, setAnchor)}
      {...props}
    />
  )
}

export function PopoverHeader({
  className,
  ...props
}: React.ComponentProps<'div'>): React.ReactElement {
  return (
    <div className={cn('a63-Popover-header', className)} data-slot="popover-header" {...props} />
  )
}

export function PopoverTitle({
  className,
  ...props
}: PopoverPrimitive.Title.Props): React.ReactElement {
  return (
    <PopoverPrimitive.Title
      className={cn('a63-Popover-title', className)}
      data-slot="popover-title"
      {...props}
    />
  )
}

export function PopoverDescription({
  className,
  ...props
}: PopoverPrimitive.Description.Props): React.ReactElement {
  return (
    <PopoverPrimitive.Description
      className={cn('a63-Popover-description', className)}
      data-slot="popover-description"
      {...props}
    />
  )
}
