import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { phoneGlobals, ThemeMatrix, themeMatrixParameters } from '../../story-matrix'
import { FilterBar } from './filter-bar'

const options = [
  { label: 'All statuses', value: 'all' },
  { label: 'Paid', value: 'paid' },
  { label: 'Open', value: 'open' },
]

function Demo({ initialQuery = '' }: { initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery)
  const [status, setStatus] = useState('all')
  return (
    <FilterBar
      filterLabel="Status"
      filterOptions={options}
      filterValue={status}
      onClear={() => {
        setQuery('')
        setStatus('all')
      }}
      onFilterChange={setStatus}
      onQueryChange={setQuery}
      query={query}
      searchLabel="Search invoices"
      searchPlaceholder="Invoice number or customer"
      showClear={query !== '' || status !== 'all'}
    />
  )
}

const meta = {
  title: 'Templates/Blocks/Filter bar',
  component: Demo,
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
