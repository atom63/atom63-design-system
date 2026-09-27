import { Badge, Button } from '@atom63/ui-react'
import { Container, SectionHeader } from '@atom63/ui-react/layout'
import { FileText, LayoutDashboard, Plus, Settings, Users } from 'lucide-react'

import { type ActivityItem, ActivityList } from '../../blocks/activity-list/activity-list'
import { AppShell } from '../../blocks/app-shell/app-shell'
import {
  type DataTableColumn,
  DataTableSection,
} from '../../blocks/data-table-section/data-table-section'
import { PageHeader } from '../../blocks/page-header/page-header'
import { type Stat, StatRow } from '../../blocks/stat-row/stat-row'
import { type Invoice, invoices } from '../list-page/list-page-data'

export const template = {
  id: 'dashboard-page',
  kind: 'page',
  title: 'Dashboard page',
  description:
    'An overview inside the app shell: headline numbers, the most recent records and an activity feed, with one primary action.',
  category: 'data',
  tags: ['dashboard', 'overview', 'home', 'stats', 'metrics', 'activity', 'app shell'],
  readiness: 'draft',
} as const

const nav = [
  { current: true, href: '#overview', icon: <LayoutDashboard aria-hidden />, label: 'Overview' },
  { href: '#invoices', icon: <FileText aria-hidden />, label: 'Invoices' },
  { href: '#customers', icon: <Users aria-hidden />, label: 'Customers' },
  { href: '#settings', icon: <Settings aria-hidden />, label: 'Settings' },
]

const stats: readonly Stat[] = [
  { change: { direction: 'up', text: '12%', tone: 'good' }, label: 'Revenue', value: '$48,200' },
  { change: { direction: 'down', text: '3', tone: 'good' }, label: 'Open invoices', value: '14' },
  { change: { direction: 'up', text: '2', tone: 'bad' }, label: 'Overdue', value: '5' },
  { label: 'Customers', value: '128' },
]

const activity: readonly ActivityItem[] = [
  {
    action: 'paid',
    actor: 'Northwind Traders',
    dateTime: '2026-09-27T09:12:00Z',
    id: 'a1',
    target: 'INV-1042',
    time: '2 hours ago',
  },
  {
    action: 'sent',
    actor: 'Ada Park',
    dateTime: '2026-09-27T07:40:00Z',
    id: 'a2',
    target: 'INV-1049',
    time: '4 hours ago',
  },
  {
    action: 'added the customer',
    actor: 'Ada Park',
    dateTime: '2026-09-26T16:05:00Z',
    id: 'a3',
    target: 'Summit Outfitters',
    time: 'Yesterday',
  },
  {
    action: 'marked as overdue',
    actor: 'Tally',
    dateTime: '2026-09-26T00:00:00Z',
    id: 'a4',
    target: 'INV-1047',
    time: 'Yesterday',
  },
]

const currency = new Intl.NumberFormat('en-US', { currency: 'USD', style: 'currency' })
const statusLabel = { open: 'Open', overdue: 'Overdue', paid: 'Paid' } as const
const statusVariant = { open: 'info', overdue: 'error', paid: 'success' } as const

const columns: readonly DataTableColumn<Invoice>[] = [
  { cell: invoice => invoice.id, header: 'Invoice', key: 'id' },
  { cell: invoice => invoice.customer, header: 'Customer', key: 'customer' },
  {
    cell: invoice => (
      <Badge variant={statusVariant[invoice.status]}>{statusLabel[invoice.status]}</Badge>
    ),
    header: 'Status',
    key: 'status',
  },
  {
    align: 'end',
    cell: invoice => currency.format(invoice.amount),
    header: 'Amount',
    key: 'amount',
  },
]

const recent = [...invoices].sort((a, b) => b.issued.localeCompare(a.issued)).slice(0, 4)

export function DashboardPage() {
  return (
    <AppShell navItems={nav} productName="Tally">
      <Container maxWidth="wide" padding="none">
        <PageHeader
          actions={
            <Button variant="primary">
              <Plus aria-hidden />
              New invoice
            </Button>
          }
          description="September 2026 at a glance."
          title="Overview"
        />
        <StatRow comparison="vs. August" stats={stats} />
        <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <section className="flex flex-col gap-4">
            <SectionHeader level={2} title="Recent invoices" variant="muted" />
            <DataTableSection
              columns={columns}
              empty={{
                action: <Button variant="primary">New invoice</Button>,
                description: 'Invoices you create appear here.',
                title: 'No invoices yet',
              }}
              getRowKey={invoice => invoice.id}
              headingLevel={3}
              label="Recent invoices"
              rows={recent}
              summary={`The ${recent.length} most recent of ${invoices.length}`}
            />
          </section>
          <section className="flex flex-col gap-4">
            <SectionHeader level={2} title="Activity" variant="muted" />
            <ActivityList items={activity} label="Recent activity" />
          </section>
        </div>
      </Container>
    </AppShell>
  )
}
