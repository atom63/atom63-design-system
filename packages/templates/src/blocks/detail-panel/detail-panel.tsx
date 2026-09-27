import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetPanel,
  SheetTitle,
} from '@atom63/ui-react'
import type { ReactNode } from 'react'

export const template = {
  id: 'detail-panel',
  kind: 'block',
  title: 'Detail panel',
  description:
    "One record's fields in a side sheet over its list, with the record's actions in the footer, so people inspect a row without losing their place.",
  category: 'collections',
  tags: ['detail', 'inspector', 'side panel', 'sheet', 'record', 'view'],
  readiness: 'draft',
} as const

export interface DetailField {
  label: string
  value: ReactNode
}

export interface DetailPanelProps {
  /** The record's actions; one `primary`, the rest `outline`. */
  actions?: ReactNode
  description?: string
  fields: readonly DetailField[]
  onOpenChange: (open: boolean) => void
  open: boolean
  title: string
}

/* Controlled by the list: the page owns which row is open. */
export function DetailPanel({
  actions,
  description,
  fields,
  onOpenChange,
  open,
  title,
}: DetailPanelProps) {
  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          {description ? <SheetDescription>{description}</SheetDescription> : null}
        </SheetHeader>
        <SheetPanel>
          <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-6 gap-y-3 text-sm">
            {fields.map(field => (
              <div className="contents" key={field.label}>
                <dt className="text-muted-foreground">{field.label}</dt>
                <dd className="text-foreground">{field.value}</dd>
              </div>
            ))}
          </dl>
        </SheetPanel>
        {actions ? <SheetFooter>{actions}</SheetFooter> : null}
      </SheetContent>
    </Sheet>
  )
}
