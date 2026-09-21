'use client'

import { Dialog as DialogPrimitive } from '@base-ui/react/dialog'
import { mergeProps } from '@base-ui/react/merge-props'
import { useRender } from '@base-ui/react/use-render'
import type { DialogFooterVariant, DialogMobilePlacement, DialogSize } from '@atom63/ui-foundation'
import type * as React from 'react'

import { cn } from '../../lib/cn'

/*
 * Dialog — a modal overlay (Base UI Dialog). The popup is the OVERLAY archetype
 * in its centered/modal form: it is a raised overlay surface
 * (--a63-surface-overlay + --a63-overlay-shadow + --a63-border-subtle), the
 * backdrop scrim + stacking read the --z-layer-scrim / --z-layer-modal
 * foundation, and entrance motion reads --a63-control-feedback-*. See dialog.css.
 *
 * Faithful to prod @atom63/ui: same parts (Root/Portal/Trigger/Close/Backdrop/
 * Viewport/Popup/Header/Footer/Title/Description/Panel) + the same aliases
 * (DialogOverlay = Backdrop, DialogContent = Popup) and the DialogCreateHandle
 * re-export. Popup keeps the `showCloseButton`/`mobilePlacement`/
 * `bottomStickOnMobile`/`closeProps`/`portalProps` props; Footer keeps its
 * `variant`, Panel its `scrollFade`. The prod trigger slot helper
 * (splitTriggerSlotProps/asChild) is replaced by Base UI's native `render`
 * prop; the ScrollArea wrapper in DialogPanel is replaced by a plain scrollable
 * element (ScrollArea is not part of this DS).
 */

export const DialogCreateHandle: typeof DialogPrimitive.createHandle = DialogPrimitive.createHandle

export const Dialog: typeof DialogPrimitive.Root = DialogPrimitive.Root

export function DialogPortal(props: DialogPrimitive.Portal.Props): React.ReactElement {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

export function DialogTrigger({
  className,
  ...props
}: DialogPrimitive.Trigger.Props): React.ReactElement {
  return (
    <DialogPrimitive.Trigger
      className={cn('a63-Dialog-trigger', className)}
      data-slot="dialog-trigger"
      {...props}
    />
  )
}

export function DialogClose(props: DialogPrimitive.Close.Props): React.ReactElement {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

export function DialogBackdrop({
  className,
  ...props
}: DialogPrimitive.Backdrop.Props): React.ReactElement {
  return (
    <DialogPrimitive.Backdrop
      className={cn('a63-Dialog-backdrop', className)}
      data-slot="dialog-backdrop"
      {...props}
    />
  )
}

export function DialogViewport({
  className,
  ...props
}: DialogPrimitive.Viewport.Props): React.ReactElement {
  return (
    <DialogPrimitive.Viewport
      className={cn('a63-Dialog-viewport', className)}
      data-slot="dialog-viewport"
      {...props}
    />
  )
}

function CloseIcon() {
  return (
    <svg aria-hidden fill="none" height="16" viewBox="0 0 16 16" width="16">
      <path
        d="m4 4 8 8M12 4l-8 8"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  )
}

export function DialogPopup({
  className,
  children,
  showCloseButton = true,
  bottomStickOnMobile = true,
  mobilePlacement,
  size = 'default',
  closeProps,
  portalProps,
  ...props
}: DialogPrimitive.Popup.Props & {
  showCloseButton?: boolean
  mobilePlacement?: DialogMobilePlacement
  size?: DialogSize
  /** @deprecated Use `mobilePlacement="bottom"` or `"center"` instead. */
  bottomStickOnMobile?: boolean
  closeProps?: DialogPrimitive.Close.Props
  portalProps?: DialogPrimitive.Portal.Props
}): React.ReactElement {
  const resolvedMobilePlacement = mobilePlacement ?? (bottomStickOnMobile ? 'bottom' : 'center')
  const stickToBottomOnMobile = resolvedMobilePlacement === 'bottom'

  return (
    <DialogPortal {...portalProps}>
      <DialogBackdrop />
      <DialogViewport data-mobile-placement={resolvedMobilePlacement}>
        <DialogPrimitive.Popup
          className={cn('a63-Dialog-popup', className)}
          data-mobile-placement={resolvedMobilePlacement}
          data-size={size}
          data-slot="dialog-popup"
          data-stick-bottom={stickToBottomOnMobile ? '' : undefined}
          {...props}
        >
          {children}
          {showCloseButton && (
            <DialogPrimitive.Close
              aria-label="Close"
              className="a63-Dialog-close-button"
              data-slot="dialog-close-button"
              {...closeProps}
            >
              <CloseIcon />
            </DialogPrimitive.Close>
          )}
        </DialogPrimitive.Popup>
      </DialogViewport>
    </DialogPortal>
  )
}

export function DialogHeader({
  className,
  render,
  ...props
}: useRender.ComponentProps<'div'>): React.ReactElement {
  const defaultProps = {
    className: cn('a63-Dialog-header', className),
    'data-slot': 'dialog-header',
  }
  return useRender({
    defaultTagName: 'div',
    props: mergeProps<'div'>(defaultProps, props),
    render,
  })
}

export function DialogFooter({
  className,
  variant = 'default',
  render,
  ...props
}: useRender.ComponentProps<'div'> & {
  variant?: DialogFooterVariant
}): React.ReactElement {
  const defaultProps = {
    className: cn('a63-Dialog-footer', className),
    'data-slot': 'dialog-footer',
    'data-variant': variant,
  }
  return useRender({
    defaultTagName: 'div',
    props: mergeProps<'div'>(defaultProps, props),
    render,
  })
}

export function DialogTitle({
  className,
  ...props
}: DialogPrimitive.Title.Props): React.ReactElement {
  return (
    <DialogPrimitive.Title
      className={cn('a63-Dialog-title', className)}
      data-slot="dialog-title"
      {...props}
    />
  )
}

export function DialogDescription({
  className,
  ...props
}: DialogPrimitive.Description.Props): React.ReactElement {
  return (
    <DialogPrimitive.Description
      className={cn('a63-Dialog-description', className)}
      data-slot="dialog-description"
      {...props}
    />
  )
}

export function DialogPanel({
  className,
  scrollFade = true,
  render,
  ...props
}: useRender.ComponentProps<'div'> & {
  scrollFade?: boolean
}): React.ReactElement {
  const defaultProps = {
    className: cn('a63-Dialog-panel', className),
    'data-scroll-fade': scrollFade ? '' : undefined,
    'data-slot': 'dialog-panel',
  }
  return useRender({
    defaultTagName: 'div',
    props: mergeProps<'div'>(defaultProps, props),
    render,
  })
}

export { DialogPopup as DialogContent, DialogBackdrop as DialogOverlay, DialogPrimitive }
export type { DialogFooterVariant, DialogMobilePlacement, DialogSize }
