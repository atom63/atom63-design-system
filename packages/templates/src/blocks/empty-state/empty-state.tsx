import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@atom63/ui-react'
import type { ReactNode } from 'react'

export const template = {
  id: 'empty-state',
  kind: 'block',
  title: 'Empty state',
  description:
    'Explains why there is nothing here and offers the next step: one primary action, with an optional quieter second one.',
  category: 'feedback',
  tags: ['empty', 'zero state', 'no results', 'onboarding', 'first run'],
  readiness: 'draft',
} as const

export interface EmptyStateProps {
  /** The next step. Keep one; add `secondaryAction` only for a real alternative. */
  action?: ReactNode
  description: string
  /** Heading level for the title, one below the heading the state sits under. */
  headingLevel?: 2 | 3 | 4
  /** A lucide icon element, marked `aria-hidden`. */
  icon: ReactNode
  secondaryAction?: ReactNode
  title: string
}

/*
 * Every empty state says why it is empty and what to do next, so an agent
 * copying it cannot ship a dead end: `action` is optional only for states the
 * person cannot change (a filter-free feed that simply has no news).
 */
export function EmptyState({
  action,
  description,
  headingLevel = 2,
  icon,
  secondaryAction,
  title,
}: EmptyStateProps) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">{icon}</EmptyMedia>
        <EmptyTitle aria-level={headingLevel}>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      {action || secondaryAction ? (
        <EmptyContent>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {action}
            {secondaryAction}
          </div>
        </EmptyContent>
      ) : null}
    </Empty>
  )
}
