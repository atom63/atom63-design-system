'use client'

import { Collapsible as CollapsiblePrimitive } from '@base-ui/react/collapsible'
import { ChevronDown } from 'lucide-react'
import type * as React from 'react'

import { cn } from '../../lib/cn'

/*
 * Collapsible — an expandable content section with an animated height reveal
 * (Base UI Collapsible). Faithful to prod @atom63/ui: same parts
 * (Root/Trigger/Content). The prod trigger slot helper is replaced by Base UI's
 * native `render` prop (DS convention) — pass `render={<button …/>}` where the
 * app previously used `asChild`. Chrome is left to the consumer; the recipe only
 * drives the Base UI --collapsible-panel-height reveal.
 */

export type CollapsibleProps = CollapsiblePrimitive.Root.Props
export type CollapsibleTriggerProps = CollapsiblePrimitive.Trigger.Props
export type CollapsibleContentProps = CollapsiblePrimitive.Panel.Props

export function Collapsible({ className, ...props }: CollapsibleProps): React.ReactElement {
  return (
    <CollapsiblePrimitive.Root
      className={cn('a63-Collapsible', className)}
      data-slot="collapsible"
      {...props}
    />
  )
}

export function CollapsibleTrigger({
  className,
  ...props
}: CollapsibleTriggerProps): React.ReactElement {
  return (
    <CollapsiblePrimitive.Trigger
      className={cn('a63-Collapsible-trigger', className)}
      data-slot="collapsible-trigger"
      {...props}
    />
  )
}

export function CollapsibleIndicator({
  children,
  className,
  ...props
}: React.ComponentProps<'span'>): React.ReactElement {
  return (
    <span
      {...props}
      aria-hidden="true"
      className={cn('a63-Collapsible-indicator', className)}
      data-slot="collapsible-indicator"
    >
      {children ?? <ChevronDown aria-hidden />}
    </span>
  )
}

export function CollapsibleContent({
  className,
  ...props
}: CollapsibleContentProps): React.ReactElement {
  return (
    <CollapsiblePrimitive.Panel
      className={cn('a63-Collapsible-content', className)}
      data-slot="collapsible-content"
      {...props}
    />
  )
}
