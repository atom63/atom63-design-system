import {
  Badge,
  Button,
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  type TableSort,
} from '@atom63/ui-react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Ellipsis } from 'lucide-react'
import { useState } from 'react'

import {
  inMain,
  landmarkParameters,
  phoneGlobals,
  ThemeMatrix,
  themeMatrixParameters,
} from '../../story-matrix'
import { type DataTableColumn, DataTableSection } from './data-table-section'

interface Order {
  id: string
  customer: string
  status: 'Shipped' | 'Pending'
  total: string
}

const rows: readonly Order[] = [
  { customer: 'Northwind Traders', id: 'SO-2201', status: 'Shipped', total: '$1,250.00' },
  { customer: 'Lumen Studio', id: 'SO-2202', status: 'Pending', total: '$480.50' },
  { customer: 'Harbor & Co.', id: 'SO-2203', status: 'Shipped', total: '$3,200.00' },
]

const columns: readonly DataTableColumn<Order>[] = [
  { cell: row => row.id, header: 'Order', key: 'id' },
  { cell: row => row.customer, header: 'Customer', key: 'customer' },
  {
    cell: row => (
      <Badge variant={row.status === 'Shipped' ? 'success' : 'info'}>{row.status}</Badge>
    ),
    header: 'Status',
    key: 'status',
  },
  { align: 'end', cell: row => row.total, header: 'Total', key: 'total' },
]

const args = {
  columns,
  empty: {
    action: <Button variant="outline">Clear filters</Button>,
    description: 'No order matches these filters. Clear them to see every order.',
    title: 'No matching orders',
  },
  getRowKey: (row: Order) => row.id,
  label: 'Orders',
  rowActions: (row: Order) => (
    <Button aria-label={`Actions for ${row.id}`} size="icon-sm" variant="ghost">
      <Ellipsis aria-hidden />
    </Button>
  ),
  rows,
  summary: '3 orders',
}

const meta = {
  title: 'Templates/Blocks/Data table section',
  component: DataTableSection<Order>,
  parameters: landmarkParameters,
  decorators: [inMain],
} satisfies Meta<typeof DataTableSection<Order>>

export default meta

type Story = StoryObj<typeof meta>

export const Desktop: Story = { args }

export const Phone: Story = { args, globals: phoneGlobals }

/* No rows: the empty state names why and offers the way out. */
export const NoResults: Story = { args: { ...args, rows: [], summary: '0 of 3 orders' } }

export const Themes: Story = {
  args,
  parameters: themeMatrixParameters,
  render: props => (
    <ThemeMatrix>
      <DataTableSection {...props} />
    </ThemeMatrix>
  ),
}

const amount = (row: Order) => Number(row.total.replace(/[^0-9.]/g, ''))

function SortedAndPagedDemo() {
  const [sort, setSort] = useState<TableSort | null>({ column: 'total', direction: 'descending' })
  const sign = sort?.direction === 'ascending' ? 1 : -1
  const sorted = [...rows].sort((a, b) =>
    sort?.column === 'customer'
      ? a.customer.localeCompare(b.customer) * sign
      : sort?.column === 'total'
        ? (amount(a) - amount(b)) * sign
        : 0
  )
  return (
    <DataTableSection
      {...args}
      columns={columns.map(column =>
        column.key === 'customer'
          ? { ...column, sortable: true }
          : column.key === 'total'
            ? { ...column, firstSortDirection: 'descending', sortable: true }
            : column
      )}
      onSortChange={setSort}
      pagination={
        <Pagination aria-label="Order pages">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious disabled />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#page-1" isActive>
                1
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#page-2">2</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#page-2" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      }
      rows={sorted}
      sort={sort}
      summary="3 of 6 orders"
    />
  )
}

/* Sortable columns and a pagination slot: the caller owns the sort and the page. */
export const SortedAndPaged: Story = { args, render: () => <SortedAndPagedDemo /> }
