'use client'

import { Autocomplete as AutocompletePrimitive } from '@base-ui/react/autocomplete'
import { Dialog as CommandDialogPrimitive } from '@base-ui/react/dialog'
import type * as React from 'react'

import { cn } from '../../lib/cn'
import { ScrollArea } from '../scroll-area/scroll-area'

/*
 * Command — a command palette. Faithful port of prod @atom63/ui command.tsx: the
 * interactive list is Base UI's Autocomplete (inline + always-open, so it filters
 * the `items` prop as you type), presented inside a Base UI Dialog for the modal
 * (⌘K) shell. Every part the app uses is kept with the same name + props:
 * Command / CommandInput / CommandList / CommandEmpty / CommandGroup /
 * CommandGroupLabel / CommandItem / CommandCollection / CommandSeparator /
 * CommandShortcut / CommandFooter / CommandPanel + the dialog parts
 * CommandDialog / CommandDialogTrigger / CommandDialogPopup.
 *
 * Chrome is restyled from prod's Tailwind to a63-Command-* classes reading a63
 * tokens (the popup + panel are OVERLAY surfaces, the scrim reads --z-layer-scrim).
 * Prod's `startAddon={<Icons.search/>}` is replaced with an inline search glyph to
 * keep the DS renderer icon-free. No new tokens.
 */

// ── Dialog shell ─────────────────────────────────────────────────────────
export const CommandDialog = CommandDialogPrimitive.Root

export const CommandDialogPortal = CommandDialogPrimitive.Portal

// Handle factory for programmatically opening the ⌘K dialog (faithful port of prod).
export const CommandCreateHandle = CommandDialogPrimitive.createHandle

export function CommandDialogTrigger(
  props: CommandDialogPrimitive.Trigger.Props
): React.ReactElement {
  return <CommandDialogPrimitive.Trigger data-slot="command-dialog-trigger" {...props} />
}

export function CommandDialogBackdrop({
  className,
  ...props
}: CommandDialogPrimitive.Backdrop.Props): React.ReactElement {
  return (
    <CommandDialogPrimitive.Backdrop
      className={cn('a63-Command-backdrop', className)}
      data-slot="command-dialog-backdrop"
      {...props}
    />
  )
}

export function CommandDialogViewport({
  className,
  ...props
}: CommandDialogPrimitive.Viewport.Props): React.ReactElement {
  return (
    <CommandDialogPrimitive.Viewport
      className={cn('a63-Command-viewport', className)}
      data-slot="command-dialog-viewport"
      {...props}
    />
  )
}

export function CommandDialogPopup({
  className,
  children,
  ...props
}: CommandDialogPrimitive.Popup.Props): React.ReactElement {
  return (
    <CommandDialogPortal>
      <CommandDialogBackdrop />
      <CommandDialogViewport>
        <CommandDialogPrimitive.Popup
          className={cn('a63-Command-popup', className)}
          data-slot="command-dialog-popup"
          {...props}
        >
          {children}
        </CommandDialogPrimitive.Popup>
      </CommandDialogViewport>
    </CommandDialogPortal>
  )
}

// ── Autocomplete-backed palette ──────────────────────────────────────────
export function Command({
  autoHighlight = 'always',
  keepHighlight = true,
  ...props
}: React.ComponentProps<typeof AutocompletePrimitive.Root>): React.ReactElement {
  return (
    <AutocompletePrimitive.Root
      autoHighlight={autoHighlight}
      data-slot="command"
      inline
      keepHighlight={keepHighlight}
      open
      {...props}
    />
  )
}

function SearchIcon() {
  return (
    <svg aria-hidden fill="none" height="18" viewBox="0 0 24 24" width="18">
      <path
        d="M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14ZM20 20l-3.5-3.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.75"
      />
    </svg>
  )
}

export function CommandInput({
  className,
  placeholder,
  ...props
}: React.ComponentProps<typeof AutocompletePrimitive.Input>): React.ReactElement {
  return (
    <div className="a63-Command-input-wrapper" data-slot="command-input-wrapper">
      <span aria-hidden className="a63-Command-input-icon">
        <SearchIcon />
      </span>
      <AutocompletePrimitive.Input
        autoFocus
        className={cn('a63-Command-input', className)}
        data-slot="command-input"
        placeholder={placeholder}
        {...props}
      />
    </div>
  )
}

export function CommandPanel({
  className,
  children,
  ...props
}: React.ComponentProps<'div'>): React.ReactElement {
  return (
    <ScrollArea
      className={cn('a63-Command-panel', className)}
      data-slot="command-panel"
      scrollFade
      showScrollbarOnHover
      {...props}
    >
      {children}
    </ScrollArea>
  )
}

export function CommandList({
  className,
  ...props
}: React.ComponentProps<typeof AutocompletePrimitive.List>): React.ReactElement {
  return (
    <AutocompletePrimitive.List
      className={cn('a63-Command-list', className)}
      data-slot="command-list"
      {...props}
    />
  )
}

export function CommandEmpty({
  className,
  ...props
}: React.ComponentProps<typeof AutocompletePrimitive.Empty>): React.ReactElement {
  return (
    <AutocompletePrimitive.Empty
      className={cn('a63-Command-empty', className)}
      data-slot="command-empty"
      {...props}
    />
  )
}

export function CommandGroup({
  className,
  ...props
}: React.ComponentProps<typeof AutocompletePrimitive.Group>): React.ReactElement {
  return (
    <AutocompletePrimitive.Group
      className={cn('a63-Command-group', className)}
      data-slot="command-group"
      {...props}
    />
  )
}

export function CommandGroupLabel({
  className,
  ...props
}: React.ComponentProps<typeof AutocompletePrimitive.GroupLabel>): React.ReactElement {
  return (
    <AutocompletePrimitive.GroupLabel
      className={cn('a63-Command-group-label', className)}
      data-slot="command-group-label"
      {...props}
    />
  )
}

export function CommandCollection({
  ...props
}: React.ComponentProps<typeof AutocompletePrimitive.Collection>): React.ReactElement {
  return <AutocompletePrimitive.Collection data-slot="command-collection" {...props} />
}

export function CommandItem({
  className,
  ...props
}: React.ComponentProps<typeof AutocompletePrimitive.Item>): React.ReactElement {
  return (
    <AutocompletePrimitive.Item
      className={cn('a63-Command-item', className)}
      data-slot="command-item"
      {...props}
    />
  )
}

export function CommandSeparator({
  className,
  ...props
}: React.ComponentProps<typeof AutocompletePrimitive.Separator>): React.ReactElement {
  return (
    <AutocompletePrimitive.Separator
      className={cn('a63-Command-separator', className)}
      data-slot="command-separator"
      {...props}
    />
  )
}

export function CommandShortcut({
  className,
  ...props
}: React.ComponentProps<'kbd'>): React.ReactElement {
  return (
    <kbd
      className={cn('a63-Command-shortcut', className)}
      data-slot="command-shortcut"
      {...props}
    />
  )
}

export function CommandFooter({
  className,
  ...props
}: React.ComponentProps<'div'>): React.ReactElement {
  return (
    <div className={cn('a63-Command-footer', className)} data-slot="command-footer" {...props} />
  )
}
