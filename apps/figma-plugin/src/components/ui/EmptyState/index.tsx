import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@atom63/ui-react'
import type { ReactNode } from 'react'

export interface EmptyStateProps {
  action?: ReactNode
  description?: string
  icon?: ReactNode
  title?: string
}

/** The Atom63 Empty state with an icon, title, description and action. */
export function EmptyState({ action, description, icon, title }: EmptyStateProps) {
  return (
    <Empty>
      <EmptyHeader>
        {icon && <EmptyMedia variant="icon">{icon}</EmptyMedia>}
        {title && <EmptyTitle>{title}</EmptyTitle>}
        {description && <EmptyDescription>{description}</EmptyDescription>}
      </EmptyHeader>
      {action && <EmptyContent>{action}</EmptyContent>}
    </Empty>
  )
}
