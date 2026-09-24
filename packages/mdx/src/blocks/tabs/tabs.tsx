'use client'

import { TabsList, TabsPanel, TabsTab, Tabs as UITabs } from '@atom63/ui-react'
import { clsx } from 'clsx'
import type { ComponentProps } from 'react'
import { mdxStyles } from '../../mdx-styles'

export type TabsProps = ComponentProps<typeof UITabs>

/**
 * MDX `Tabs` block — a thin wrapper around the `@atom63/ui-react` `Tabs` that adds
 * prose-context block spacing. All accessibility and keyboard navigation is
 * inherited from `@atom63/ui-react`. Authors compose it as
 * `<Tabs>` + `<Tabs.List>` / `<Tabs.Tab>` / `<Tabs.Panel>`.
 */
function Tabs({ className, ...props }: TabsProps) {
  return (
    <UITabs className={clsx('not-mdx mdx-block', mdxStyles.spacing.block, className)} {...props} />
  )
}

Tabs.List = TabsList
Tabs.Tab = TabsTab
Tabs.Panel = TabsPanel

export { Tabs }
