'use client'

import { ContextMenu as ContextMenuPrimitive } from '@base-ui/react/context-menu'
import type * as React from 'react'

import { cn } from '../../lib/cn'

/*
 * ContextMenu — a right-click / long-press actionable menu popup (Base UI
 * ContextMenu). The popup is the OVERLAY archetype: elevation reads the
 * --a63-overlay-shadow lever; bg (--a63-surface-overlay), border
 * (--a63-border-subtle), radius (--radius-lg), stacking (--z-layer-menu) and
 * entrance motion (--a63-control-feedback-*) resolve from semantics/foundation
 * at the use-site, so the 4 themes restyle it for free. It shares the
 * a63-Menu-* item/label/separator vocabulary with DropdownMenu.
 *
 * Faithful to prod @atom63/ui: same parts (Root/Trigger/Group/Portal/Sub/
 * RadioGroup/Content/Item/SubTrigger/SubContent/CheckboxItem/RadioItem/Label/
 * Separator/Shortcut) + the same extra props (Item `inset`/`variant`, Content
 * side/sideOffset/collisionPadding, Label `inset`, SubTrigger `inset`). The
 * prod trigger slot helper (splitTriggerSlotProps/asChild) is replaced by Base
 * UI's native `render` prop; ContextMenuLabel is a plain element (not
 * Menu.GroupLabel) so it works standalone, matching the DropdownMenu DS
 * convention — pair it with ContextMenuGroup + render when you need
 * aria-labelledby wiring.
 */

export function ContextMenu(props: ContextMenuPrimitive.Root.Props): React.ReactElement {
  return <ContextMenuPrimitive.Root data-slot="context-menu" {...props} />
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

export function ContextMenuTrigger({
  className,
  ...props
}: ContextMenuPrimitive.Trigger.Props): React.ReactElement {
  return (
    <ContextMenuPrimitive.Trigger
      className={cn('a63-Menu-trigger', className)}
      data-slot="context-menu-trigger"
      {...props}
    />
  )
}

export function ContextMenuGroup(props: ContextMenuPrimitive.Group.Props): React.ReactElement {
  return <ContextMenuPrimitive.Group data-slot="context-menu-group" {...props} />
}

export function ContextMenuPortal(props: ContextMenuPrimitive.Portal.Props): React.ReactElement {
  return <ContextMenuPrimitive.Portal data-slot="context-menu-portal" {...props} />
}

export function ContextMenuSub(props: ContextMenuPrimitive.SubmenuRoot.Props): React.ReactElement {
  return <ContextMenuPrimitive.SubmenuRoot data-slot="context-menu-sub" {...props} />
}

export function ContextMenuRadioGroup(
  props: ContextMenuPrimitive.RadioGroup.Props
): React.ReactElement {
  return <ContextMenuPrimitive.RadioGroup data-slot="context-menu-radio-group" {...props} />
}

export interface ContextMenuContentProps extends ContextMenuPrimitive.Popup.Props {
  collisionPadding?: ContextMenuPrimitive.Positioner.Props['collisionPadding']
  portalProps?: ContextMenuPrimitive.Portal.Props
  side?: ContextMenuPrimitive.Positioner.Props['side']
  sideOffset?: ContextMenuPrimitive.Positioner.Props['sideOffset']
}

export function ContextMenuContent({
  className,
  collisionPadding,
  portalProps,
  side,
  sideOffset = 4,
  ...props
}: ContextMenuContentProps): React.ReactElement {
  return (
    <ContextMenuPrimitive.Portal {...portalProps}>
      <ContextMenuPrimitive.Positioner
        className="a63-Menu-positioner"
        collisionPadding={collisionPadding}
        data-slot="context-menu-positioner"
        side={side}
        sideOffset={sideOffset}
      >
        <ContextMenuPrimitive.Popup
          className={cn('a63-Menu-popup', className)}
          data-slot="context-menu-content"
          {...props}
        />
      </ContextMenuPrimitive.Positioner>
    </ContextMenuPrimitive.Portal>
  )
}

export interface ContextMenuItemProps extends ContextMenuPrimitive.Item.Props {
  inset?: boolean
  variant?: 'default' | 'destructive'
}

export function ContextMenuItem({
  className,
  inset,
  variant = 'default',
  ...props
}: ContextMenuItemProps): React.ReactElement {
  return (
    <ContextMenuPrimitive.Item
      className={cn('a63-Menu-item', className)}
      data-inset={inset ? '' : undefined}
      data-slot="context-menu-item"
      data-variant={variant}
      {...props}
    />
  )
}

export interface ContextMenuSubTriggerProps extends ContextMenuPrimitive.SubmenuTrigger.Props {
  inset?: boolean
}

export function ContextMenuSubTrigger({
  children,
  className,
  inset,
  ...props
}: ContextMenuSubTriggerProps): React.ReactElement {
  return (
    <ContextMenuPrimitive.SubmenuTrigger
      className={cn('a63-Menu-item a63-Menu-sub-trigger', className)}
      data-inset={inset ? '' : undefined}
      data-slot="context-menu-sub-trigger"
      {...props}
    >
      {children}
      <span className="a63-Menu-sub-icon" aria-hidden>
        <ChevronRightIcon />
      </span>
    </ContextMenuPrimitive.SubmenuTrigger>
  )
}

export interface ContextMenuSubContentProps extends ContextMenuPrimitive.Popup.Props {
  portalProps?: ContextMenuPrimitive.Portal.Props
  sideOffset?: ContextMenuPrimitive.Positioner.Props['sideOffset']
}

export function ContextMenuSubContent({
  className,
  portalProps,
  sideOffset = 6,
  ...props
}: ContextMenuSubContentProps): React.ReactElement {
  return (
    <ContextMenuPrimitive.Portal {...portalProps}>
      <ContextMenuPrimitive.Positioner
        className="a63-Menu-positioner"
        data-slot="context-menu-sub-positioner"
        sideOffset={sideOffset}
      >
        <ContextMenuPrimitive.Popup
          className={cn('a63-Menu-popup', className)}
          data-slot="context-menu-sub-content"
          {...props}
        />
      </ContextMenuPrimitive.Positioner>
    </ContextMenuPrimitive.Portal>
  )
}

export function ContextMenuCheckboxItem({
  checked,
  children,
  className,
  ...props
}: ContextMenuPrimitive.CheckboxItem.Props): React.ReactElement {
  return (
    <ContextMenuPrimitive.CheckboxItem
      checked={checked}
      className={cn('a63-Menu-item a63-Menu-item--indicator', className)}
      data-slot="context-menu-checkbox-item"
      {...props}
    >
      <span className="a63-Menu-item-indicator" data-slot="context-menu-item-indicator">
        <ContextMenuPrimitive.CheckboxItemIndicator>
          <CheckIcon />
        </ContextMenuPrimitive.CheckboxItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.CheckboxItem>
  )
}

export function ContextMenuRadioItem({
  children,
  className,
  ...props
}: ContextMenuPrimitive.RadioItem.Props): React.ReactElement {
  return (
    <ContextMenuPrimitive.RadioItem
      className={cn('a63-Menu-item a63-Menu-item--indicator', className)}
      data-slot="context-menu-radio-item"
      {...props}
    >
      <span className="a63-Menu-item-indicator" data-slot="context-menu-item-indicator">
        <ContextMenuPrimitive.RadioItemIndicator>
          <CheckIcon />
        </ContextMenuPrimitive.RadioItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.RadioItem>
  )
}

export interface ContextMenuLabelProps extends React.ComponentProps<'div'> {
  inset?: boolean
}

/*
 * A standalone menu label (section header). Rendered as a plain element rather
 * than Base UI's ContextMenu.GroupLabel so it can be used without a surrounding
 * <ContextMenuGroup> — matching the DropdownMenu DS convention. Pair it with a
 * ContextMenuGroup + render prop when you need group aria-labelledby wiring.
 */
export function ContextMenuLabel({
  className,
  inset,
  ...props
}: ContextMenuLabelProps): React.ReactElement {
  return (
    <div
      className={cn('a63-Menu-label', className)}
      data-inset={inset ? '' : undefined}
      data-slot="context-menu-label"
      {...props}
    />
  )
}

export function ContextMenuSeparator({
  className,
  ...props
}: ContextMenuPrimitive.Separator.Props): React.ReactElement {
  return (
    <ContextMenuPrimitive.Separator
      className={cn('a63-Menu-separator', className)}
      data-slot="context-menu-separator"
      {...props}
    />
  )
}

export function ContextMenuShortcut({
  className,
  ...props
}: React.ComponentProps<'span'>): React.ReactElement {
  return (
    <span
      className={cn('a63-Menu-shortcut', className)}
      data-slot="context-menu-shortcut"
      {...props}
    />
  )
}
