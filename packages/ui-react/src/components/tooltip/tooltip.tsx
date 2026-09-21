'use client'

import { Tooltip as TooltipPrimitive } from '@base-ui/react/tooltip'
import type React from 'react'

import { cn } from '../../lib/cn'
import { usePortalContainer } from '../portal-container'

export const TooltipCreateHandle: typeof TooltipPrimitive.createHandle =
  TooltipPrimitive.createHandle

export const TooltipProvider: typeof TooltipPrimitive.Provider = TooltipPrimitive.Provider

export const Tooltip: typeof TooltipPrimitive.Root = TooltipPrimitive.Root

export function TooltipTrigger<Payload = unknown>(
  props: TooltipPrimitive.Trigger.Props<Payload>
): React.ReactElement {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
}

export interface TooltipPopupProps extends TooltipPrimitive.Popup.Props {
  align?: TooltipPrimitive.Positioner.Props['align']
  anchor?: TooltipPrimitive.Positioner.Props['anchor']
  portalProps?: TooltipPrimitive.Portal.Props
  side?: TooltipPrimitive.Positioner.Props['side']
  sideOffset?: TooltipPrimitive.Positioner.Props['sideOffset']
}

export function TooltipPopup({
  align = 'center',
  anchor,
  children,
  className,
  portalProps,
  side = 'top',
  sideOffset = 4,
  ...props
}: TooltipPopupProps): React.ReactElement {
  const contextPortalContainer = usePortalContainer()
  const container = portalProps?.container ?? contextPortalContainer

  return (
    <TooltipPrimitive.Portal {...portalProps} container={container}>
      <TooltipPrimitive.Positioner
        align={align}
        anchor={anchor}
        className="a63-Tooltip-positioner"
        data-slot="tooltip-positioner"
        side={side}
        sideOffset={sideOffset}
      >
        <TooltipPrimitive.Popup
          className={cn('a63-Tooltip-popup', className)}
          data-slot="tooltip-popup"
          {...props}
        >
          <TooltipPrimitive.Viewport className="a63-Tooltip-viewport" data-slot="tooltip-viewport">
            {children}
          </TooltipPrimitive.Viewport>
        </TooltipPrimitive.Popup>
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  )
}

export { TooltipPrimitive, TooltipPopup as TooltipContent }
export type TooltipContentProps = TooltipPopupProps
