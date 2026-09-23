import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@atom63/ui-react'

export type PropsTableRow = {
  defaultValue?: string
  description?: string
  name: string
  type: string
}

type PropsTableProps = {
  rows: PropsTableRow[]
}

export function PropsTable({ rows }: PropsTableProps) {
  if (rows.length === 0) {
    return null
  }

  return (
    <div className="ds-api-table not-prose overflow-hidden rounded-xl border border-border">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[22%] font-mono text-[11px] tracking-wider uppercase">
              Prop
            </TableHead>
            <TableHead className="w-[38%] font-mono text-[11px] tracking-wider uppercase">
              Type
            </TableHead>
            <TableHead className="w-[14%] font-mono text-[11px] tracking-wider uppercase">
              Default
            </TableHead>
            <TableHead className="font-mono text-[11px] tracking-wider uppercase">
              Description
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map(row => (
            <TableRow key={row.name}>
              <TableCell className="align-top font-mono text-xs text-foreground">
                {row.name}
              </TableCell>
              <TableCell className="align-top font-mono text-xs leading-relaxed text-muted-foreground">
                {row.type}
              </TableCell>
              <TableCell className="align-top font-mono text-xs text-muted-foreground">
                {row.defaultValue ?? '—'}
              </TableCell>
              <TableCell className="align-top text-sm leading-relaxed text-muted-foreground">
                {row.description ?? '—'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
