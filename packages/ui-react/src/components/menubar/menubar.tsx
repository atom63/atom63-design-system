'use client'

import { Menu as MenuPrimitive } from '@base-ui/react/menu'
import { Menubar as MenubarPrimitive } from '@base-ui/react/menubar'
import { Check } from 'lucide-react'
import type * as React from 'react'

import { cn } from '../../lib/cn'
import {
  DropdownMenu,
  DropdownMenuContent,
  type DropdownMenuContentProps,
  DropdownMenuGroup,
  DropdownMenuItem,
  type DropdownMenuItemProps,
  DropdownMenuLabel,
  type DropdownMenuLabelProps,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  type DropdownMenuSubContentProps,
  DropdownMenuSubTrigger,
  type DropdownMenuSubTriggerProps,
  DropdownMenuTrigger,
} from '../dropdown-menu/dropdown-menu'

/*
 * Menubar — a horizontal bar of menu buttons (Base UI Menubar), each opening a
 * Base UI Menu popup. Faithful to prod @atom63/ui: every part is kept with the
 * same name + props. The bar (`Menubar`) is the Base UI Menubar root; each menu
 * reuses the DS DropdownMenu (Base UI Menu) so the popup, item, sub-menu,
 * separator, label, shortcut chrome is shared with DropdownMenu — differing only
 * in the bar shell + trigger button styling. CheckboxItem/RadioItem wrap Base UI
 * Menu.CheckboxItem/RadioItem directly (mirroring DropdownMenu's item indicator).
 *
 * The prod trigger slot helper (asChild) is replaced by Base UI's native
 * `render` prop (DS convention). Indicators use the shared icon registry.
 */

export function Menubar({ className, ...props }: MenubarPrimitive.Props): React.ReactElement {
  return (
    <MenubarPrimitive className={cn('a63-Menubar', className)} data-slot="menubar" {...props} />
  )
}

export function MenubarMenu(props: React.ComponentProps<typeof DropdownMenu>): React.ReactElement {
  return <DropdownMenu data-slot="menubar-menu" {...props} />
}

export function MenubarGroup(
  props: React.ComponentProps<typeof DropdownMenuGroup>
): React.ReactElement {
  return <DropdownMenuGroup data-slot="menubar-group" {...props} />
}

export function MenubarPortal(
  props: React.ComponentProps<typeof DropdownMenuPortal>
): React.ReactElement {
  return <DropdownMenuPortal data-slot="menubar-portal" {...props} />
}

export function MenubarRadioGroup(
  props: React.ComponentProps<typeof DropdownMenuRadioGroup>
): React.ReactElement {
  return <DropdownMenuRadioGroup data-slot="menubar-radio-group" {...props} />
}

export function MenubarSub(
  props: React.ComponentProps<typeof DropdownMenuSub>
): React.ReactElement {
  return <DropdownMenuSub data-slot="menubar-sub" {...props} />
}

export function MenubarTrigger({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuTrigger>): React.ReactElement {
  return (
    <DropdownMenuTrigger
      className={cn('a63-Menubar-trigger', className)}
      data-slot="menubar-trigger"
      {...props}
    />
  )
}

export function MenubarContent({
  align = 'start',
  alignOffset = -4,
  className,
  sideOffset = 8,
  ...props
}: DropdownMenuContentProps): React.ReactElement {
  return (
    <DropdownMenuContent
      align={align}
      alignOffset={alignOffset}
      className={cn('a63-Menubar-content', className)}
      data-slot="menubar-content"
      sideOffset={sideOffset}
      {...props}
    />
  )
}

export function MenubarItem({
  className,
  inset,
  variant = 'default',
  ...props
}: DropdownMenuItemProps): React.ReactElement {
  return (
    <DropdownMenuItem
      className={cn('a63-Menubar-item', className)}
      data-slot="menubar-item"
      inset={inset}
      variant={variant}
      {...props}
    />
  )
}

export interface MenubarCheckboxItemProps extends MenuPrimitive.CheckboxItem.Props {
  inset?: boolean
}

export function MenubarCheckboxItem({
  checked,
  children,
  className,
  inset,
  ...props
}: MenubarCheckboxItemProps): React.ReactElement {
  return (
    <MenuPrimitive.CheckboxItem
      checked={checked}
      className={cn('a63-Menu-item a63-Menu-item--indicator a63-Menubar-item', className)}
      data-inset={inset ? '' : undefined}
      data-slot="menubar-checkbox-item"
      {...props}
    >
      <span className="a63-Menu-item-indicator" data-slot="menubar-item-indicator">
        <MenuPrimitive.CheckboxItemIndicator>
          <Check aria-hidden />
        </MenuPrimitive.CheckboxItemIndicator>
      </span>
      {children}
    </MenuPrimitive.CheckboxItem>
  )
}

export interface MenubarRadioItemProps extends MenuPrimitive.RadioItem.Props {
  inset?: boolean
}

export function MenubarRadioItem({
  children,
  className,
  inset,
  ...props
}: MenubarRadioItemProps): React.ReactElement {
  return (
    <MenuPrimitive.RadioItem
      className={cn('a63-Menu-item a63-Menu-item--indicator a63-Menubar-item', className)}
      data-inset={inset ? '' : undefined}
      data-slot="menubar-radio-item"
      {...props}
    >
      <span className="a63-Menu-item-indicator" data-slot="menubar-item-indicator">
        <MenuPrimitive.RadioItemIndicator>
          <Check aria-hidden />
        </MenuPrimitive.RadioItemIndicator>
      </span>
      {children}
    </MenuPrimitive.RadioItem>
  )
}

export function MenubarLabel({
  className,
  inset,
  ...props
}: DropdownMenuLabelProps): React.ReactElement {
  return (
    <DropdownMenuLabel
      className={cn('a63-Menubar-label', className)}
      data-slot="menubar-label"
      inset={inset}
      {...props}
    />
  )
}

export function MenubarSeparator({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuSeparator>): React.ReactElement {
  return (
    <DropdownMenuSeparator
      className={cn('a63-Menubar-separator', className)}
      data-slot="menubar-separator"
      {...props}
    />
  )
}

export function MenubarShortcut({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuShortcut>): React.ReactElement {
  return (
    <DropdownMenuShortcut
      className={cn('a63-Menubar-shortcut', className)}
      data-slot="menubar-shortcut"
      {...props}
    />
  )
}

export function MenubarSubTrigger({
  className,
  inset,
  ...props
}: DropdownMenuSubTriggerProps): React.ReactElement {
  return (
    <DropdownMenuSubTrigger
      className={cn('a63-Menubar-item', className)}
      data-slot="menubar-sub-trigger"
      inset={inset}
      {...props}
    />
  )
}

export function MenubarSubContent({
  alignOffset = -4,
  className,
  sideOffset = 8,
  ...props
}: DropdownMenuSubContentProps): React.ReactElement {
  return (
    <DropdownMenuSubContent
      alignOffset={alignOffset}
      className={cn('a63-Menubar-content', className)}
      data-slot="menubar-sub-content"
      sideOffset={sideOffset}
      {...props}
    />
  )
}
