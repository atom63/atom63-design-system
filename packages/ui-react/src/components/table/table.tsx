import type * as React from 'react'

import { cn } from '../../lib/cn'

/* Table — the tabular-data set. Faithful port of prod @atom63/ui Table: a
   horizontally scrollable container wrapping a semantic <table> with header /
   body / footer / row / head / cell / caption parts. Each part carries its
   data-slot; the base look is DS-tokenized, and a `frame` ancestor
   (data-slot="frame") switches on the bordered-card treatment. */

export type TableProps = React.ComponentProps<'table'>

export function Table({ className, ...props }: TableProps): React.ReactElement {
  return (
    <div className="a63-Table-container" data-slot="table-container">
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

export type TableHeadProps = React.ComponentProps<'th'>

export function TableHead({ className, ...props }: TableHeadProps): React.ReactElement {
  return <th className={cn('a63-Table-head', className)} data-slot="table-head" {...props} />
}

export type TableCellProps = React.ComponentProps<'td'>

export function TableCell({ className, ...props }: TableCellProps): React.ReactElement {
  return <td className={cn('a63-Table-cell', className)} data-slot="table-cell" {...props} />
}

export type TableCaptionProps = React.ComponentProps<'caption'>

export function TableCaption({ className, ...props }: TableCaptionProps): React.ReactElement {
  return (
    <caption className={cn('a63-Table-caption', className)} data-slot="table-caption" {...props} />
  )
}
