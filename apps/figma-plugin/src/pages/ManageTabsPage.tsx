import { Tabs, TabsList, TabsPanel, TabsTab } from '@atom63/ui-react'

import { SectionHeader } from '../components/ui'
import { ManagePage } from './ManagePage'
import { StylesPage } from './StylesPage'

export function ManageTabsPage({ onNavigate }: { onNavigate?: (page: string) => void }) {
  return (
    <Tabs className="manage-tabs-page" defaultValue="variables">
      <div className="manage-tabs-header">
        <SectionHeader
          description="Browse and edit your variables and styles"
          title="Manage"
          variant="primary"
        />
        <TabsList size="sm">
          <TabsTab value="variables">Variables</TabsTab>
          <TabsTab value="styles">Styles</TabsTab>
        </TabsList>
      </div>
      <TabsPanel value="variables">
        <ManagePage onNavigate={onNavigate} />
      </TabsPanel>
      <TabsPanel value="styles">
        <StylesPage />
      </TabsPanel>
    </Tabs>
  )
}
