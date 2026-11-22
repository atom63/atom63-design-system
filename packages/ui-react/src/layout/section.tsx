import type { ComponentPropsWithRef, ReactNode } from 'react'
import { cn } from '../lib/cn'

export interface SectionProps extends Omit<ComponentPropsWithRef<'section'>, 'children'> {
  children: ReactNode
  /**
   * Spaces direct children with a flex gap sized by `spacing`.
   * @default true
   */
  gap?: boolean
  /**
   * Drops the top padding at every breakpoint, for a section that follows another.
   * @default true
   */
  removeTopSpacing?: boolean
  /** @default 'default' */
  spacing?: 'tight' | 'default' | 'loose' | 'generous' | 'spacious'
}

const paddingClasses = {
  tight: 'py-8',
  default: 'py-16',
  loose: 'py-16 md:py-20',
  generous: 'py-20 sm:py-28 md:py-32',
  spacious: 'py-24 sm:py-32 md:py-40',
}

const gapClasses = {
  tight: 'gap-4',
  default: 'gap-6',
  loose: 'gap-8',
  generous: 'gap-6',
  spacious: 'gap-8',
}

/**
 * A page region: renders `<section>` with a spacing preset. Name the region
 * with `aria-labelledby` pointing at its heading (or `aria-label`), so it is
 * exposed as a region landmark; other props and the ref go to the element.
 */
export function Section({
  children,
  className,
  spacing = 'default',
  removeTopSpacing = true,
  gap = true,
  ...props
}: SectionProps) {
  return (
    <section
      {...props}
      className={cn(
        paddingClasses[spacing],
        gap && ['flex flex-col', gapClasses[spacing]],
        removeTopSpacing && 'pt-0 md:pt-0',
        className
      )}
      data-slot="section"
    >
      {children}
    </section>
  )
}
