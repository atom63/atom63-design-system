import { Button } from '@atom63/ui-react'
import { Container } from '@atom63/ui-react/layout'
import { FileText, LayoutDashboard, Plus, Settings, Upload } from 'lucide-react'

import { AppShell } from '../../blocks/app-shell/app-shell'
import { EmptyState } from '../../blocks/empty-state/empty-state'
import { GettingStartedChecklist } from '../../blocks/getting-started-checklist/getting-started-checklist'
import { PageHeader } from '../../blocks/page-header/page-header'

export const template = {
  id: 'onboarding-page',
  kind: 'page',
  title: 'Onboarding page',
  description:
    'A first-run page inside the app shell: a welcome header, an empty state whose primary action creates the first record with importing as the quieter alternative, and a getting-started checklist.',
  category: 'feedback',
  tags: [
    'onboarding',
    'first run',
    'empty',
    'welcome',
    'getting started',
    'checklist',
    'app shell',
  ],
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
        {/* The empty state already offers the first step's action, so the checklist repeats none. */}
        <GettingStartedChecklist
          steps={[
            {
              description: 'Tally sends it and tells you when it is opened and paid.',
              done: false,
              id: 'invoice',
              title: 'Create your first invoice',
            },
            {
              description: 'Save who you bill once, and pick them when you invoice.',
              done: false,
              id: 'customer',
              title: 'Add a customer',
            },
            {
              description: 'Tally follows up on overdue invoices so you do not have to.',
              done: false,
              id: 'reminders',
              title: 'Turn on payment reminders',
            },
          ]}
          title="Get started"
        />
      </Container>
    </AppShell>
  )
}
