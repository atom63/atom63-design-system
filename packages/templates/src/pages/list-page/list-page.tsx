import {
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@atom63/ui-react'
import { Container, Page } from '@atom63/ui-react/layout'
import { Ellipsis, Plus } from 'lucide-react'
import { useState } from 'react'

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
    'A filterable collection page: a header with one primary action, a search and status filter, a table that becomes stacked rows on phones, and a detail sheet for one row.',
  category: 'collections',
  tags: ['list', 'detail', 'table', 'index', 'invoices', 'orders', 'filter', 'search'],
  readiness: 'draft',
} as const

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
  { cell: invoice => date.format(new Date(invoice.issued)), header: 'Issued', key: 'issued' },
  {
    align: 'end',
    cell: invoice => currency.format(invoice.amount),
    header: 'Amount',
    key: 'amount',
  },
]

export interface ListPageProps {
  /** The rows to list; the page filters them in memory. */
  invoices?: readonly Invoice[]
}

export function ListPage({ invoices = sampleInvoices }: ListPageProps) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [openId, setOpenId] = useState<string | null>(null)
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

  return (
    <Page>
      <Container maxWidth="wide">
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
          rowActions={invoice => (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button aria-label={`Actions for ${invoice.id}`} size="icon-sm" variant="ghost">
                    <Ellipsis aria-hidden />
                  </Button>
                }
              />
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setOpenId(invoice.id)}>
                  View invoice
                </DropdownMenuItem>
                <DropdownMenuItem>Download PDF</DropdownMenuItem>
                {invoice.status === 'paid' ? null : (
                  <DropdownMenuItem>Mark as paid</DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive">Void invoice</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          rows={visible}
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
    </Page>
  )
}
