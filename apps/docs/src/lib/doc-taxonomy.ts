/**
 * Pure doc taxonomy — no `import.meta.glob`, so the Vite config can import it
 * when generating `llms.txt` and the markdown twins.
 */

export type DocAreaId = 'architecture' | 'foundations' | 'themes' | 'components' | 'patterns'

export type LegacyDocAreaId = 'system'

export type DocNavDomainId = 'system' | 'components'

export type PageSection = 'architecture' | 'component' | 'foundation' | 'pattern' | 'theme'

/** Nav label when slug-based inference is wrong. */
export const NAV_LABEL_OVERRIDES: Record<string, string> = {
  'component-overview': 'Overview',
  'foundation-z-index': 'Z-index',
  icon: 'Icons',
  'pattern-layout': 'Page layout',
  'pattern-agent': 'Agent runtime',
}

export const SECTION_ORDER: Partial<Record<PageSection, string[]>> = {
  architecture: ['architecture-overview', 'architecture-appearance-ui', 'architecture-changelog'],
  component: ['component-overview', 'component-contract'],
  foundation: [
    'foundation-personalization',
    'foundation-designing-in-code',
    'foundation-colors',
    'foundation-surface-model',
    'foundation-typography',
    'foundation-radius',
    'foundation-effects',
    'foundation-z-index',
    'foundation-motion',
    'foundation-interaction-states',
  ],
  pattern: [
    'pattern-layout',
    'pattern-section-header',
    'pattern-local-layout',
    'pattern-inform',
    'pattern-agent',
    'pattern-widgets',
  ],
  theme: ['theme-overview', 'theme-system'],
}

export const DOC_AREA_DEFAULTS: Record<DocAreaId, string> = {
  architecture: 'architecture-overview',
  components: 'component-overview',
  foundations: 'foundation-designing-in-code',
  patterns: 'pattern-layout',
  themes: 'theme-overview',
}

export const DOC_AREA_LABELS: Record<DocAreaId, string> = {
  architecture: 'Architecture',
  components: 'Components',
  foundations: 'Foundations',
  patterns: 'Patterns',
  themes: 'Themes',
}

export const DOC_AREA_SECTIONS = {
  architecture: [['architecture', 'Architecture']],
  components: [['component', 'Components']],
  foundations: [['foundation', 'Foundations']],
  patterns: [['pattern', 'Patterns']],
  themes: [['theme', 'Theme architecture']],
} as const satisfies Record<DocAreaId, ReadonlyArray<readonly [PageSection, string]>>

export const DOC_AREA_IDS = [
  'architecture',
  'foundations',
  'themes',
  'components',
  'patterns',
] as const

export type DocNavDomain = {
  areaIds: readonly DocAreaId[]
  defaultArea: DocAreaId
  id: DocNavDomainId
  label: string
}

export const DOC_NAV_DOMAIN_IDS = ['system', 'components'] as const

export const DOC_NAV_DOMAINS: Record<DocNavDomainId, DocNavDomain> = {
  components: {
    areaIds: ['components'],
    defaultArea: 'components',
    id: 'components',
    label: 'Components',
  },
  system: {
    areaIds: ['architecture', 'foundations', 'themes', 'patterns'],
    defaultArea: 'architecture',
    id: 'system',
    label: 'System',
  },
}

export const DOC_AREA_NAV_DOMAINS: Record<DocAreaId, DocNavDomainId> = {
  architecture: 'system',
  components: 'components',
  foundations: 'system',
  patterns: 'system',
  themes: 'system',
}

export const LEGACY_DOC_AREA_DEFAULTS: Record<LegacyDocAreaId, string> = {
  system: 'home',
}

export const LEGACY_DOC_SLUG_ALIASES: Record<string, string> = {
  'architecture-component-contract': 'component-contract',
  'architecture-implementation-status': 'foundation-personalization',
  'architecture-theme-system': 'theme-system',
  'theme-button': 'component-button',
  'theme-button-group': 'component-button-group',
  'theme-input': 'component-input',
  'theme-menu-popup': 'component-dropdown-menu',
  'theme-segment-control': 'component-segmented-control',
  'theme-tabs': 'component-tabs',
}

const SECTION_PREFIXES: Array<[string, PageSection]> = [
  ['component-', 'component'],
  ['architecture-', 'architecture'],
  ['foundation-', 'foundation'],
  ['pattern-', 'pattern'],
  ['theme-', 'theme'],
]

function slugToLabel(slug: string): string {
  return slug
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')
}

/** `empty-state` -> `Empty state` */
function humanizeSlug(slug: string): string {
  return slug
    .split('-')
    .map((word, index) => (index === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word))
    .join(' ')
}

export function labelFromSlug(slug: string): string {
  const override = NAV_LABEL_OVERRIDES[slug]
  if (override) {
    return override
  }

  for (const [prefix] of SECTION_PREFIXES) {
    if (slug.startsWith(prefix)) {
      return humanizeSlug(slug.slice(prefix.length))
    }
  }

  return slugToLabel(slug)
}

export function parsePageSection(slug: string): PageSection | null {
  if (slug === 'home') {
    return null
  }

  for (const [prefix, section] of SECTION_PREFIXES) {
    if (slug.startsWith(prefix)) {
      return section
    }
  }

  return null
}

export function areaForSection(section: PageSection | null): DocAreaId {
  switch (section) {
    case 'architecture':
      return 'architecture'
    case 'foundation':
      return 'foundations'
    case 'theme':
      return 'themes'
    case 'component':
      return 'components'
    case 'pattern':
      return 'patterns'
    default:
      return DEFAULT_DOC_AREA
  }
}

export function areaForSlug(slug: string): DocAreaId {
  return areaForSection(parsePageSection(slug))
}

export function isDocAreaId(value: string | undefined): value is DocAreaId {
  return Boolean(value && (DOC_AREA_IDS as readonly string[]).includes(value))
}

export function navDomainForArea(area: DocAreaId): DocNavDomainId {
  return DOC_AREA_NAV_DOMAINS[area]
}

export function isLegacyDocAreaId(value: string | undefined): value is LegacyDocAreaId {
  return Boolean(value && Object.hasOwn(LEGACY_DOC_AREA_DEFAULTS, value))
}

export const DEFAULT_DOC_AREA: DocAreaId = 'architecture'
export const DEFAULT_DOC_SLUG = 'home'

export function pathForDoc(area: DocAreaId, slug = DOC_AREA_DEFAULTS[area]): string {
  if (slug === DEFAULT_DOC_SLUG) {
    return '/'
  }

  if (slug === DOC_AREA_DEFAULTS[area]) {
    return `/${area}`
  }

  return `/${area}/${slug}`
}

export function sortSlugs(section: PageSection, slugs: string[]): string[] {
  const ordered = SECTION_ORDER[section] ?? []

  return [...slugs].sort((a, b) => {
    const aIndex = ordered.indexOf(a)
    const bIndex = ordered.indexOf(b)

    if (aIndex !== -1 || bIndex !== -1) {
      if (aIndex === -1) return 1
      if (bIndex === -1) return -1
      return aIndex - bIndex
    }

    return labelFromSlug(a).localeCompare(labelFromSlug(b))
  })
}
