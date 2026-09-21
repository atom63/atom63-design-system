'use client'

import {
  type ToggleSize,
  type ToggleTone,
  toggleContract,
  toggleGroupContract,
} from '@atom63/ui-foundation'
import { ToggleGroup as ToggleGroupPrimitive } from '@base-ui/react/toggle-group'
import * as React from 'react'

import { cn } from '../../lib/cn'
import { Toggle, type ToggleProps } from '../toggle'

interface ToggleGroupContextValue {
  orientation: 'horizontal' | 'vertical'
  size: ToggleSize
  tone: ToggleTone
}

const ToggleGroupContext = React.createContext<ToggleGroupContextValue>({
  orientation: toggleGroupContract.defaultOrientation,
  size: toggleContract.defaultSize,
  tone: toggleContract.defaultTone,
})

export interface ToggleGroupProps extends Omit<ToggleGroupPrimitive.Props, 'className'> {
  className?: string
  size?: ToggleSize
  tone?: ToggleTone
}

/*
 * ToggleGroup — always a joined/welded segmented bar (Figma 432:1335). Owns the
 * special per-cell gel chrome via CSS; items are ToggleGroupItem. For a gapped
 * row of independent toggles, compose standalone `Toggle`s instead.
 */
export function ToggleGroup({
  children,
  className,
  orientation = toggleGroupContract.defaultOrientation,
  size = toggleContract.defaultSize,
  tone = toggleContract.defaultTone,
  ...props
}: ToggleGroupProps): React.ReactElement {
  return (
    <ToggleGroupPrimitive
      className={cn('a63-ToggleGroup', className)}
      data-orientation={orientation}
      data-size={size}
      data-slot="toggle-group"
      data-tone={tone}
      orientation={orientation}
      {...props}
    >
      <ToggleGroupContext.Provider value={{ orientation, size, tone }}>
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive>
  )
}

export interface ToggleGroupItemProps extends ToggleProps {
  value: string
}

export function ToggleGroupItem({
  size,
  tone,
  ...props
}: ToggleGroupItemProps): React.ReactElement {
  const group = React.useContext(ToggleGroupContext)
  return (
    <Toggle
      data-slot="toggle-group-item"
      size={size ?? group.size}
      tone={tone ?? group.tone}
      {...props}
    />
  )
}

export interface ToggleGroupSeparatorProps extends React.ComponentProps<'div'> {
  orientation?: 'horizontal' | 'vertical'
}

export function ToggleGroupSeparator({
  className,
  orientation,
  ...props
}: ToggleGroupSeparatorProps): React.ReactElement {
  const group = React.useContext(ToggleGroupContext)
  const resolvedOrientation =
    orientation ?? (group.orientation === 'horizontal' ? 'vertical' : 'horizontal')

  return (
    <div
      aria-hidden
      className={cn('a63-ToggleGroup-separator', className)}
      data-orientation={resolvedOrientation}
      data-slot="toggle-group-separator"
      {...props}
    />
  )
}
