import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
  Progress,
} from '@atom63/ui-react'
import { Container } from '@atom63/ui-react/layout'
import {
  CheckCircle2,
  ChevronRight,
  Ellipsis,
  FileText,
  LayoutDashboard,
  Plus,
  Settings,
  Upload,
} from 'lucide-react'
import { useState, type ReactNode } from 'react'

import { AppShell } from '../../blocks/app-shell/app-shell'
import {
  type DataTableColumn,
  DataTableSection,
} from '../../blocks/data-table-section/data-table-section'
import { DetailPanel } from '../../blocks/detail-panel/detail-panel'
import { FilterBar } from '../../blocks/filter-bar/filter-bar'
import { PageHeader } from '../../blocks/page-header/page-header'
import { type Invoice, type InvoiceStatus, invoices as sampleInvoices } from './list-page-data'

export const template = {
  id: 'list-page',
  kind: 'page',
  title: 'List page',
  description:
    'A filterable collection page inside the app shell: a header with one primary action, a search and status filter, a table that becomes stacked rows on phones, and a detail sheet for one row.',
  category: 'collections',
  tags: ['list', 'detail', 'table', 'index', 'invoice', 'invoices', 'orders', 'filter', 'search'],
  readiness: 'ready',
} as const

const nav = [
  { href: '#overview', icon: <LayoutDashboard aria-hidden />, label: 'Overview' },
  { current: true, href: '#invoices', icon: <FileText aria-hidden />, label: 'Invoices' },
  { href: '#settings', icon: <Settings aria-hidden />, label: 'Settings' },
]

const statusOptions = [
  { label: 'All statuses', value: 'all' },
  { label: 'Paid', value: 'paid' },
  { label: 'Open', value: 'open' },
  { label: 'Overdue', value: 'overdue' },
] as const

const statusBadge: Record<InvoiceStatus, { label: string; variant: 'success' | 'info' | 'error' }> =
  {
    paid: { label: 'Paid', variant: 'success' },
    open: { label: 'Open', variant: 'info' },
    overdue: { label: 'Overdue', variant: 'error' },
  }

const currency = new Intl.NumberFormat('en-US', { currency: 'USD', style: 'currency' })
const date = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeZone: 'UTC' })

function StatusBadge({ status }: { status: InvoiceStatus }) {
  return <Badge variant={statusBadge[status].variant}>{statusBadge[status].label}</Badge>
}

const columns: readonly DataTableColumn<Invoice>[] = [
  { cell: invoice => invoice.id, header: 'Invoice', key: 'id' },
  { cell: invoice => invoice.customer, header: 'Customer', key: 'customer' },
  { cell: invoice => <StatusBadge status={invoice.status} />, header: 'Status', key: 'status' },
  {
    cell: invoice => date.format(new Date(invoice.issued)),
    header: 'Issued',
    key: 'issued',
    showFrom: 'md',
  },
  {
    align: 'end',
    cell: invoice => currency.format(invoice.amount),
    header: 'Amount',
    key: 'amount',
    showFrom: 'lg',
  },
]

export interface ListPageProps {
  /** Initial record shown in the detail sheet, useful for a routed selection. */
  defaultOpenId?: string
  /** Initial search text, useful when the URL restores filter state. */
  defaultQuery?: string
  /** The rows to list; the page filters them in memory. */
  invoices?: readonly Invoice[]
  /** A transient operation surface such as import progress or completion. */
  operationStatus?: ReactNode
}

export interface ListOperationStatusProps {
  description: string
  progress?: number
  title: string
  variant: 'info' | 'success'
}

export function ListOperationStatus({
  description,
  progress,
  title,
  variant,
}: ListOperationStatusProps) {
  const Icon = variant === 'success' ? CheckCircle2 : Upload
  return (
    <Alert
      className="fixed end-4 bottom-4 z-[var(--z-layer-popover)] w-[min(24rem,calc(100vw-2rem))] bg-[var(--a63-surface-overlay)]"
      role="status"
      variant={variant}
    >
      <AlertIcon>
        <Icon aria-hidden />
      </AlertIcon>
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        <p>{description}</p>
        {progress === undefined ? null : (
          <Progress aria-label={`${title}: ${progress}%`} className="mt-2" value={progress} />
        )}
      </AlertDescription>
    </Alert>
  )
}

export function ListContent({
  defaultOpenId,
  defaultQuery = '',
  invoices = sampleInvoices,
  operationStatus,
}: ListPageProps) {
  const [query, setQuery] = useState(defaultQuery)
  const [status, setStatus] = useState('all')
  const [openId, setOpenId] = useState<string | null>(defaultOpenId ?? null)
  const open = invoices.find(invoice => invoice.id === openId)

  const needle = query.trim().toLowerCase()
  const visible = invoices.filter(
    invoice =>
      (status === 'all' || invoice.status === status) &&
      (needle === '' ||
        invoice.id.toLowerCase().includes(needle) ||
        invoice.customer.toLowerCase().includes(needle))
  )
  const filtered = needle !== '' || status !== 'all'
  const clear = () => {
    setQuery('')
    setStatus('all')
  }
  const rowMenu = (invoice: Invoice) => (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button aria-label={`Actions for ${invoice.id}`} size="icon-sm" variant="ghost">
            <Ellipsis aria-hidden />
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setOpenId(invoice.id)}>View invoice</DropdownMenuItem>
        <DropdownMenuItem>Download PDF</DropdownMenuItem>
        {invoice.status === 'paid' ? null : <DropdownMenuItem>Mark as paid</DropdownMenuItem>}
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">Void invoice</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  return (
    <>
      <Container maxWidth="wide" padding="none">
        <PageHeader
          actions={
            <Button variant="primary">
              <Plus aria-hidden />
              New invoice
            </Button>
          }
          description="Track what customers owe and what has been paid."
          title="Invoices"
        />
        <FilterBar
          filterLabel="Status"
          filterOptions={statusOptions}
          filterValue={status}
          onClear={clear}
          onFilterChange={setStatus}
          onQueryChange={setQuery}
          query={query}
          searchLabel="Search invoices"
          searchPlaceholder="Invoice number or customer"
          showClear={filtered}
        />
        <DataTableSection
          columns={columns}
          empty={
            invoices.length === 0
              ? {
                  action: <Button variant="primary">New invoice</Button>,
                  description: 'Invoices you create appear here, with their status and amount.',
                  title: 'No invoices yet',
                }
              : {
                  action: (
                    <Button onClick={clear} variant="outline">
                      Clear filters
                    </Button>
                  ),
                  description:
                    'No invoice matches this search and status. Clear the filters to see every invoice.',
                  title: 'No matching invoices',
                }
          }
          getRowKey={invoice => invoice.id}
          label="Invoices"
          renderPhoneRow={invoice => (
            <Item
              className="rounded-none"
              data-selected={openId === invoice.id ? '' : undefined}
              size="sm"
            >
              <ItemContent>
                <ItemTitle>{invoice.customer}</ItemTitle>
                <ItemDescription>
                  {invoice.id} · {date.format(new Date(invoice.issued))}
                </ItemDescription>
              </ItemContent>
              <ItemActions className="gap-1">
                <StatusBadge status={invoice.status} />
                <Button
                  aria-label={`View ${invoice.id}`}
                  onClick={() => setOpenId(invoice.id)}
                  size="icon-sm"
                  variant="ghost"
                >
                  <ChevronRight aria-hidden />
                </Button>
                {rowMenu(invoice)}
              </ItemActions>
            </Item>
          )}
          rowActions={rowMenu}
          rows={visible}
          selectedRowKey={openId ?? undefined}
          summary={
            filtered
              ? `${visible.length} of ${invoices.length} invoices`
              : `${invoices.length} invoices`
          }
        />
      </Container>
      <DetailPanel
        actions={
          <>
            <Button variant="outline">Download PDF</Button>
            {open?.status === 'paid' ? null : <Button variant="primary">Mark as paid</Button>}
          </>
        }
        description={open?.customer}
        fields={
          open
            ? [
                { label: 'Status', value: <StatusBadge status={open.status} /> },
                { label: 'Issued', value: date.format(new Date(open.issued)) },
                { label: 'Amount', value: currency.format(open.amount) },
              ]
            : []
        }
        onOpenChange={next => {
          if (!next) setOpenId(null)
        }}
        open={open !== undefined}
        title={open?.id ?? ''}
      />
      {operationStatus}
    </>
  )
}

/* The page in its app shell. An app that renders the shell once, around its
   routes, renders `ListContent` inside it instead. */
export function ListPage(props: ListPageProps) {
  return (
    <AppShell navItems={nav} productName="Tally">
      <ListContent {...props} />
    </AppShell>
  )
}
