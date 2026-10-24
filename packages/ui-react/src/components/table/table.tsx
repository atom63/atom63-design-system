import {
  type TableSize,
  type TableStickyEdge,
  type TableVariant,
  tableContract,
} from '@atom63/ui-foundation'
import type * as React from 'react'

import { cn } from '../../lib/cn'

/* Table — the tabular-data set. Faithful port of prod @atom63/ui Table: a
   horizontally scrollable container wrapping a semantic <table> with header /
   body / footer / row / head / cell / caption parts. Each part carries its
   data-slot; the base look is DS-tokenized, and a `frame` ancestor
   (data-slot="frame") switches on the bordered-card treatment. `size` and
   `variant` sit on the container; `sticky` pins a head or body cell to an
   inline edge while the container scrolls. */

export type TableProps = React.ComponentProps<'table'> & {
  size?: TableSize
  variant?: TableVariant
}

export function Table({
  className,
  size = tableContract.defaultSize,
  variant = tableContract.defaultVariant,
  ...props
}: TableProps): React.ReactElement {
  return (
    <div
      className="a63-Table-container"
      data-size={size}
      data-slot="table-container"
      data-variant={variant}
    >
      <table className={cn('a63-Table', className)} data-slot="table" {...props} />
    </div>
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
}

export function TableHead({ className, sticky, ...props }: TableHeadProps): React.ReactElement {
  return (
    <th
      className={cn('a63-Table-head', className)}
      data-slot="table-head"
      data-sticky={sticky}
      {...props}
    />
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
