'use client'

import {
  type TableSize,
  type TableSizeAlias,
  type TableStickyEdge,
  type TableTone,
  type TableVariant,
  tableContract,
} from '@atom63/ui-foundation'
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import { createContext, useContext } from 'react'
import type * as React from 'react'

import { cn } from '../../lib/cn'
import { Button } from '../button'

/** The direction a sorted column is in, named as `aria-sort` names it. */
export type TableSortDirection = 'ascending' | 'descending'

/** The column the table is sorted by. The caller sorts the rows; the table only shows it. */
export interface TableSort {
  column: string
  direction: TableSortDirection
}

interface TableSortContextValue {
  onSortChange?: (sort: TableSort) => void
  sort?: TableSort | null
}

const TableSortContext = createContext<TableSortContextValue>({})

/* Table — the tabular-data set. Faithful port of prod @atom63/ui Table: a
   horizontally scrollable container wrapping a semantic <table> with header /
   body / footer / row / head / cell / caption parts. Each part carries its
   data-slot; the base look is DS-tokenized, and a `frame` ancestor
   (data-slot="frame") switches on the bordered-card treatment. `size`, `tone`
   and `variant` sit on the container; `sticky` pins a head or body cell to an
   inline edge while the container scrolls. */

export type TableProps = React.ComponentProps<'table'> & {
  /** `'default'` is a deprecated alias of `'md'`. */
  size?: TableSize | TableSizeAlias
  /**
   * How selected rows (`data-state="selected"`) are coloured. `neutral` (the
   * default) is a muted fill with primary text; `accent` is a light primary wash
   * with accent text.
   */
  tone?: TableTone
  variant?: TableVariant
  /** The column the rows are sorted by (controlled), shown by the `TableHead` whose `sortKey`
   *  matches. `null` or omitted: no column is sorted. */
  sort?: TableSort | null
  /** Called when a sortable `TableHead` is pressed, with the sort to apply. Sort the rows and
   *  pass the new value back as `sort`. */
  onSortChange?: (sort: TableSort) => void
}

export function Table({
  className,
  onSortChange,
  size = tableContract.defaultSize,
  sort,
  tone = tableContract.defaultTone,
  variant = tableContract.defaultVariant,
  ...props
}: TableProps): React.ReactElement {
  return (
    <TableSortContext.Provider value={{ onSortChange, sort }}>
      <div
        className="a63-Table-container"
        data-size={size === 'default' ? 'md' : size}
        data-slot="table-container"
        data-tone={tone}
        data-variant={variant}
      >
        <table className={cn('a63-Table', className)} data-slot="table" {...props} />
      </div>
    </TableSortContext.Provider>
  )
}

export type TableHeaderProps = React.ComponentProps<'thead'>

export function TableHeader({ className, ...props }: TableHeaderProps): React.ReactElement {
  return <thead className={cn('a63-Table-header', className)} data-slot="table-header" {...props} />
}

export type TableBodyProps = React.ComponentProps<'tbody'>

export function TableBody({ className, ...props }: TableBodyProps): React.ReactElement {
  return <tbody className={cn('a63-Table-body', className)} data-slot="table-body" {...props} />
}

export type TableFooterProps = React.ComponentProps<'tfoot'>

export function TableFooter({ className, ...props }: TableFooterProps): React.ReactElement {
  return <tfoot className={cn('a63-Table-footer', className)} data-slot="table-footer" {...props} />
}

export type TableRowProps = React.ComponentProps<'tr'>

export function TableRow({ className, ...props }: TableRowProps): React.ReactElement {
  return <tr className={cn('a63-Table-row', className)} data-slot="table-row" {...props} />
}

export type TableHeadProps = React.ComponentProps<'th'> & {
  sticky?: TableStickyEdge
  /** Makes the column sortable: the header becomes a button that calls the Table's
   *  `onSortChange` with this key, and the cell carries `aria-sort` while the Table's
   *  `sort.column` is this key. */
  sortKey?: string
  /** The direction a first press sorts in. Later presses flip it. */
  firstSortDirection?: TableSortDirection
  /** Replaces the sort icon. Receives the column's direction, or `none` while it is not sorted. */
  sortIcon?: (direction: TableSortDirection | 'none') => React.ReactNode
}

function defaultSortIcon(direction: TableSortDirection | 'none'): React.ReactNode {
  if (direction === 'ascending') return <ArrowUp aria-hidden />
  if (direction === 'descending') return <ArrowDown aria-hidden />
  return <ArrowUpDown aria-hidden />
}

export function TableHead({
  children,
  className,
  firstSortDirection = 'ascending',
  sortIcon = defaultSortIcon,
  sortKey,
  sticky,
  ...props
}: TableHeadProps): React.ReactElement {
  const { onSortChange, sort } = useContext(TableSortContext)
  const direction = sortKey !== undefined && sort?.column === sortKey ? sort.direction : undefined
  return (
    <th
      aria-sort={direction}
      className={cn('a63-Table-head', className)}
      data-slot="table-head"
      data-sticky={sticky}
      {...props}
    >
      {sortKey === undefined ? (
        children
      ) : (
        <Button
          className="a63-Table-sort-button"
          data-slot="table-sort-button"
          onClick={() =>
            onSortChange?.({
              column: sortKey,
              direction:
                direction === undefined
                  ? firstSortDirection
                  : direction === 'ascending'
                    ? 'descending'
                    : 'ascending',
            })
          }
          size="xs"
          tone="muted"
          variant="ghost"
        >
          {children}
          {sortIcon(direction ?? 'none')}
        </Button>
      )}
    </th>
  )
}

export type TableCellProps = React.ComponentProps<'td'> & {
  sticky?: TableStickyEdge
}

export function TableCell({ className, sticky, ...props }: TableCellProps): React.ReactElement {
  return (
    <td
      className={cn('a63-Table-cell', className)}
      data-slot="table-cell"
      data-sticky={sticky}
      {...props}
    />
  )
}

export type TableCaptionProps = React.ComponentProps<'caption'>

export function TableCaption({ className, ...props }: TableCaptionProps): React.ReactElement {
  return (
    <caption className={cn('a63-Table-caption', className)} data-slot="table-caption" {...props} />
  )
}
