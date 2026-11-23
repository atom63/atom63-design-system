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
import { createContext, useContext, useEffect, useRef, useState } from 'react'
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
   * How selected rows (`TableRow selected`) are coloured. `neutral` (the
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
  const containerRef = useRef<HTMLDivElement>(null)
  const [overflowing, setOverflowing] = useState(false)
  const [captionText, setCaptionText] = useState<string>()
  useEffect(() => {
    const container = containerRef.current
    if (!container || typeof ResizeObserver === 'undefined') return
    const measure = () => {
      setOverflowing(container.scrollWidth > container.clientWidth + 1)
      setCaptionText(container.querySelector('caption')?.textContent?.trim() || undefined)
    }
    const observer = new ResizeObserver(measure)
    observer.observe(container)
    if (container.firstElementChild) observer.observe(container.firstElementChild)
    measure()
    return () => observer.disconnect()
  }, [])
  // While the table is wider than its container, the scroller joins the tab order as a named
  // region so a keyboard can scroll it (Safari does not make scrollers focusable).
  const scrollerProps: React.ComponentProps<'div'> = overflowing
    ? {
        'aria-label': props['aria-labelledby']
          ? undefined
          : (props['aria-label'] ?? captionText ?? 'Table'),
        'aria-labelledby': props['aria-labelledby'],
        role: 'region',
        tabIndex: 0,
      }
    : {}
  return (
    <TableSortContext.Provider value={{ onSortChange, sort }}>
      <div
        className="a63-Table-container"
        data-overflowing={overflowing ? '' : undefined}
        data-size={size === 'default' ? 'md' : size}
        data-slot="table-container"
        data-tone={tone}
        data-variant={variant}
        ref={containerRef}
        {...scrollerProps}
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

export type TableRowProps = React.ComponentProps<'tr'> & {
  /** Draws the row as selected, in the Table's `tone`. Sets `data-state="selected"`. */
  selected?: boolean
}

export function TableRow({ className, selected, ...props }: TableRowProps): React.ReactElement {
  return (
    <tr
      className={cn('a63-Table-row', className)}
      data-slot="table-row"
      data-state={selected ? 'selected' : undefined}
      {...props}
    />
  )
}

export type TableHeadProps = React.ComponentProps<'th'> & {
  sticky?: TableStickyEdge
  /** Lets the head text wrap onto more lines instead of widening the column. */
  wrap?: boolean
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
  wrap,
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
      data-wrap={wrap ? '' : undefined}
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
  /** Lets long text (a description, a URL, CJK) wrap onto more lines, up to about 40
   *  characters wide, instead of widening the table. Cells stay on one line by default. */
  wrap?: boolean
}

export function TableCell({
  className,
  sticky,
  wrap,
  ...props
}: TableCellProps): React.ReactElement {
  return (
    <td
      className={cn('a63-Table-cell', className)}
      data-slot="table-cell"
      data-sticky={sticky}
      data-wrap={wrap ? '' : undefined}
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
