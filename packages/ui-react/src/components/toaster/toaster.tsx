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
import { Toaster as Sonner, type ToasterProps } from 'sonner'

import { toasterContract } from '@atom63/ui-foundation'

export type { ToasterProps }

/*
 * Toaster — the sonner host that renders toasts raised inside this package
 * (CopyButton being the main one). It ships here so consuming apps do not need
 * their own sonner dependency just to make package components audible.
 *
 * Colors resolve from the theme contract rather than sonner's built-in
 * palette, so the surface tracks the active Atom63 theme.
 */
export function Toaster({ style, ...props }: ToasterProps): React.ReactElement {
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
          '--border-radius': 'var(--radius)',
          '--normal-bg': 'var(--popover)',
          '--normal-border': 'var(--border)',
          '--normal-text': 'var(--popover-foreground)',
          zIndex: 'var(--z-layer-toast)',
          ...style,
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          icon: 'mt-0.5',
          toast: '!items-start',
        },
      }}
      {...props}
    />
  )

  if (typeof document === 'undefined') {
    return toaster
  }

  return createPortal(toaster, document.body)
}
