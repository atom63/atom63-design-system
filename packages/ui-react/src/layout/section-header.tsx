import type { ReactNode } from 'react'
import { cn } from '../lib/cn'

/** Typography for index-style page heroes (projects, resources, …). */
export const pageIndexHeroTitleClassName =
  'text-balance font-secondary text-4xl tracking-tight md:text-6xl'

export const pageIndexHeroDescriptionClassName = 'text-lg'

export type SectionHeaderLevel = 1 | 2 | 3 | 4 | 5 | 6
export type SectionHeaderVariant =
  'display' | 'primary' | 'secondary' | 'muted' | 'subtle' | 'label'

/**
 * Inline alignment. `start` and `end` follow the writing direction, so `end` is
 * on the left under `dir="rtl"`. `left` and `right` are deprecated aliases of
 * `start` and `end`.
 */
export type SectionHeaderAlign = 'start' | 'center' | 'end' | 'left' | 'right'

export interface SectionHeaderProps {
  /** @default 'start' */
  align?: SectionHeaderAlign
  className?: string
  /** Text or inline content (a link, a count) under the title. */
  description?: ReactNode
  descriptionClassName?: string
  /**
   * Semantic heading level for the title. Visual scale is still controlled by
   * `variant`; use this when the surrounding page hierarchy needs a different
   * heading level than the variant default.
   */
  level?: SectionHeaderLevel
  /** Text or inline content (a badge, a count); the heading element stays the title's. */
  title: ReactNode
  titleClassName?: string
  /** The title element's id, for a `Section`'s `aria-labelledby`. */
  titleId?: string
  variant?: SectionHeaderVariant
}

const headingTags: Record<SectionHeaderLevel, 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'> = {
  1: 'h1',
  2: 'h2',
  3: 'h3',
  4: 'h4',
  5: 'h5',
  6: 'h6',
} as const

type SectionHeaderVariantConfig = {
  DescTag: 'p'
  defaultLevel?: SectionHeaderLevel
  descClass: string
  titleClass: string
}

export function SectionHeader({
  title,
  description,
  className,
  titleClassName,
  descriptionClassName,
  level,
  titleId,
  variant = 'primary',
  align: alignProp = 'start',
}: SectionHeaderProps) {
  const variantConfig = {
    display: {
      DescTag: 'p' as const,
      titleClass:
        'max-w-3xl text-balance font-heading font-semibold text-5xl leading-none md:text-6xl',
      descClass:
        'mt-4 max-w-2xl text-balance text-lg text-muted-foreground leading-relaxed md:text-xl',
      defaultLevel: 1,
    },
    primary: {
      DescTag: 'p' as const,
      titleClass: 'max-w-2xl text-balance font-heading font-semibold text-3xl leading-tight',
      descClass: 'mt-2 max-w-2xl text-balance text-muted-foreground text-base leading-7',
      defaultLevel: 1,
    },
    secondary: {
      DescTag: 'p' as const,
      titleClass: 'max-w-2xl text-balance font-heading font-semibold text-2xl leading-tight',
      descClass: 'mt-2 max-w-xl text-balance text-muted-foreground text-sm leading-6',
      defaultLevel: 2,
    },
    muted: {
      DescTag: 'p' as const,
      titleClass: 'max-w-xl text-balance font-heading font-medium text-lg leading-snug',
      descClass: 'mt-1.5 max-w-lg text-balance text-muted-foreground text-sm leading-6',
      defaultLevel: 3,
    },
    subtle: {
      DescTag: 'p' as const,
      titleClass: 'max-w-lg text-balance font-medium text-base leading-snug text-foreground',
      descClass: 'mt-1 max-w-md text-balance text-muted-foreground text-sm leading-5',
      defaultLevel: 4,
    },
    label: {
      DescTag: 'p' as const,
      // Letter-spacing pulls CJK glyphs apart, so those languages keep normal tracking.
      titleClass:
        'font-medium text-muted-foreground text-xs uppercase tracking-[0.16em] [&:lang(ja)]:tracking-normal [&:lang(ko)]:tracking-normal [&:lang(zh)]:tracking-normal',
      descClass: 'mt-1 max-w-md text-balance text-muted-foreground text-sm leading-5',
      defaultLevel: undefined,
    },
  } satisfies Record<SectionHeaderVariant, SectionHeaderVariantConfig>

  const { DescTag, titleClass, descClass, defaultLevel } = variantConfig[variant]
  const titleLevel = level ?? defaultLevel
  const TitleTag = titleLevel ? headingTags[titleLevel] : 'p'

  const align = alignProp === 'left' ? 'start' : alignProp === 'right' ? 'end' : alignProp
  const alignClasses = {
    center: 'mx-auto text-center',
    end: 'ms-auto text-end',
    start: '',
  }

  return (
    <div
      className={cn(align === 'center' && 'text-center', align === 'end' && 'text-end', className)}
      data-slot="section-header"
    >
      <TitleTag className={cn(titleClass, alignClasses[align], titleClassName)} id={titleId}>
        {title}
      </TitleTag>
      {description ? (
        <DescTag className={cn(descClass, alignClasses[align], descriptionClassName)}>
          {description}
        </DescTag>
      ) : null}
    </div>
  )
}
