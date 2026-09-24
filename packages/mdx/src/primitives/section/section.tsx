import { clsx } from 'clsx'
import type { ReactNode } from 'react'

export type SectionWidth = 'column' | 'wide' | 'bleed'

export type SectionProps = {
  children: ReactNode
  className?: string
  width?: SectionWidth
}

const widthStyles: Record<SectionWidth, string> = {
  column: 'mx-auto w-full max-w-[var(--mdx-measure,42rem)]',
  wide: 'mx-auto w-full max-w-[var(--mdx-measure-wide,72rem)]',
  bleed: 'w-full max-w-none',
}

export function Section({ children, className, width = 'column' }: SectionProps) {
  return (
    <section
      className={clsx(widthStyles[width], className)}
      data-mdx-width={width}
      data-section-width={width}
    >
      {children}
    </section>
  )
}
