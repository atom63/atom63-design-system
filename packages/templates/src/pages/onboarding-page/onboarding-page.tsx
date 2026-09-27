import { Button } from '@atom63/ui-react'
import { Container } from '@atom63/ui-react/layout'
import { FileText, LayoutDashboard, Plus, Settings, Upload } from 'lucide-react'

import { AppShell } from '../../blocks/app-shell/app-shell'
import { EmptyState } from '../../blocks/empty-state/empty-state'
import { PageHeader } from '../../blocks/page-header/page-header'

export const template = {
  id: 'onboarding-page',
  kind: 'page',
  title: 'Onboarding page',
  description:
    'A first-run page inside the app shell: a welcome header and an empty state whose primary action creates the first record, with importing as the quieter alternative.',
  category: 'feedback',
  tags: ['onboarding', 'first run', 'empty', 'welcome', 'getting started', 'app shell'],
  readiness: 'draft',
} as const

const nav = [
  { href: '#overview', icon: <LayoutDashboard aria-hidden />, label: 'Overview' },
  { current: true, href: '#invoices', icon: <FileText aria-hidden />, label: 'Invoices' },
  { href: '#settings', icon: <Settings aria-hidden />, label: 'Settings' },
]

export function OnboardingPage() {
  return (
    <AppShell navItems={nav} productName="Tally">
      <Container maxWidth="default" padding="none">
        <PageHeader
          description="Send your first invoice and Tally tracks it until it is paid."
          title="Welcome to Tally"
        />
        <EmptyState
          action={
            <Button variant="primary">
              <Plus aria-hidden />
              Create your first invoice
            </Button>
          }
          description="Invoices you create or import appear here, with their status and amount."
          icon={<FileText aria-hidden />}
          secondaryAction={
            <Button variant="outline">
              <Upload aria-hidden />
              Import from CSV
            </Button>
          }
          title="No invoices yet"
        />
      </Container>
    </AppShell>
  )
}
