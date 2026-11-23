import {
  Badge,
  Button,
  DropdownMenuItem,
  DropdownMenuSeparator,
  FeedbackState,
  Skeleton,
} from '@atom63/ui-react'
import { Container, SectionHeader } from '@atom63/ui-react/layout'
import { FileText, LayoutDashboard, Plus, Settings } from 'lucide-react'

import { type ActivityItem, ActivityList } from '../../blocks/activity-list/activity-list'
import { AppShell, type AppShellLabels } from '../../blocks/app-shell/app-shell'
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
    'An overview inside the app shell: headline numbers, the most recent records and an activity feed, with one primary action, and its loading, error and new-workspace states.',
  category: 'data',
  tags: ['dashboard', 'overview', 'home', 'stats', 'metrics', 'activity', 'app shell'],
  readiness: 'ready',
} as const

const nav = [
  { current: true, href: '#overview', icon: <LayoutDashboard aria-hidden />, label: 'Overview' },
  { href: '#invoices', icon: <FileText aria-hidden />, label: 'Invoices' },
  { href: '#settings', icon: <Settings aria-hidden />, label: 'Settings' },
]

/* The signed-in user at the foot of the sidebar, with the account menu. */
const user = {
  detail: 'ada@tally.app',
  menu: (
    <>
      <DropdownMenuItem>Profile</DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem>Sign out</DropdownMenuItem>
    </>
  ),
  name: 'Ada Park',
}

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

/** What the overview shows: the data, placeholders, a failed load, or a new workspace. */
export type DashboardState = 'ready' | 'loading' | 'error' | 'empty'

export interface DashboardContentProps {
  /** Called by the error state's "Try again". */
  onRetry?: () => void
  /** The headline numbers; the sample ones by default. */
  stats?: readonly Stat[]
  /** `ready` by default. */
  state?: DashboardState
}

/* Placeholder rows shaped like a list, announced once as busy. */
function LoadingBlock({ label, rows }: { label: string; rows: number }) {
  return (
    <div aria-busy="true" aria-label={label} className="flex flex-col gap-3" role="status">
      {Array.from({ length: rows }, (_, index) => (
        <Skeleton className="h-10 w-full rounded-md" key={index} />
      ))}
    </div>
  )
}

/*
 * A new workspace has no numbers yet: the stats read zero rather than
 * disappearing, the recent invoices show their empty state with the way in,
 * and the feed says nothing has happened.
 */
const emptyStats: readonly Stat[] = [
  { label: 'Revenue', value: '$0' },
  { label: 'Open invoices', value: '0' },
  { label: 'Overdue', value: '0' },
  { label: 'Customers', value: '0' },
]

export function DashboardContent({
  onRetry,
  stats: statsProp = stats,
  state = 'ready',
}: DashboardContentProps) {
  const rows = state === 'empty' ? [] : recent
  return (
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
      {state === 'error' ? (
        <FeedbackState
          actions={[{ label: 'Try again', onClick: onRetry, variant: 'outline' }]}
          description="We couldn't load the overview. Check your connection and try again; nothing you saved is lost."
          level={2}
          state="error"
          title="Couldn't load the overview"
        />
      ) : (
        <>
          <StatRow
            comparison={state === 'ready' ? 'vs. August' : undefined}
            loading={state === 'loading'}
            stats={state === 'empty' ? emptyStats : statsProp}
          />
          <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <section className="flex flex-col gap-4">
              <SectionHeader level={2} title="Recent invoices" variant="muted" />
              {state === 'loading' ? (
                <LoadingBlock label="Loading recent invoices" rows={4} />
              ) : (
                <DataTableSection
                  columns={columns}
                  empty={{
                    action: <Button variant="outline">New invoice</Button>,
                    description: 'Invoices you create appear here.',
                    title: 'No invoices yet',
                  }}
                  getRowKey={invoice => invoice.id}
                  headingLevel={3}
                  label="Recent invoices"
                  rows={rows}
                  summary={
                    rows.length === 0
                      ? 'No invoices yet'
                      : `The ${rows.length} most recent of ${invoices.length}`
                  }
                />
              )}
            </section>
            <section className="flex flex-col gap-4">
              <SectionHeader level={2} title="Activity" variant="muted" />
              {state === 'loading' ? (
                <LoadingBlock label="Loading activity" rows={4} />
              ) : state === 'empty' ? (
                <p className="text-muted-foreground text-sm">
                  Nothing has happened yet. Sending your first invoice starts the feed.
                </p>
              ) : (
                <ActivityList items={activity} label="Recent activity" />
              )}
            </section>
          </div>
        </>
      )}
    </Container>
  )
}

/* The page in its app shell. An app that renders the shell once, around its
   routes, renders `DashboardContent` inside it instead. */
export interface DashboardPageProps extends DashboardContentProps {
  /** The shell's own strings, for a product in another language; English by default. */
  shellLabels?: AppShellLabels
}

export function DashboardPage({ shellLabels, ...props }: DashboardPageProps) {
  return (
    <AppShell labels={shellLabels} navItems={nav} productName="Tally" user={user}>
      <DashboardContent {...props} />
    </AppShell>
  )
}
