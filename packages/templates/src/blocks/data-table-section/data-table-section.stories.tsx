import {
  Badge,
  UIProvider,
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
  tabletGlobals,
  ThemeMatrix,
  themeMatrixParameters,
  wideGlobals,
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

/* Two more columns: Placed appears from `md`, Channel from `lg`. */
const responsiveColumns: readonly DataTableColumn<Order>[] = [
  ...columns.slice(0, 3),
  { cell: () => '12 Sep 2026', header: 'Placed', key: 'placed', showFrom: 'md' },
  { cell: () => 'Online store', header: 'Channel', key: 'channel', showFrom: 'lg' },
  ...columns.slice(3),
]

/* Each header's visibility at the story's width: shown or hidden. */
const checkColumns = (canvasElement: HTMLElement, expected: Record<string, boolean>) => {
  const headers = [...canvasElement.querySelectorAll<HTMLElement>('thead th')]
  for (const [header, shown] of Object.entries(expected)) {
    const cell = headers.find(th => th.textContent === header)
    if (!cell) throw new Error(`Expected a ${header} header`)
    if (cell.checkVisibility() !== shown) {
      throw new Error(`Expected ${header} ${shown ? 'shown' : 'hidden'} at ${window.innerWidth}px`)
    }
  }
}

/* 768px: the table, with the md column and without the lg column. */
export const Tablet: Story = {
  args: { ...args, columns: responsiveColumns },
  globals: tabletGlobals,
  play: ({ canvasElement }) => checkColumns(canvasElement, { Channel: false, Placed: true }),
}

/* 1440px: every column. */
export const Wide: Story = {
  args: { ...args, columns: responsiveColumns },
  globals: wideGlobals,
  play: ({ canvasElement }) => checkColumns(canvasElement, { Channel: true, Placed: true }),
}

const longRows: readonly Order[] = [
  {
    customer: 'Donaudampfschifffahrtsgesellschaft Kundenabrechnungsabteilung GmbH & Co. KG',
    id: 'SO-2201',
    status: 'Shipped',
    total: '$1,234,567.89',
  },
  {
    customer: 'https://billing.example.com/customers/northwind-traders-international',
    id: 'SO-2202',
    status: 'Pending',
    total: '$9,876,543.21',
  },
  {
    customer: '北京星辰数字科技有限公司华东区域销售与客户服务中心',
    id: 'SO-2203',
    status: 'Shipped',
    total: '$48.00',
  },
]

/* Nothing in the block may push the page wider than the viewport. */
const checkNoOverflow = (canvasElement: HTMLElement) => {
  if (document.documentElement.scrollWidth > window.innerWidth + 1) {
    throw new Error('The block overflows the page horizontally')
  }
  for (const item of canvasElement.querySelectorAll<HTMLElement>('ul > li, ul > li dd')) {
    if (item.checkVisibility() && item.scrollWidth > item.clientWidth + 1) {
      throw new Error(`"${item.textContent}" overflows its phone row`)
    }
  }
}

/* A German compound, an unbroken URL, CJK and 7-digit amounts: the table scrolls inside its own
   region, and the phone rows wrap. */
export const LongContent: Story = {
  args: { ...args, rows: longRows },
  play: ({ canvasElement }) => checkNoOverflow(canvasElement),
}

export const LongContentPhone: Story = { ...LongContent, globals: phoneGlobals }

/* Twenty-five rows, as a full page of results. */
export const ManyRows: Story = {
  args: {
    ...args,
    rows: Array.from({ length: 25 }, (_, index) => {
      const row = rows[index % rows.length] as Order
      return { ...row, id: `SO-${2201 + index}` }
    }),
    summary: '25 of 140 orders',
  },
  play: ({ canvasElement }) => {
    if (canvasElement.querySelectorAll('tbody tr').length !== 25) {
      throw new Error('Expected 25 table rows')
    }
  },
}

/* A single row keeps the table frame and the summary. */
export const OneRow: Story = {
  args: { ...args, rows: rows.slice(0, 1), summary: '1 order' },
  play: ({ canvasElement }) => {
    if (canvasElement.querySelectorAll('tbody tr').length !== 1) {
      throw new Error('Expected one table row')
    }
  },
}

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

/* Sort header states for the visual baseline: Customer hovered, Total focused from the keyboard. */
export const SortHeaderStates: Story = {
  args,
  parameters: {
    visualState: {
      focusVisible: 'th[aria-sort="descending"] button',
      hover: 'th:nth-child(2) button',
    },
  },
  render: () => <SortedAndPagedDemo />,
}

/* Loading: placeholder rows announced as a status, in place of the table and the phone list. */
export const Loading: Story = {
  args: { ...args, loading: true, summary: 'Loading orders' },
  play: async ({ canvasElement }) => {
    const status = canvasElement.querySelector('[role="status"][aria-label="Loading"]')
    if (!status) throw new Error('Expected a status named "Loading"')
    if (canvasElement.querySelector('table')) throw new Error('Expected no table while loading')
  },
}

export const LoadingPhone: Story = { ...Loading, globals: phoneGlobals }

/* A failed load: the error replaces the rows and offers a retry. */
export const LoadError: Story = {
  args: {
    ...args,
    error: {
      description: 'The orders could not be loaded. Check your connection and try again.',
      onRetry: () => {},
      title: 'Orders did not load',
    },
    summary: 'Orders unavailable',
  },
  play: async ({ canvasElement }) => {
    const alert = canvasElement.querySelector('[role="alert"]')
    if (!alert?.textContent?.includes('Orders did not load')) throw new Error('Expected the error')
    const retry = [...alert.querySelectorAll('button')].find(b => b.textContent === 'Try again')
    if (!retry) throw new Error('Expected a "Try again" button')
  },
}

export const LoadErrorPhone: Story = { ...LoadError, globals: phoneGlobals }

/* The open record is marked in both layouts, and exposed as aria-current: the table row and the
   phone item. */
export const Selected: Story = {
  args: { ...args, selectedRowKey: 'SO-2202' },
  play: async ({ canvasElement }) => {
    const selected = canvasElement.querySelectorAll('ul > li[data-selected][aria-current="true"]')
    if (selected.length !== 1 || !selected[0]?.textContent?.includes('SO-2202')) {
      throw new Error('Expected the SO-2202 phone row marked selected and current')
    }
    const row = canvasElement.querySelector('tr[data-state="selected"][aria-current="true"]')
    if (!row?.textContent?.includes('SO-2202')) {
      throw new Error('Expected the SO-2202 table row marked selected and current')
    }
    if (canvasElement.querySelectorAll('[aria-current]').length !== 2) {
      throw new Error('Expected aria-current on the selected record only')
    }
  },
}

export const SelectedPhone: Story = { ...Selected, globals: phoneGlobals }

const rtlColumns: readonly DataTableColumn<Order>[] = [
  { cell: row => row.id, header: 'الطلب', key: 'id' },
  { cell: row => row.customer, header: 'العميل', key: 'customer' },
  { align: 'end', cell: row => row.total, header: 'الإجمالي', key: 'total' },
]

/* Right to left, with the row-actions header localised through actionsLabel. */
export const RightToLeft: Story = {
  args: {
    ...args,
    actionsLabel: 'الإجراءات',
    columns: rtlColumns,
    label: 'الطلبات',
    summary: '3 طلبات',
  },
  render: props => (
    <UIProvider dir="rtl" lang="ar">
      <DataTableSection {...props} />
    </UIProvider>
  ),
  play: async ({ canvasElement }) => {
    const header = canvasElement.querySelector('th .sr-only')
    if (header?.textContent !== 'الإجراءات')
      throw new Error('Expected the localised actions header')
    const cells = canvasElement.querySelectorAll<HTMLElement>('tbody tr:first-child td')
    const first = cells[0]?.getBoundingClientRect()
    const last = cells[cells.length - 1]?.getBoundingClientRect()
    if (!first || !last || first.left < last.left) {
      throw new Error('Expected the first column on the right under dir="rtl"')
    }
  },
}
