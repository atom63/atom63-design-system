import {
  Button,
  Field,
  FieldLabel,
  Input,
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from '@atom63/ui-react'
import { useId } from 'react'

export const template = {
  id: 'filter-bar',
  kind: 'block',
  title: 'Filter bar',
  description:
    'A labelled search field and one select filter above a collection, with a clear action that appears once a filter is set.',
  category: 'collections',
  tags: ['search', 'filter', 'toolbar', 'list', 'table'],
  readiness: 'ready',
} as const

export interface FilterBarOption {
  label: string
  value: string
}

export interface FilterBarProps {
  /** Shown as the filter's visible label, for example "Status". */
  filterLabel: string
  filterOptions: readonly FilterBarOption[]
  filterValue: string
  onClear: () => void
  onFilterChange: (value: string) => void
  onQueryChange: (query: string) => void
  query: string
  /** Shown as the search field's visible label, for example "Search invoices". */
  searchLabel: string
  searchPlaceholder?: string
  /** Whether any filter differs from its default; shows the clear action. */
  showClear: boolean
}

/*
 * Controls stack on a phone and sit on one row from `sm`, the search taking
 * the remaining width. Both fields keep a
 * visible label, the row is a search landmark, and the clear action is a
 * ghost button so the page's primary action stays the only strong one.
 */
export function FilterBar({
  filterLabel,
  filterOptions,
  filterValue,
  onClear,
  onFilterChange,
  onQueryChange,
  query,
  searchLabel,
  searchPlaceholder,
  showClear,
}: FilterBarProps) {
  const searchId = useId()
  const filterLabelId = useId()
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end" role="search">
      <Field className="sm:flex-1">
        <FieldLabel htmlFor={searchId}>{searchLabel}</FieldLabel>
        <Input
          id={searchId}
          onChange={event => onQueryChange(event.target.value)}
          placeholder={searchPlaceholder}
          type="search"
          value={query}
        />
      </Field>
      <Field className="sm:w-48">
        <FieldLabel id={filterLabelId}>{filterLabel}</FieldLabel>
        <Select
          items={filterOptions}
          onValueChange={next => onFilterChange(next ?? filterOptions[0]?.value ?? '')}
          value={filterValue}
        >
          <SelectTrigger aria-labelledby={filterLabelId}>
            <SelectValue />
          </SelectTrigger>
          <SelectPopup>
            {filterOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectPopup>
        </Select>
      </Field>
      {showClear ? (
        <Button onClick={onClear} variant="ghost">
          Clear filters
        </Button>
      ) : null}
    </div>
  )
}
