'use client'

import { NavigationMenu as NavigationMenuPrimitive } from '@base-ui/react/navigation-menu'
import { ChevronDown } from 'lucide-react'
import type * as React from 'react'

import { cn } from '../../lib/cn'

/*
 * NavigationMenu — a horizontal navigation bar whose items reveal a shared,
 * animated content panel (Base UI NavigationMenu). Faithful to prod @atom63/ui:
 * same parts (Root/List/Item/Trigger/Content/Positioner/Popup/Viewport/Link/
 * Indicator) + the same Root `align` passthrough and the exported
 * navigationMenuTriggerStyle() helper. The shared popup is the OVERLAY archetype:
 * bg (--a63-surface-overlay), border (--a63-border-subtle), radius (--radius-lg),
 * elevation (--a63-overlay-shadow) and stacking (--z-layer-menu) resolve at the
 * use-site, so the 4 themes restyle it for free. Icons use the shared registry.
 */

export type NavigationMenuProps = NavigationMenuPrimitive.Root.Props &
  Pick<NavigationMenuPrimitive.Positioner.Props, 'align'> & {
    portalContainer?: NavigationMenuPrimitive.Portal.Props['container']
  }

export function NavigationMenu({
  align = 'start',
  children,
  className,
  portalContainer,
  ...props
}: NavigationMenuProps): React.ReactElement {
  return (
    <NavigationMenuPrimitive.Root
      className={cn('a63-NavigationMenu', className)}
      data-slot="navigation-menu"
      {...props}
    >
      {children}
      <NavigationMenuPositioner align={align} portalContainer={portalContainer} />
    </NavigationMenuPrimitive.Root>
  )
}

export function NavigationMenuList({
  className,
  ...props
}: NavigationMenuPrimitive.List.Props): React.ReactElement {
  return (
    <NavigationMenuPrimitive.List
      className={cn('a63-NavigationMenu-list', className)}
      data-slot="navigation-menu-list"
      {...props}
    />
  )
}

export function NavigationMenuItem({
  className,
  ...props
}: NavigationMenuPrimitive.Item.Props): React.ReactElement {
  return (
    <NavigationMenuPrimitive.Item
      className={cn('a63-NavigationMenu-item', className)}
      data-slot="navigation-menu-item"
      {...props}
    />
  )
}

/* Prod exported a cva-based class factory; kept as a plain class-name helper so
   importers of navigationMenuTriggerStyle() keep working. */
export function navigationMenuTriggerStyle(): string {
  return 'a63-NavigationMenu-trigger'
}

export function NavigationMenuTrigger({
  children,
  className,
  ...props
}: NavigationMenuPrimitive.Trigger.Props): React.ReactElement {
  return (
    <NavigationMenuPrimitive.Trigger
      className={cn('a63-NavigationMenu-trigger', className)}
      data-slot="navigation-menu-trigger"
      {...props}
    >
      {children}
      <ChevronDown aria-hidden className="a63-NavigationMenu-trigger-icon" />
    </NavigationMenuPrimitive.Trigger>
  )
}

export function NavigationMenuContent({
  className,
  ...props
}: NavigationMenuPrimitive.Content.Props): React.ReactElement {
  return (
    <NavigationMenuPrimitive.Content
      className={cn('a63-NavigationMenu-content', className)}
      data-slot="navigation-menu-content"
      {...props}
    />
  )
}

export type NavigationMenuPositionerProps = NavigationMenuPrimitive.Positioner.Props & {
  portalContainer?: NavigationMenuPrimitive.Portal.Props['container']
}

export function NavigationMenuPositioner({
  align = 'start',
  alignOffset = 0,
  className,
  portalContainer,
  side = 'bottom',
  sideOffset = 8,
  ...props
}: NavigationMenuPositionerProps): React.ReactElement {
  return (
    <NavigationMenuPrimitive.Portal container={portalContainer} data-slot="navigation-menu-portal">
      <NavigationMenuPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        className={cn('a63-NavigationMenu-positioner', className)}
        data-slot="navigation-menu-positioner"
        side={side}
        sideOffset={sideOffset}
        {...props}
      >
        <NavigationMenuPrimitive.Popup
          className="a63-NavigationMenu-popup"
          data-slot="navigation-menu-popup"
        >
          <NavigationMenuViewport />
        </NavigationMenuPrimitive.Popup>
      </NavigationMenuPrimitive.Positioner>
    </NavigationMenuPrimitive.Portal>
  )
}

export function NavigationMenuLink({
  className,
  ...props
}: NavigationMenuPrimitive.Link.Props): React.ReactElement {
  return (
    <NavigationMenuPrimitive.Link
      className={cn('a63-NavigationMenu-link', className)}
      data-slot="navigation-menu-link"
      {...props}
    />
  )
}

export function NavigationMenuIndicator({
  className,
  ...props
}: React.ComponentProps<'div'>): React.ReactElement {
  return (
    <div
      className={cn('a63-NavigationMenu-indicator', className)}
      data-slot="navigation-menu-indicator"
      {...props}
    >
      <div className="a63-NavigationMenu-indicator-arrow" />
    </div>
  )
}

export function NavigationMenuViewport({
  className,
  ...props
}: NavigationMenuPrimitive.Viewport.Props): React.ReactElement {
  return (
    <NavigationMenuPrimitive.Viewport
      className={cn('a63-NavigationMenu-viewport', className)}
      data-slot="navigation-menu-viewport"
      {...props}
    />
  )
}
