import { Badge, Button } from '@atom63/ui-react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Ellipsis } from 'lucide-react'

import { phoneGlobals, ThemeMatrix, themeMatrixParameters } from '../../story-matrix'
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
