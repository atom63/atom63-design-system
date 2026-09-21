'use client'

import { AlertDialog as AlertDialogPrimitive } from '@base-ui/react/alert-dialog'
import type * as React from 'react'
import { cn } from '../../lib/cn'
import { Button, type ButtonProps } from '../button'

/*
 * AlertDialog — a modal confirmation overlay (Base UI AlertDialog). Like Dialog
 * it is the OVERLAY archetype in its centered/modal form (raised overlay
 * surface + backdrop scrim reading --z-layer-scrim / --z-layer-modal), but it
 * is dismiss-guarded (no outside-press / Escape close) and its Action/Cancel
 * are the two footer buttons.
 *
 * Faithful to prod @atom63/ui: same parts (Root/Portal/Trigger/Backdrop/
 * Viewport/Popup/Header/Footer/Media/Title/Description/Close/Action/Cancel) +
 * aliases (AlertDialogOverlay = Backdrop, AlertDialogContent = Popup) and the
 * AlertDialogCreateHandle re-export. Popup keeps its `size` (deprecated),
 * `variant`, `bottomStickOnMobile`, `portalProps` props; Footer its `variant`.
 * The prod trigger slot helper (splitTriggerSlotProps/asChild) is replaced by
 * Base UI's native `render` prop, and the prod Action/Cancel `<Button asChild>`
 * wrapper is replaced by `render={<Button …/>}`.
 */

export const AlertDialogCreateHandle: typeof AlertDialogPrimitive.createHandle =
  AlertDialogPrimitive.createHandle

export const AlertDialog: typeof AlertDialogPrimitive.Root = AlertDialogPrimitive.Root

export function AlertDialogPortal(props: AlertDialogPrimitive.Portal.Props): React.ReactElement {
  return <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" {...props} />
}

export function AlertDialogTrigger({
  className,
  ...props
}: AlertDialogPrimitive.Trigger.Props): React.ReactElement {
  return (
    <AlertDialogPrimitive.Trigger
      className={cn('a63-AlertDialog-trigger', className)}
      data-slot="alert-dialog-trigger"
      {...props}
    />
  )
}

export function AlertDialogBackdrop({
  className,
  ...props
}: AlertDialogPrimitive.Backdrop.Props): React.ReactElement {
  return (
    <AlertDialogPrimitive.Backdrop
      className={cn('a63-AlertDialog-backdrop', className)}
      data-slot="alert-dialog-backdrop"
      {...props}
    />
  )
}

export function AlertDialogViewport({
  className,
  ...props
}: AlertDialogPrimitive.Viewport.Props): React.ReactElement {
  return (
    <AlertDialogPrimitive.Viewport
      className={cn('a63-AlertDialog-viewport', className)}
      data-slot="alert-dialog-viewport"
      {...props}
    />
  )
}

export function AlertDialogPopup({
  className,
  bottomStickOnMobile = true,
  portalProps,
  size = 'default',
  variant = 'default',
  ...props
}: AlertDialogPrimitive.Popup.Props & {
  bottomStickOnMobile?: boolean
  portalProps?: AlertDialogPrimitive.Portal.Props
  /** @deprecated Use `className` (e.g. `max-w-sm`) instead. Kept for existing call sites. */
  size?: 'default' | 'sm'
  variant?: 'default' | 'destructive' | 'info' | 'success' | 'warning'
}): React.ReactElement {
  return (
    <AlertDialogPortal {...portalProps}>
      <AlertDialogBackdrop />
      <AlertDialogViewport data-stick-bottom={bottomStickOnMobile ? '' : undefined}>
        <AlertDialogPrimitive.Popup
          className={cn('a63-AlertDialog-popup', className)}
          data-size={size}
          data-slot="alert-dialog-popup"
          data-stick-bottom={bottomStickOnMobile ? '' : undefined}
          data-variant={variant}
          {...props}
        />
      </AlertDialogViewport>
    </AlertDialogPortal>
  )
}

export function AlertDialogHeader({
  className,
  ...props
}: React.ComponentProps<'div'>): React.ReactElement {
  return (
    <div
      className={cn('a63-AlertDialog-header', className)}
      data-slot="alert-dialog-header"
      {...props}
    />
  )
}

export function AlertDialogFooter({
  className,
  variant = 'default',
  ...props
}: React.ComponentProps<'div'> & {
  variant?: 'default' | 'bare'
}): React.ReactElement {
  return (
    <div
      className={cn('a63-AlertDialog-footer', className)}
      data-slot="alert-dialog-footer"
      data-variant={variant}
      {...props}
    />
  )
}

export function AlertDialogMedia({
  className,
  ...props
}: React.ComponentProps<'div'>): React.ReactElement {
  return (
    <div
      className={cn('a63-AlertDialog-media', className)}
      data-slot="alert-dialog-media"
      {...props}
    />
  )
}

export function AlertDialogTitle({
  className,
  ...props
}: AlertDialogPrimitive.Title.Props): React.ReactElement {
  return (
    <AlertDialogPrimitive.Title
      className={cn('a63-AlertDialog-title', className)}
      data-slot="alert-dialog-title"
      {...props}
    />
  )
}

export function AlertDialogDescription({
  className,
  ...props
}: AlertDialogPrimitive.Description.Props): React.ReactElement {
  return (
    <AlertDialogPrimitive.Description
      className={cn('a63-AlertDialog-description', className)}
      data-slot="alert-dialog-description"
      {...props}
    />
  )
}

export function AlertDialogClose(props: AlertDialogPrimitive.Close.Props): React.ReactElement {
  return <AlertDialogPrimitive.Close data-slot="alert-dialog-close" {...props} />
}

export function AlertDialogAction({
  className,
  variant = 'default',
  size = 'md',
  ...props
}: AlertDialogPrimitive.Close.Props & Pick<ButtonProps, 'variant' | 'size'>): React.ReactElement {
  return (
    <AlertDialogPrimitive.Close
      className={cn(className)}
      data-slot="alert-dialog-action"
      render={<Button size={size} variant={variant} />}
      {...props}
    />
  )
}

export function AlertDialogCancel({
  className,
  variant = 'ghost',
  size = 'md',
  ...props
}: AlertDialogPrimitive.Close.Props & Pick<ButtonProps, 'variant' | 'size'>): React.ReactElement {
  return (
    <AlertDialogPrimitive.Close
      className={cn(className)}
      data-slot="alert-dialog-cancel"
      render={<Button size={size} variant={variant} />}
      {...props}
    />
  )
}

export {
  AlertDialogPopup as AlertDialogContent,
  AlertDialogBackdrop as AlertDialogOverlay,
  AlertDialogPrimitive,
}
