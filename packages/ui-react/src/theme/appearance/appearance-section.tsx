import type { ReactNode } from 'react'

export interface AppearanceSectionProps {
  children: ReactNode
  title: string
}

/* A labelled personalization section: a title over its control. */
export function AppearanceSection({ children, title }: AppearanceSectionProps) {
  return (
    <section className="min-w-0 space-y-2" data-slot="appearance-section">
      <span className="block text-sm font-medium text-[var(--a63-text-primary)]">{title}</span>
      {children}
    </section>
  )
}
