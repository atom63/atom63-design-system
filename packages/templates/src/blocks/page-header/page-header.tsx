import { SectionHeader } from '@atom63/ui-react/layout'
import type { ReactNode } from 'react'

export const template = {
  id: 'page-header',
  kind: 'block',
  title: 'Page header',
  description:
    'The page title and a one-line description, with the page-level actions beside them on wide screens and below them on phones.',
  category: 'layout',
  tags: ['title', 'heading', 'actions', 'toolbar'],
  readiness: 'draft',
} as const

export interface PageHeaderProps {
  /** Page-level actions. Keep one `primary` button; the rest are `outline` or `ghost`. */
  actions?: ReactNode
  description?: string
  title: string
}

/*
 * The one h1 of a page. Actions wrap under the title on a phone rather than
 * squeezing it, and stay on the title's start edge so nothing floats.
 */
export function PageHeader({ actions, description, title }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <SectionHeader description={description} level={1} title={title} variant="secondary" />
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  )
}
