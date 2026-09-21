'use client'

import type * as React from 'react'
import { createContext, useContext } from 'react'
import * as ResizablePrimitive from 'react-resizable-panels'

import { cn } from '../../lib/cn'

type ResizableOrientation = 'horizontal' | 'vertical'

const ResizableOrientationContext = createContext<ResizableOrientation>('horizontal')

export type ResizablePanelGroupProps = Omit<
  React.ComponentProps<typeof ResizablePrimitive.Group>,
  'orientation'
> & {
  direction?: ResizableOrientation
  orientation?: ResizableOrientation
}

/*
 * Resizable — a faithful DS port of the react-resizable-panels wrapper. The
 * group flexes (row/column by orientation), panels are pass-through, and the
 * handle is a token-styled separator with an optional grip (withHandle). The
 * grip chevron is an inline SVG (matching Select / DropdownMenu). Orientation is
 * carried on context so the handle can flip its layout + grip rotation.
 */
export function ResizablePanelGroup({
  children,
  className,
  direction,
  orientation,
  ...props
}: ResizablePanelGroupProps): React.ReactElement {
  const panelOrientation = orientation ?? direction ?? 'horizontal'

  return (
    <ResizableOrientationContext.Provider value={panelOrientation}>
      <ResizablePrimitive.Group
        className={cn('a63-Resizable-group', className)}
        data-panel-group-direction={panelOrientation}
        data-slot="resizable-panel-group"
        orientation={panelOrientation}
        {...props}
      >
        {children}
      </ResizablePrimitive.Group>
    </ResizableOrientationContext.Provider>
  )
}

export type ResizablePanelProps = React.ComponentProps<typeof ResizablePrimitive.Panel>

export function ResizablePanel({ ...props }: ResizablePanelProps): React.ReactElement {
  return <ResizablePrimitive.Panel data-slot="resizable-panel" {...props} />
}

export type ResizableHandleProps = React.ComponentProps<typeof ResizablePrimitive.Separator> & {
  withHandle?: boolean
}

export function ResizableHandle({
  'aria-label': ariaLabel = 'Resize panels',
  withHandle,
  className,
  ...props
}: ResizableHandleProps): React.ReactElement {
  const orientation = useContext(ResizableOrientationContext)

  return (
    <ResizablePrimitive.Separator
      aria-label={ariaLabel}
      className={cn('a63-Resizable-handle', className)}
      data-panel-group-direction={orientation}
      data-slot="resizable-handle"
      {...props}
    >
      {withHandle && (
        <div className="a63-Resizable-handle-grip" data-slot="resizable-handle-grip">
          <svg
            aria-hidden="true"
            className="a63-Resizable-handle-grip-icon"
            fill="currentColor"
            height="10"
            viewBox="0 0 16 16"
            width="10"
          >
            <circle cx="8" cy="3.5" r="1.1" />
            <circle cx="8" cy="8" r="1.1" />
            <circle cx="8" cy="12.5" r="1.1" />
          </svg>
        </div>
      )}
    </ResizablePrimitive.Separator>
  )
}
