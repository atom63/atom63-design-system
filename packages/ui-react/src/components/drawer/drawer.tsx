'use client'

import { Drawer as DrawerPrimitive } from '@base-ui/react/drawer'
import type { DrawerDirection, DrawerFooterVariant } from '@atom63/ui-foundation'
import * as React from 'react'
import { cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react'

import { cn } from '../../lib/cn'

/*
 * Drawer — a Base UI-backed bottom/side drawer (swipe-to-dismiss, scrim, a11y).
 * The public Atom63 compound API stays stable while the implementation is now
 * rooted in the same Base UI primitive family as Dialog/Popover/Sheet.
 */

export type DrawerAsChildProps = {
  /** Merges trigger props onto the single child element (Radix-compatible). */
  asChild?: boolean
  render?: ReactElement
  children?: ReactNode
}

export type DrawerRootProps = Omit<DrawerPrimitive.Root.Props, 'swipeDirection'> & {
  /** Visual edge the drawer is anchored to. */
  direction?: DrawerDirection
  /** Override the inferred dismiss direction when needed. */
  swipeDirection?: DrawerPrimitive.Root.Props['swipeDirection']
}

type DrawerContextValue = {
  direction: DrawerDirection
}

export type DrawerContentProps = Omit<DrawerPrimitive.Popup.Props, 'children'> & {
  children?: React.ReactNode
  contentProps?: DrawerPrimitive.Content.Props
  portalProps?: DrawerPrimitive.Portal.Props
  viewportProps?: DrawerPrimitive.Viewport.Props
}

const DrawerContext = React.createContext<DrawerContextValue>({
  direction: 'bottom',
})

/** Compose a `render` element with children. */
function composeDrawerSlot(render: ReactElement | undefined, children: ReactNode) {
  if (render && children && isValidElement<{ children?: ReactNode }>(render)) {
    return cloneElement(render, undefined, children)
  }
  return render ?? children
}

function resolveTriggerRender(
  asChild: boolean | undefined,
  render: ReactElement | undefined,
  children: ReactNode
): { render?: ReactElement; children?: ReactNode } {
  if (render) {
    const composedRender = composeDrawerSlot(render, children)
    return {
      render: isValidElement(composedRender) ? composedRender : render,
      children: undefined,
    }
  }
  if (asChild && isValidElement(children)) {
    return { render: children as ReactElement, children: undefined }
  }
  return { render: undefined, children }
}

function swipeDirectionForDirection(
  direction: DrawerDirection
): DrawerPrimitive.Root.Props['swipeDirection'] {
  switch (direction) {
    case 'top':
      return 'up'
    case 'bottom':
      return 'down'
    case 'left':
      return 'left'
    case 'right':
      return 'right'
  }
}

export function Drawer({
  direction = 'bottom',
  swipeDirection,
  children,
  ...props
}: DrawerRootProps): React.ReactElement {
  return (
    <DrawerContext.Provider value={{ direction }}>
      <DrawerPrimitive.Root
        data-slot="drawer"
        swipeDirection={swipeDirection ?? swipeDirectionForDirection(direction)}
        {...props}
      >
        {children}
      </DrawerPrimitive.Root>
    </DrawerContext.Provider>
  )
}

export type DrawerTriggerProps = DrawerPrimitive.Trigger.Props & DrawerAsChildProps

export function DrawerTrigger({
  asChild,
  render,
  children,
  ...props
}: DrawerTriggerProps): React.ReactElement {
  const slot = resolveTriggerRender(asChild, render, children)
  return (
    <DrawerPrimitive.Trigger data-slot="drawer-trigger" render={slot.render} {...props}>
      {slot.children}
    </DrawerPrimitive.Trigger>
  )
}

export function DrawerPortal(props: DrawerPrimitive.Portal.Props): React.ReactElement | null {
  return <DrawerPrimitive.Portal data-slot="drawer-portal" {...props} />
}

export type DrawerCloseProps = DrawerPrimitive.Close.Props & DrawerAsChildProps

export function DrawerClose({
  asChild,
  render,
  children,
  ...props
}: DrawerCloseProps): React.ReactElement {
  const slot = resolveTriggerRender(asChild, render, children)
  return (
    <DrawerPrimitive.Close data-slot="drawer-close" render={slot.render} {...props}>
      {slot.children}
    </DrawerPrimitive.Close>
  )
}

export function DrawerOverlay({
  className,
  ...props
}: DrawerPrimitive.Backdrop.Props): React.ReactElement {
  return (
    <DrawerPrimitive.Backdrop
      className={cn('a63-Drawer-overlay', className)}
      data-slot="drawer-overlay"
      {...props}
    />
  )
}

export function DrawerContent({
  className,
  children,
  contentProps,
  portalProps,
  viewportProps,
  ...props
}: DrawerContentProps): React.ReactElement {
  const { direction } = React.useContext(DrawerContext)

  return (
    <DrawerPortal {...portalProps}>
      <DrawerOverlay />
      <DrawerPrimitive.Viewport
        {...viewportProps}
        className={cn('a63-Drawer-viewport', viewportProps?.className)}
        data-side={direction}
        data-slot="drawer-viewport"
      >
        <DrawerPrimitive.Popup
          className={cn('a63-Drawer-content', className)}
          data-side={direction}
          data-slot="drawer-content"
          {...props}
        >
          <DrawerPrimitive.Content
            {...contentProps}
            className={cn('a63-Drawer-contentInner', contentProps?.className)}
            data-slot="drawer-content-inner"
          >
            {/* Grab handle — only shown for the bottom direction (see drawer.css). */}
            <DrawerHandle />
            {children}
          </DrawerPrimitive.Content>
        </DrawerPrimitive.Popup>
      </DrawerPrimitive.Viewport>
    </DrawerPortal>
  )
}

export function DrawerHandle({
  className,
  ...props
}: React.ComponentProps<'div'>): React.ReactElement {
  return <div className={cn('a63-Drawer-handle', className)} data-slot="drawer-handle" {...props} />
}

export function DrawerHeader({
  className,
  ...props
}: React.ComponentProps<'div'>): React.ReactElement {
  return <div className={cn('a63-Drawer-header', className)} data-slot="drawer-header" {...props} />
}

export function DrawerFooter({
  className,
  variant = 'default',
  ...props
}: React.ComponentProps<'div'> & { variant?: DrawerFooterVariant }): React.ReactElement {
  return (
    <div
      className={cn('a63-Drawer-footer', className)}
      data-slot="drawer-footer"
      data-variant={variant}
      {...props}
    />
  )
}

export function DrawerBody({
  className,
  ...props
}: React.ComponentProps<'div'>): React.ReactElement {
  return <div className={cn('a63-Drawer-body', className)} data-slot="drawer-body" {...props} />
}

export function DrawerTitle({
  className,
  ...props
}: DrawerPrimitive.Title.Props): React.ReactElement {
  return (
    <DrawerPrimitive.Title
      className={cn('a63-Drawer-title', className)}
      data-slot="drawer-title"
      {...props}
    />
  )
}

export function DrawerDescription({
  className,
  ...props
}: DrawerPrimitive.Description.Props): React.ReactElement {
  return (
    <DrawerPrimitive.Description
      className={cn('a63-Drawer-description', className)}
      data-slot="drawer-description"
      {...props}
    />
  )
}
