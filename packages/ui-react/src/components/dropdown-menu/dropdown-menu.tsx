'use client'

import { Menu as DropdownMenuPrimitive } from '@base-ui/react/menu'
import type * as React from 'react'

import { cn } from '../../lib/cn'
import { usePortalContainer } from '../portal-container'

/*
 * DropdownMenu — an actionable menu popup (Base UI Menu). The popup is the
 * OVERLAY archetype: elevation reads the --a63-overlay-shadow lever; bg
 * (--a63-surface-overlay), border (--a63-border-subtle), radius (--radius-lg),
 * stacking (--z-layer-menu) and entrance motion (--a63-control-feedback-*)
 * resolve from semantics/foundation at the use-site, so the 4 themes restyle
 * it for free.
 *
 * Faithful to prod @atom63/ui: same parts (Root/Trigger/Content/Item/
 * CheckboxItem/RadioGroup/RadioItem/Label/Separator/Shortcut/Group/Portal/Sub/
 * SubTrigger/SubContent) + the same extra props (Item `inset`/`variant`,
 * Label/SubTrigger `inset`, Content side/align/offsets). The prod trigger slot
 * helper (splitTriggerSlotProps/asChild) is replaced by Base UI's native
 * `render` prop (DS convention) — app trigger sites that pass `asChild` must
 * migrate to `render={<Button …/>}`.
 */

export function DropdownMenu(props: DropdownMenuPrimitive.Root.Props): React.ReactElement {
  return <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />
}

export function DropdownMenuGroup(props: DropdownMenuPrimitive.Group.Props): React.ReactElement {
  return <DropdownMenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />
}

export function DropdownMenuRadioGroup(
  props: DropdownMenuPrimitive.RadioGroup.Props
): React.ReactElement {
  return <DropdownMenuPrimitive.RadioGroup data-slot="dropdown-menu-radio-group" {...props} />
}

export function DropdownMenuSub(
  props: DropdownMenuPrimitive.SubmenuRoot.Props
): React.ReactElement {
  return <DropdownMenuPrimitive.SubmenuRoot data-slot="dropdown-menu-sub" {...props} />
}

function CheckIcon() {
  return (
    <svg aria-hidden fill="none" height="14" viewBox="0 0 16 16" width="14">
      <path
        d="m3.5 8.5 3 3 6-7"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.75"
      />
    </svg>
  )
}

function ChevronRightIcon() {
  return (
    <svg aria-hidden fill="none" height="14" viewBox="0 0 16 16" width="14">
      <path
        d="m6 4 4 4-4 4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  )
}

export function DropdownMenuPortal(props: DropdownMenuPrimitive.Portal.Props): React.ReactElement {
  return <DropdownMenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />
}

export function DropdownMenuTrigger({
  className,
  ...props
}: DropdownMenuPrimitive.Trigger.Props): React.ReactElement {
  return (
    <DropdownMenuPrimitive.Trigger
      className={cn('a63-Menu-trigger', className)}
      data-slot="dropdown-menu-trigger"
      {...props}
    />
  )
}

export interface DropdownMenuContentProps extends DropdownMenuPrimitive.Popup.Props {
  align?: DropdownMenuPrimitive.Positioner.Props['align']
  alignOffset?: DropdownMenuPrimitive.Positioner.Props['alignOffset']
  portalContainer?: DropdownMenuPrimitive.Portal.Props['container']
  portalProps?: DropdownMenuPrimitive.Portal.Props
  side?: DropdownMenuPrimitive.Positioner.Props['side']
  sideOffset?: DropdownMenuPrimitive.Positioner.Props['sideOffset']
}

export function DropdownMenuContent({
  align = 'start',
  alignOffset,
  children,
  className,
  portalContainer,
  portalProps,
  side = 'bottom',
  sideOffset = 4,
  ...props
}: DropdownMenuContentProps): React.ReactElement {
  const contextPortalContainer = usePortalContainer()
  const container = portalContainer ?? contextPortalContainer

  return (
    <DropdownMenuPrimitive.Portal {...portalProps} container={container}>
      <DropdownMenuPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        className="a63-Menu-positioner"
        data-slot="dropdown-menu-positioner"
        side={side}
        sideOffset={sideOffset}
      >
        <DropdownMenuPrimitive.Popup
          className={cn('a63-Menu-popup', className)}
          data-slot="dropdown-menu-content"
          {...props}
        >
          {children}
        </DropdownMenuPrimitive.Popup>
      </DropdownMenuPrimitive.Positioner>
    </DropdownMenuPrimitive.Portal>
  )
}

export interface DropdownMenuItemProps extends DropdownMenuPrimitive.Item.Props {
  inset?: boolean
  variant?: 'default' | 'destructive'
}

export function DropdownMenuItem({
  className,
  inset,
  variant = 'default',
  ...props
}: DropdownMenuItemProps): React.ReactElement {
  return (
    <DropdownMenuPrimitive.Item
      className={cn('a63-Menu-item', className)}
      data-inset={inset ? '' : undefined}
      data-slot="dropdown-menu-item"
      data-variant={variant}
      {...props}
    />
  )
}

export function DropdownMenuCheckboxItem({
  checked,
  children,
  className,
  ...props
}: DropdownMenuPrimitive.CheckboxItem.Props): React.ReactElement {
  return (
    <DropdownMenuPrimitive.CheckboxItem
      checked={checked}
      className={cn('a63-Menu-item a63-Menu-item--indicator', className)}
      data-slot="dropdown-menu-checkbox-item"
      {...props}
    >
      <span className="a63-Menu-item-indicator" data-slot="dropdown-menu-item-indicator">
        <DropdownMenuPrimitive.CheckboxItemIndicator>
          <CheckIcon />
        </DropdownMenuPrimitive.CheckboxItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  )
}

export function DropdownMenuRadioItem({
  children,
  className,
  ...props
}: DropdownMenuPrimitive.RadioItem.Props): React.ReactElement {
  return (
    <DropdownMenuPrimitive.RadioItem
      className={cn('a63-Menu-item a63-Menu-item--indicator', className)}
      data-slot="dropdown-menu-radio-item"
      {...props}
    >
      <span className="a63-Menu-item-indicator" data-slot="dropdown-menu-item-indicator">
        <DropdownMenuPrimitive.RadioItemIndicator>
          <CheckIcon />
        </DropdownMenuPrimitive.RadioItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.RadioItem>
  )
}

export interface DropdownMenuLabelProps extends React.ComponentProps<'div'> {
  inset?: boolean
}

/*
 * A standalone menu label (section header). Rendered as a plain element rather
 * than Base UI's Menu.GroupLabel so it can be used without a surrounding
 * <DropdownMenuGroup> — matching the common shadcn API. Pair it with a
 * DropdownMenuGroup + render prop when you need group aria-labelledby wiring.
 */
export function DropdownMenuLabel({
  className,
  inset,
  ...props
}: DropdownMenuLabelProps): React.ReactElement {
  return (
    <div
      className={cn('a63-Menu-label', className)}
      data-inset={inset ? '' : undefined}
      data-slot="dropdown-menu-label"
      {...props}
    />
  )
}

export function DropdownMenuSeparator({
  className,
  ...props
}: DropdownMenuPrimitive.Separator.Props): React.ReactElement {
  return (
    <DropdownMenuPrimitive.Separator
      className={cn('a63-Menu-separator', className)}
      data-slot="dropdown-menu-separator"
      {...props}
    />
  )
}

export function DropdownMenuShortcut({
  className,
  ...props
}: React.ComponentProps<'span'>): React.ReactElement {
  return (
    <span
      className={cn('a63-Menu-shortcut', className)}
      data-slot="dropdown-menu-shortcut"
      {...props}
    />
  )
}

export interface DropdownMenuSubTriggerProps extends DropdownMenuPrimitive.SubmenuTrigger.Props {
  inset?: boolean
}

export function DropdownMenuSubTrigger({
  children,
  className,
  inset,
  ...props
}: DropdownMenuSubTriggerProps): React.ReactElement {
  return (
    <DropdownMenuPrimitive.SubmenuTrigger
      className={cn('a63-Menu-item a63-Menu-sub-trigger', className)}
      data-inset={inset ? '' : undefined}
      data-slot="dropdown-menu-sub-trigger"
      {...props}
    >
      {children}
      <span className="a63-Menu-sub-icon" aria-hidden>
        <ChevronRightIcon />
      </span>
    </DropdownMenuPrimitive.SubmenuTrigger>
  )
}

export interface DropdownMenuSubContentProps extends DropdownMenuPrimitive.Popup.Props {
  portalContainer?: DropdownMenuPrimitive.Portal.Props['container']
  portalProps?: DropdownMenuPrimitive.Portal.Props
  alignOffset?: DropdownMenuPrimitive.Positioner.Props['alignOffset']
  sideOffset?: DropdownMenuPrimitive.Positioner.Props['sideOffset']
}

export function DropdownMenuSubContent({
  alignOffset,
  className,
  portalContainer,
  portalProps,
  sideOffset = 4,
  ...props
}: DropdownMenuSubContentProps): React.ReactElement {
  const contextPortalContainer = usePortalContainer()
  const container = portalContainer ?? contextPortalContainer

  return (
    <DropdownMenuPrimitive.Portal {...portalProps} container={container}>
      <DropdownMenuPrimitive.Positioner
        alignOffset={alignOffset}
        className="a63-Menu-positioner"
        data-slot="dropdown-menu-sub-positioner"
        sideOffset={sideOffset}
      >
        <DropdownMenuPrimitive.Popup
          className={cn('a63-Menu-popup', className)}
          data-slot="dropdown-menu-sub-content"
          {...props}
        />
      </DropdownMenuPrimitive.Positioner>
    </DropdownMenuPrimitive.Portal>
  )
}
