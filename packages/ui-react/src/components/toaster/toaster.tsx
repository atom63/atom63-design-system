'use client'

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from 'lucide-react'
import type * as React from 'react'
import { createPortal } from 'react-dom'
import { Toaster as Sonner, type ToasterProps as SonnerToasterProps } from 'sonner'

import { type ToasterVariant, toasterContract } from '@atom63/ui-foundation'

import { cn } from '../../lib/cn'

export interface ToasterProps extends SonnerToasterProps {
  /**
   * `default` draws a card on the overlay surface. `inverse` draws a compact
   * pill in the inverse colours (dark on a light app, light on a dark one) with
   * the icon after the message, for a short status such as "Scheduling message…".
   */
  variant?: ToasterVariant
}

/* Sonner reads its colours and corner from these variables on the host. */
const variantStyles: Record<ToasterVariant, React.CSSProperties> = {
  default: {
    '--border-radius': 'var(--radius)',
    '--normal-bg': 'var(--popover)',
    '--normal-border': 'var(--border)',
    '--normal-text': 'var(--popover-foreground)',
  } as React.CSSProperties,
  inverse: {
    '--border-radius': 'var(--radius-pill)',
    '--normal-bg': 'var(--a63-action-neutral)',
    '--normal-border': 'transparent',
    '--normal-text': 'var(--a63-action-neutral-foreground)',
  } as React.CSSProperties,
}

/* Sonner's own sheet is unlayered, so the compact geometry goes on each toast's
   inline style; the rest of the pill lives in toaster.css. Sonner's shadow stays:
   its focus ring is drawn as part of it. */
const inverseToastStyle: React.CSSProperties = {
  fontSize: 'var(--a63-type-subhead-font-size)',
  gap: 'var(--a63-space-2)',
  paddingBlock: 'var(--a63-space-2)',
  paddingInline: 'var(--a63-space-4)',
}

/*
 * Toaster — the sonner host that renders toasts raised inside this package
 * (CopyButton being the main one). It ships here so consuming apps do not need
 * their own sonner dependency just to make package components audible.
 *
 * Colors resolve from the theme contract rather than sonner's built-in
 * palette, so the surface tracks the active Atom63 theme.
 */
export function Toaster({
  style,
  toastOptions,
  variant = toasterContract.defaultVariant,
  ...props
}: ToasterProps): React.ReactElement {
  const inverse = variant === 'inverse'
  const toaster = (
    <Sonner
      className="toaster group"
      data-slot={toasterContract.slots[0]}
      icons={{
        error: <OctagonXIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
        success: <CircleCheckIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
      }}
      style={
        {
          ...variantStyles[variant],
          zIndex: 'var(--z-layer-toast)',
          ...style,
        } as React.CSSProperties
      }
      {...props}
      toastOptions={{
        ...toastOptions,
        classNames: {
          ...toastOptions?.classNames,
          icon: cn(inverse ? undefined : 'mt-0.5', toastOptions?.classNames?.icon),
          toast: cn(
            inverse ? 'a63-Toast a63-Toast--inverse' : '!items-start',
            toastOptions?.classNames?.toast
          ),
        },
        style: inverse ? { ...inverseToastStyle, ...toastOptions?.style } : toastOptions?.style,
      }}
    />
  )

  if (typeof document === 'undefined') {
    return toaster
  }

  return createPortal(toaster, document.body)
}
