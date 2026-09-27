import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@atom63/ui-react'
import { SearchX } from 'lucide-react'
import type { ReactNode } from 'react'

import { EmptyState } from '../empty-state/empty-state'

export const template = {
  id: 'data-table-section',
  kind: 'block',
  title: 'Data table section',
  description:
    'A collection shown as a table on wide screens and as stacked rows on phones, with a live result count, per-row actions and an empty state that offers a way out.',
  category: 'collections',
  tags: ['table', 'list', 'rows', 'responsive', 'empty state', 'results'],
  readiness: 'draft',
} as const

export interface DataTableColumn<Row> {
  /** `end` for numbers and amounts, so digits line up. */
  align?: 'start' | 'end'
  cell: (row: Row) => ReactNode
  header: string
  key: string
}

export interface DataTableEmpty {
  /** The next step, usually a button that clears the filters. */
  action?: ReactNode
  description: string
  title: string
}

export interface DataTableSectionProps<Row> {
  /** Names the table and the phone list for assistive technology. */
  label: string
  /** The first column is the row's title in the phone layout. */
  columns: readonly DataTableColumn<Row>[]
  empty: DataTableEmpty
  getRowKey: (row: Row) => string
  /** Heading level of the empty state's title: one below the heading above the section. */
  headingLevel?: 2 | 3 | 4
  rowActions?: (row: Row) => ReactNode
  rows: readonly Row[]
  /** A short count such as "12 of 25 invoices", announced when it changes. */
  summary: string
}

const alignClass = (align: DataTableColumn<unknown>['align']) =>
  align === 'end' ? 'text-end tabular-nums' : 'text-start'

/*
 * A wide table does not fit a phone, so below `sm` each row becomes a stacked
 * item: the first column is its title and the rest are label and value pairs.
 * Only one layout is displayed at a time; the hidden one is out of the
 * accessibility tree.
 */
export function DataTableSection<Row>({
  columns,
  empty,
  getRowKey,
  headingLevel = 2,
  label,
  rowActions,
  rows,
  summary,
}: DataTableSectionProps<Row>) {
  const [titleColumn, ...detailColumns] = columns
  return (
    <div className="flex flex-col gap-3">
      <p aria-live="polite" className="text-muted-foreground text-sm">
        {summary}
      </p>
      {rows.length === 0 ? (
        <EmptyState
          action={empty.action}
          description={empty.description}
          headingLevel={headingLevel}
          icon={<SearchX aria-hidden />}
          title={empty.title}
        />
      ) : (
        <>
          {/* A `frame` ancestor draws the table as a bordered card, like the phone list. */}
          <div className="hidden sm:block" data-slot="frame">
            <Table aria-label={label}>
              <TableHeader>
                <TableRow>
                  {columns.map(column => (
                    <TableHead className={alignClass(column.align)} key={column.key}>
                      {column.header}
                    </TableHead>
                  ))}
                  {rowActions ? (
                    <TableHead className="w-0">
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  ) : null}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map(row => (
                  <TableRow key={getRowKey(row)}>
                    {columns.map(column => (
                      <TableCell className={alignClass(column.align)} key={column.key}>
                        {column.cell(row)}
                      </TableCell>
                    ))}
                    {rowActions ? (
                      <TableCell className="text-end">{rowActions(row)}</TableCell>
                    ) : null}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <ul
            aria-label={label}
            className="divide-border border-border flex flex-col divide-y rounded-lg border sm:hidden"
          >
            {rows.map(row => (
              <li className="flex items-start gap-3 p-4" key={getRowKey(row)}>
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  {titleColumn ? (
                    <div className="text-foreground font-medium">{titleColumn.cell(row)}</div>
                  ) : null}
                  <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1 text-sm">
                    {detailColumns.map(column => (
                      <div className="contents" key={column.key}>
                        <dt className="text-muted-foreground">{column.header}</dt>
                        <dd className={column.align === 'end' ? 'tabular-nums' : undefined}>
                          {column.cell(row)}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
                {rowActions ? rowActions(row) : null}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
