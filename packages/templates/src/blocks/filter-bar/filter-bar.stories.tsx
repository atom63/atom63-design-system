import { UIProvider } from '@atom63/ui-react'
import type { Meta, StoryObj } from '@storybook/react-vite'
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
  initialStatus = 'all',
  searchLabel = 'Search invoices',
  searchPlaceholder = 'Invoice number or customer',
}: {
  clearLabel?: string
  filterLabel?: string
  filterOptions?: typeof options
  initialQuery?: string
  initialStatus?: string
  searchLabel?: string
  searchPlaceholder?: string
}) {
  const [query, setQuery] = useState(initialQuery)
  const [status, setStatus] = useState(initialStatus)
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

export const Tablet: Story = { args: { initialQuery: 'Northwind' }, globals: tabletGlobals }

export const Wide: Story = { args: { initialQuery: 'Northwind' }, globals: wideGlobals }

/* The search field focused from the keyboard. */
export const FieldFocusVisible: Story = {
  args: { initialQuery: 'Northwind' },
  parameters: { visualState: { focusVisible: 'input[type="search"]' } },
}

/* The status filter open, its options listed under the trigger. The popup is portalled to the
   body, outside the story's landmarks, as in a product, so axe's region rule is off here only. */
export const SelectOpen: Story = {
  args: { initialQuery: 'Northwind' },
  parameters: {
    a11y: {
      config: {
        rules: [
          { id: 'region', enabled: false },
          { id: 'label-content-name-mismatch', enabled: true },
        ],
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('combobox', { name: 'Status' }))
    // The popup is portalled outside the canvas.
    await new Promise(resolve => setTimeout(resolve, 300))
    if (document.querySelectorAll('[role="option"]').length !== options.length) {
      throw new Error('Expected the status options to open')
    }
  },
}

const longOptions = [
  { label: 'All statuses', value: 'all' },
  { label: 'Überfällig seit mehr als dreißig Tagen', value: 'overdue' },
  { label: 'Paid', value: 'paid' },
]

/* Nothing in the bar overflows it, and the clear action keeps its full label. */
const checkBarFits = (canvasElement: HTMLElement) => {
  const bar = canvasElement.querySelector<HTMLElement>('[role="search"]')
  if (!bar) throw new Error('Expected the search landmark')
  const box = bar.getBoundingClientRect()
  for (const child of bar.children) {
    const rect = child.getBoundingClientRect()
    if (rect.left < box.left - 1 || rect.right > box.right + 1) {
      throw new Error(`"${child.textContent}" overflows the filter bar`)
    }
  }
  const clear = bar.querySelector<HTMLElement>('button:not([role="combobox"])')
  if (clear && clear.scrollWidth > clear.clientWidth + 1) {
    throw new Error('The clear label is cut off')
  }
}

/* German labels and a 38-character option selected: the select grows up to 20rem. */
export const LongLabelsTablet: Story = {
  args: {
    clearLabel: 'Alle Filter zurücksetzen',
    filterLabel: 'Zahlungsstatus der Rechnung',
    filterOptions: longOptions,
    initialQuery: 'Northwind',
    initialStatus: 'overdue',
    searchLabel: 'Rechnungen nach Nummer oder Kundenname durchsuchen',
    searchPlaceholder: 'Rechnungsnummer oder Kunde',
  },
  globals: tabletGlobals,
  play: ({ canvasElement }) => checkBarFits(canvasElement),
}

export const LongLabelsPhone: Story = { ...LongLabelsTablet, globals: phoneGlobals }

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
