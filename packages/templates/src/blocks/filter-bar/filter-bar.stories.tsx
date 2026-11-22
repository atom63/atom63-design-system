import { UIProvider } from '@atom63/ui-react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import {
  inMain,
  landmarkParameters,
  phoneGlobals,
  ThemeMatrix,
  themeMatrixParameters,
} from '../../story-matrix'
import { FilterBar } from './filter-bar'

const options = [
  { label: 'All statuses', value: 'all' },
  { label: 'Paid', value: 'paid' },
  { label: 'Open', value: 'open' },
]

function Demo({
  clearLabel,
  filterLabel = 'Status',
  filterOptions = options,
  initialQuery = '',
  searchLabel = 'Search invoices',
  searchPlaceholder = 'Invoice number or customer',
}: {
  clearLabel?: string
  filterLabel?: string
  filterOptions?: typeof options
  initialQuery?: string
  searchLabel?: string
  searchPlaceholder?: string
}) {
  const [query, setQuery] = useState(initialQuery)
  const [status, setStatus] = useState('all')
  return (
    <FilterBar
      clearLabel={clearLabel}
      filterLabel={filterLabel}
      filterOptions={filterOptions}
      filterValue={status}
      onClear={() => {
        setQuery('')
        setStatus('all')
      }}
      onFilterChange={setStatus}
      onQueryChange={setQuery}
      query={query}
      searchLabel={searchLabel}
      searchPlaceholder={searchPlaceholder}
      showClear={query !== '' || status !== 'all'}
    />
  )
}

const meta = {
  title: 'Templates/Blocks/Filter bar',
  component: Demo,
  parameters: landmarkParameters,
  decorators: [inMain],
} satisfies Meta<typeof Demo>

export default meta

type Story = StoryObj<typeof meta>

export const Desktop: Story = {}

/* With a query set, so the clear action shows. */
export const Filtered: Story = { args: { initialQuery: 'Northwind' } }

export const Phone: Story = { args: { initialQuery: 'Northwind' }, globals: phoneGlobals }

export const Themes: Story = {
  parameters: themeMatrixParameters,
  render: () => (
    <ThemeMatrix>
      <Demo initialQuery="Northwind" />
    </ThemeMatrix>
  ),
}

/* Clearing with the keyboard: the clear button leaves, and focus moves to the search field. */
export const ClearWithKeyboard: Story = {
  args: { initialQuery: 'Northwind' },
  play: async ({ canvas, userEvent }) => {
    const clear = canvas.getByRole('button', { name: 'Clear filters' })
    clear.focus()
    await userEvent.keyboard('{Enter}')
    const search = canvas.getByRole('searchbox', { name: 'Search invoices' })
    if (canvas.queryByRole('button', { name: 'Clear filters' })) {
      throw new Error('Expected the clear button to leave once nothing is filtered')
    }
    if (search.ownerDocument.activeElement !== search) {
      throw new Error('Expected focus on the search field after clearing')
    }
  },
}

const arabicOptions = [
  { label: 'كل الحالات', value: 'all' },
  { label: 'مدفوعة', value: 'paid' },
  { label: 'مفتوحة', value: 'open' },
]

/* Right to left, with every string localised, the clear label included. */
export const RightToLeft: Story = {
  args: {
    clearLabel: 'مسح عوامل التصفية',
    filterLabel: 'الحالة',
    filterOptions: arabicOptions,
    initialQuery: 'نورثويند',
    searchLabel: 'البحث في الفواتير',
    searchPlaceholder: 'رقم الفاتورة أو العميل',
  },
  decorators: [
    Story => (
      <UIProvider dir="rtl" lang="ar">
        <Story />
      </UIProvider>
    ),
  ],
  play: async ({ canvas }) => {
    canvas.getByRole('button', { name: 'مسح عوامل التصفية' })
    const search = canvas.getByRole('searchbox').getBoundingClientRect()
    const clear = canvas.getByRole('button', { name: 'مسح عوامل التصفية' }).getBoundingClientRect()
    if (search.left < clear.left) throw new Error('Expected the search field at the right edge')
  },
}
