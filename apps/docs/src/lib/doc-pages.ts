import { type ComponentType, type LazyExoticComponent, lazy } from 'react'
import type { DocAreaId, PageSection } from './doc-taxonomy'
import {
  areaForSection,
  DEFAULT_DOC_AREA,
  DEFAULT_DOC_SLUG,
  DOC_AREA_DEFAULTS,
  DOC_AREA_IDS,
  DOC_AREA_LABELS,
  DOC_AREA_SECTIONS,
  labelFromSlug,
  parsePageSection,
  sortSlugs,
} from './doc-taxonomy'
import {
  componentCatalogGroups,
  componentCatalogItems,
  componentDocSlug,
} from './component-catalog'

type MdxModule = { default: ComponentType }

const pageModules = import.meta.glob<MdxModule>('../pages/*.mdx')
const authoredPageSlugs = new Set(Object.keys(pageModules).map(slugFromPath))

export type { DocAreaId, PageSection }
export {
  areaForSlug,
  DOC_NAV_DOMAIN_IDS,
  DOC_NAV_DOMAINS,
  DOC_AREA_DEFAULTS,
  DOC_AREA_IDS,
  DOC_AREA_LABELS,
  isDocAreaId,
  navDomainForArea,
} from './doc-taxonomy'
export type { DocNavDomainId } from './doc-taxonomy'

export type NavItem = {
  area: DocAreaId
  label: string
  slug: string
}

export type NavSection = {
  title: string
  items: NavItem[]
}

export type DocArea = {
  defaultSlug: string
  id: DocAreaId
  label: string
  sections: NavSection[]
  startLabel: string
}

function slugFromPath(path: string): string {
  return path.replace('../pages/', '').replace(/\.mdx$/, '')
}

export function isAuthoredPageSlug(slug: string): boolean {
  return authoredPageSlugs.has(slug)
}

function buildSectionItems() {
  const buckets: Record<PageSection, NavItem[]> = {
    architecture: [],
    component: [],
    foundation: [],
    pattern: [],
    theme: [],
  }

  for (const path of Object.keys(pageModules)) {
    const slug = slugFromPath(path)
    const section = parsePageSection(slug)
    if (!section) {
      continue
    }

    buckets[section].push({
      area: areaForSection(section),
      label: labelFromSlug(slug),
      slug,
    })
  }

  for (const item of componentCatalogItems) {
    const slug = componentDocSlug(item.slug)
    if (buckets.component.some(candidate => candidate.slug === slug)) {
      continue
    }

    buckets.component.push({
      area: 'components',
      label: labelFromSlug(slug),
      slug,
    })
  }

  return buckets
}

function sortItems(section: PageSection, items: NavItem[]): NavItem[] {
  const bySlug = new Map(items.map(item => [item.slug, item]))
  return sortSlugs(
    section,
    items.map(item => item.slug)
  ).flatMap(slug => {
    const item = bySlug.get(slug)
    return item ? [item] : []
  })
}

function itemsWithoutDefault(items: NavItem[], defaultSlug: string) {
  return items.filter(item => item.slug !== defaultSlug)
}

function sectionsWithItems(title: string, items: NavItem[]): NavSection[] {
  return items.length === 0 ? [] : [{ title, items }]
}

function areaSection(
  buckets: Record<PageSection, NavItem[]>,
  section: PageSection,
  title: string,
  defaultSlug: string
): NavSection[] {
  return sectionsWithItems(
    title,
    sortItems(section, itemsWithoutDefault(buckets[section], defaultSlug))
  )
}

function docArea(
  buckets: Record<PageSection, NavItem[]>,
  id: DocAreaId,
  sections: ReadonlyArray<readonly [PageSection, string]>
): DocArea {
  const defaultSlug = DOC_AREA_DEFAULTS[id]
  return {
    defaultSlug,
    id,
    label: DOC_AREA_LABELS[id],
    sections: sections.flatMap(([section, title]) =>
      areaSection(buckets, section, title, defaultSlug)
    ),
    startLabel: labelFromSlug(defaultSlug),
  }
}

function componentDocArea(buckets: Record<PageSection, NavItem[]>): DocArea {
  const defaultSlug = DOC_AREA_DEFAULTS.components
  const componentItems = new Map(buckets.component.map(item => [item.slug, item]))
  const catalogSlugs = new Set(componentCatalogItems.map(item => componentDocSlug(item.slug)))
  const contractItems = sortItems(
    'component',
    buckets.component.filter(item => item.slug !== defaultSlug && !catalogSlugs.has(item.slug))
  )
  const catalogSections = componentCatalogGroups.flatMap(group => {
    const items = group.items.flatMap(item => {
      const navItem = componentItems.get(componentDocSlug(item.slug))
      return navItem ? [navItem] : []
    })
    return sectionsWithItems(group.title, items)
  })

  return {
    defaultSlug,
    id: 'components',
    label: DOC_AREA_LABELS.components,
    sections: [
      ...sectionsWithItems('Contract', contractItems),
      ...catalogSections,
    ],
    startLabel: labelFromSlug(defaultSlug),
  }
}

function buildDocAreas(): Record<DocAreaId, DocArea> {
  const buckets = buildSectionItems()

  return {
    architecture: docArea(buckets, 'architecture', DOC_AREA_SECTIONS.architecture),
    components: componentDocArea(buckets),
    foundations: docArea(buckets, 'foundations', DOC_AREA_SECTIONS.foundations),
    patterns: docArea(buckets, 'patterns', DOC_AREA_SECTIONS.patterns),
    themes: docArea(buckets, 'themes', DOC_AREA_SECTIONS.themes),
  }
}

export const DOC_AREAS = buildDocAreas()

const generatedComponentPages = Object.fromEntries(
  componentCatalogItems.map(item => [
    componentDocSlug(item.slug),
    lazy(async () => {
      const module = await import('../components/component-reference-page')
      return { default: module.createComponentReferencePage(item.slug) }
    }),
  ])
)

const mdxPages = Object.fromEntries(
  Object.entries(pageModules).map(([path, loadModule]) => {
    const slug = slugFromPath(path)
    const Page = lazy(() => loadModule().then(module => ({ default: module.default })))
    return [slug, Page]
  })
)

export const PAGES: Record<string, LazyExoticComponent<ComponentType>> = {
  ...generatedComponentPages,
  ...mdxPages,
}

export type DocNavEntry = NavItem & { sectionTitle: string }

/** Sidebar reading order for one area, flattened for breadcrumbs and prev/next. */
function flattenArea(area: DocArea): DocNavEntry[] {
  const siteHome: DocNavEntry = {
    area: DEFAULT_DOC_AREA,
    label: 'Design system home',
    sectionTitle: 'Start here',
    slug: DEFAULT_DOC_SLUG,
  }
  const start: DocNavEntry = {
    area: area.id,
    label: area.startLabel,
    sectionTitle: 'Start here',
    slug: area.defaultSlug,
  }

  const rest = area.sections.flatMap(section =>
    section.items.map(item => ({ ...item, sectionTitle: section.title }))
  )

  const areaEntries = [start, ...rest.filter(item => item.slug !== area.defaultSlug)]
  return area.id === DEFAULT_DOC_AREA ? [siteHome, ...areaEntries] : areaEntries
}

const AREA_READING_ORDER = Object.fromEntries(
  DOC_AREA_IDS.map(id => [id, flattenArea(DOC_AREAS[id])])
) as Record<DocAreaId, DocNavEntry[]>

export type DocNavigation = {
  current: DocNavEntry | null
  next: DocNavEntry | null
  previous: DocNavEntry | null
}

export function getDocNavigation(area: DocAreaId, slug: string): DocNavigation {
  const entries = AREA_READING_ORDER[area]
  const index = entries.findIndex(entry => entry.slug === slug)

  if (index === -1) {
    return { current: null, next: null, previous: null }
  }

  return {
    current: entries[index] ?? null,
    next: entries[index + 1] ?? null,
    previous: index > 0 ? (entries[index - 1] ?? null) : null,
  }
}

export function getAllDocEntries(): DocNavEntry[] {
  return DOC_AREA_IDS.flatMap(id => AREA_READING_ORDER[id])
}
