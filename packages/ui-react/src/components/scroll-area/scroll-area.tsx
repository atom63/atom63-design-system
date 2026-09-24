'use client'

import { ScrollArea as ScrollAreaPrimitive } from '@base-ui/react/scroll-area'
import type * as React from 'react'

import { cn } from '../../lib/cn'

export type ScrollAreaViewportProps = Omit<
  ScrollAreaPrimitive.Viewport.Props,
  'children' | 'className' | 'ref'
> & {
  [key: `data-${string}`]: boolean | number | string | undefined
}

function ScrollArea({
  className,
  children,
  scrollFade = false,
  scrollbarGutter = false,
  showScrollbarOnHover = false,
  viewportClassName,
  viewportProps,
  viewportRef,
  ...props
}: ScrollAreaPrimitive.Root.Props & {
  scrollFade?: boolean
  scrollbarGutter?: boolean
  /** Show scrollbar when hovering over the scroll area */
  showScrollbarOnHover?: boolean
  viewportClassName?: string
  viewportProps?: ScrollAreaViewportProps
  viewportRef?: React.Ref<HTMLDivElement>
}) {
  return (
    <ScrollAreaPrimitive.Root
      className={cn('a63-ScrollArea', className)}
      data-show-on-hover={showScrollbarOnHover || undefined}
      data-slot="scroll-area"
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        {...viewportProps}
        className={cn('a63-ScrollArea-viewport', viewportClassName)}
        data-scroll-fade={scrollFade || undefined}
        data-scrollbar-gutter={scrollbarGutter || undefined}
        data-slot="scroll-area-viewport"
        ref={viewportRef}
      >
        <ScrollAreaPrimitive.Content
          className="a63-ScrollArea-content"
          data-slot="scroll-area-content"
        >
          {children}
        </ScrollAreaPrimitive.Content>
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar orientation="vertical" />
      <ScrollBar orientation="horizontal" />
      <ScrollAreaPrimitive.Corner
        className="a63-ScrollArea-corner"
        data-slot="scroll-area-corner"
      />
    </ScrollAreaPrimitive.Root>
  )
}

function ScrollBar({
  className,
  orientation = 'vertical',
  ...props
}: ScrollAreaPrimitive.Scrollbar.Props) {
  return (
    <ScrollAreaPrimitive.Scrollbar
      className={cn('a63-ScrollArea-scrollbar', className)}
      data-slot="scroll-area-scrollbar"
      orientation={orientation}
      {...props}
    >
      <ScrollAreaPrimitive.Thumb className="a63-ScrollArea-thumb" data-slot="scroll-area-thumb" />
    </ScrollAreaPrimitive.Scrollbar>
  )
}

export { ScrollArea, ScrollBar }
