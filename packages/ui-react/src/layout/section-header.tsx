import { cn } from '../lib/cn'

/** Typography for index-style page heroes (projects, resources, …). */
export const pageIndexHeroTitleClassName =
  'text-balance font-secondary text-4xl tracking-tight md:text-6xl'

export const pageIndexHeroDescriptionClassName = 'text-lg'

export type SectionHeaderLevel = 1 | 2 | 3 | 4 | 5 | 6
export type SectionHeaderVariant =
  'display' | 'primary' | 'secondary' | 'muted' | 'subtle' | 'label'

export interface SectionHeaderProps {
  align?: 'left' | 'center' | 'right'
  className?: string
  description?: string
  descriptionClassName?: string
  /**
   * Semantic heading level for the title. Visual scale is still controlled by
   * `variant`; use this when the surrounding page hierarchy needs a different
   * heading level than the variant default.
   */
  level?: SectionHeaderLevel
  title: string
  titleClassName?: string
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
  variant = 'primary',
  align = 'left',
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
      titleClass: 'font-medium text-muted-foreground text-xs uppercase tracking-[0.16em]',
      descClass: 'mt-1 max-w-md text-balance text-muted-foreground text-sm leading-5',
      defaultLevel: undefined,
    },
  } satisfies Record<SectionHeaderVariant, SectionHeaderVariantConfig>

  const { DescTag, titleClass, descClass, defaultLevel } = variantConfig[variant]
  const titleLevel = level ?? defaultLevel
  const TitleTag = titleLevel ? headingTags[titleLevel] : 'p'

  const alignClasses = {
    center: 'mx-auto text-center',
    right: 'ml-auto text-right',
    left: '',
  }

  return (
    <div
      className={cn(
        align === 'center' && 'text-center',
        align === 'right' && 'text-right',
        className
      )}
    >
      <TitleTag className={cn(titleClass, alignClasses[align], titleClassName)}>{title}</TitleTag>
      {description && (
        <DescTag className={cn(descClass, alignClasses[align], descriptionClassName)}>
          {description}
        </DescTag>
      )}
    </div>
  )
}
