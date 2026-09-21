'use client'

import {
  sheetContract,
  type SheetFooterVariant as FoundationSheetFooterVariant,
  type SheetSide as FoundationSheetSide,
  type SheetVariant as FoundationSheetVariant,
} from '@atom63/ui-foundation'
import { Dialog as SheetPrimitive } from '@base-ui/react/dialog'
import { mergeProps } from '@base-ui/react/merge-props'
import { useRender } from '@base-ui/react/use-render'
import { X } from 'lucide-react'
import * as React from 'react'

import { cn } from '../../lib/cn'
import { Button } from '../button'
import { ScrollArea } from '../scroll-area'

/*
 * Sheet — a Base UI Dialog rendered as a slide-in panel (drawer-from-edge).
 * Faithful port of prod @atom63/ui sheet.tsx: same parts (Root/Portal/Trigger/
 * Close/Backdrop/Viewport/Popup/Header/Footer/Title/Description/Panel) and the
 * same pass-through `side` ('left'|'right'|'top'|'bottom') + `variant`
 * ('default'|'inset') props — Base UI Dialog has no `side`, so we add it and drive
 * the slide direction via data-side + CSS. The trigger/close render-slot helper is
 * replaced by Base UI's native `render` prop (DS convention).
 *
 * Chrome is restyled to a63 tokens (mirrors Drawer): the sheet is a raised overlay
 * surface (--a63-surface-overlay + --a63-overlay-shadow), the scrim + z-stacking
 * read the --z-layer-* / --a63-scrim foundation. See sheet.css.
 */

export type SheetSide = FoundationSheetSide
export type SheetVariant = FoundationSheetVariant

let openSheetCount = 0

function setSheetBodyState(open: boolean) {
  openSheetCount = Math.max(0, openSheetCount + (open ? 1 : -1))
  document.body.toggleAttribute('data-sheet-open', openSheetCount > 0)
}

export function Sheet({ onOpenChange, open, defaultOpen, ...props }: SheetPrimitive.Root.Props) {
  const isControlled = open !== undefined
  const bodyStateRef = React.useRef(false)

  const syncBodyState = React.useCallback((nextOpen: boolean) => {
    if (bodyStateRef.current === nextOpen) return
    bodyStateRef.current = nextOpen
    setSheetBodyState(nextOpen)
  }, [])

  React.useEffect(() => {
    if (isControlled) syncBodyState(open)
  }, [isControlled, open, syncBodyState])

  React.useEffect(() => {
    if (!isControlled && defaultOpen) syncBodyState(true)
    return () => syncBodyState(false)
  }, [defaultOpen, isControlled, syncBodyState])

  const handleOpenChange: SheetPrimitive.Root.Props['onOpenChange'] = (open, eventDetails) => {
    if (!isControlled) syncBodyState(open)
    onOpenChange?.(open, eventDetails)
  }

  return (
    <SheetPrimitive.Root
      data-slot="sheet"
      defaultOpen={defaultOpen}
      onOpenChange={handleOpenChange}
      open={open}
      {...props}
    />
  )
}

export function SheetPortal(props: SheetPrimitive.Portal.Props): React.ReactElement {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />
}

export function SheetTrigger({
  className,
  ...props
}: SheetPrimitive.Trigger.Props): React.ReactElement {
  return <SheetPrimitive.Trigger className={className} data-slot="sheet-trigger" {...props} />
}

export function SheetClose({
  className,
  ...props
}: SheetPrimitive.Close.Props): React.ReactElement {
  return <SheetPrimitive.Close className={className} data-slot="sheet-close" {...props} />
}

export function SheetBackdrop({
  className,
  ...props
}: SheetPrimitive.Backdrop.Props): React.ReactElement {
  return (
    <SheetPrimitive.Backdrop
      className={cn('a63-Sheet-backdrop', className)}
      data-slot="sheet-backdrop"
      {...props}
    />
  )
}

export type SheetViewportProps = SheetPrimitive.Viewport.Props & {
  side?: SheetSide
  variant?: SheetVariant
}

export function SheetViewport({
  className,
  side = sheetContract.defaultSide,
  variant = sheetContract.defaultVariant,
  ...props
}: SheetViewportProps): React.ReactElement {
  return (
    <SheetPrimitive.Viewport
      className={cn('a63-Sheet-viewport', className)}
      data-side={side}
      data-slot="sheet-viewport"
      data-variant={variant}
      {...props}
    />
  )
}

export type SheetPopupProps = SheetPrimitive.Popup.Props & {
  showCloseButton?: boolean
  side?: SheetSide
  variant?: SheetVariant
  closeProps?: SheetPrimitive.Close.Props
  portalProps?: SheetPrimitive.Portal.Props
}

export function SheetPopup({
  className,
  children,
  showCloseButton = true,
  side = sheetContract.defaultSide,
  variant = sheetContract.defaultVariant,
  closeProps,
  portalProps,
  ...props
}: SheetPopupProps): React.ReactElement {
  return (
    <SheetPortal {...portalProps}>
      <SheetBackdrop />
      <SheetViewport side={side} variant={variant}>
        <SheetPrimitive.Popup
          className={cn('a63-Sheet-popup', className)}
          data-side={side}
          data-slot="sheet-popup"
          data-variant={variant}
          {...props}
        >
          {children}
          {showCloseButton && (
            <SheetPrimitive.Close
              aria-label="Close"
              className="a63-Sheet-close-button"
              data-slot="sheet-close-button"
              render={<Button size="icon" variant="ghost" />}
              {...closeProps}
            >
              <X aria-hidden="true" />
            </SheetPrimitive.Close>
          )}
        </SheetPrimitive.Popup>
      </SheetViewport>
    </SheetPortal>
  )
}

export function SheetHeader({
  className,
  render,
  ...props
}: useRender.ComponentProps<'div'>): React.ReactElement {
  const defaultProps = {
    className: cn('a63-Sheet-header', className),
    'data-slot': 'sheet-header',
  }

  return useRender({
    defaultTagName: 'div',
    props: mergeProps<'div'>(defaultProps, props),
    render,
  })
}

export type SheetFooterProps = useRender.ComponentProps<'div'> & {
  variant?: FoundationSheetFooterVariant
}

export function SheetFooter({
  className,
  variant = sheetContract.defaultFooterVariant,
  render,
  ...props
}: SheetFooterProps): React.ReactElement {
  const defaultProps = {
    className: cn('a63-Sheet-footer', className),
    'data-slot': 'sheet-footer',
    'data-variant': variant,
  }

  return useRender({
    defaultTagName: 'div',
    props: mergeProps<'div'>(defaultProps, props),
    render,
  })
}

export function SheetTitle({
  className,
  ...props
}: SheetPrimitive.Title.Props): React.ReactElement {
  return (
    <SheetPrimitive.Title
      className={cn('a63-Sheet-title', className)}
      data-slot="sheet-title"
      {...props}
    />
  )
}

export function SheetDescription({
  className,
  ...props
}: SheetPrimitive.Description.Props): React.ReactElement {
  return (
    <SheetPrimitive.Description
      className={cn('a63-Sheet-description', className)}
      data-slot="sheet-description"
      {...props}
    />
  )
}

export type SheetPanelProps = useRender.ComponentProps<'div'> & {
  scrollFade?: boolean
}

export function SheetPanel({
  className,
  scrollFade = true,
  render,
  ...props
}: SheetPanelProps): React.ReactElement {
  const defaultProps = {
    className: cn('a63-Sheet-panel', className),
    'data-slot': 'sheet-panel',
  }

  return (
    <ScrollArea scrollFade={scrollFade}>
      {useRender({
        defaultTagName: 'div',
        props: mergeProps<'div'>(defaultProps, props),
        render,
      })}
    </ScrollArea>
  )
}

export { SheetPopup as SheetContent, SheetBackdrop as SheetOverlay, SheetPrimitive }
