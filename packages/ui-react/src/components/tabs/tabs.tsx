'use client'

import { type TabsSize, type TabsVariant, tabsContract } from '@atom63/ui-foundation'
import { Tabs as TabsPrimitive } from '@base-ui/react/tabs'
import * as React from 'react'

import { cn } from '../../lib/cn'

const TabsSizeContext = React.createContext<TabsSize>(tabsContract.defaultSize)

/*
 * Tabs — a single-select tab set with a sliding active indicator (Base UI Tabs).
 * Faithful to prod @atom63/ui: the TabsList carries `variant`
 * (default = a filled pill track, underline = an underline bar, attached =
 * borderless folder tabs) + a `size` ramp, and TabsTab takes the same `size`.
 * The default/attached indicator is a raised pill (--a63-surface-overlay +
 * --a63-control-shadow); the underline indicator is the brand accent bar. All
 * fills read theme-overridden semantics, so the 4 themes restyle it for free.
 */

export function Tabs({ className, ...props }: TabsPrimitive.Root.Props): React.ReactElement {
  return <TabsPrimitive.Root className={cn('a63-Tabs', className)} data-slot="tabs" {...props} />
}

export interface TabsListProps extends TabsPrimitive.List.Props {
  size?: TabsSize
  variant?: TabsVariant
}

export function TabsList({
  children,
  className,
  size = tabsContract.defaultSize,
  variant = tabsContract.defaultVariant,
  ...props
}: TabsListProps): React.ReactElement {
  return (
    <TabsPrimitive.List
      className={cn('a63-Tabs-list', className)}
      data-size={size}
      data-slot="tabs-list"
      data-variant={variant}
      {...props}
    >
      <TabsSizeContext.Provider value={size}>
        {children}
        {variant === 'attached' ? null : (
          <TabsPrimitive.Indicator className="a63-Tabs-indicator" data-slot="tab-indicator" />
        )}
      </TabsSizeContext.Provider>
    </TabsPrimitive.List>
  )
}

export interface TabsTabProps extends TabsPrimitive.Tab.Props {
  size?: TabsSize
}

export function TabsTab({ className, size, ...props }: TabsTabProps): React.ReactElement {
  const contextSize = React.useContext(TabsSizeContext)
  const resolvedSize = size ?? contextSize
  return (
    <TabsPrimitive.Tab
      className={cn('a63-Tabs-tab', className)}
      data-size={resolvedSize}
      data-slot="tabs-tab"
      {...props}
    />
  )
}

export interface TabsPanelProps extends TabsPrimitive.Panel.Props {
  animated?: boolean
}

export function TabsPanel({
  animated = false,
  className,
  ...props
}: TabsPanelProps): React.ReactElement {
  return (
    <TabsPrimitive.Panel
      className={cn('a63-Tabs-panel', className)}
      data-animated={animated || undefined}
      data-slot="tabs-content"
      {...props}
    />
  )
}

// Prod aliases: TabsContent === TabsPanel, TabsTrigger === TabsTab.
export { TabsPanel as TabsContent, TabsTab as TabsTrigger }
