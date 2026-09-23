import { PAGES } from './doc-pages'
import {
  areaForSlug,
  DEFAULT_DOC_AREA,
  DEFAULT_DOC_SLUG,
  DOC_AREA_DEFAULTS,
  type DocAreaId,
  isDocAreaId,
  isLegacyDocAreaId,
  LEGACY_DOC_AREA_DEFAULTS,
  LEGACY_DOC_SLUG_ALIASES,
  pathForDoc,
} from './doc-taxonomy'

export { DEFAULT_DOC_AREA, DEFAULT_DOC_SLUG, pathForDoc }

export type ResolvedDocTarget = {
  area: DocAreaId
  slug: string
}

export function resolveDocTarget(areaOrSlug?: string, slug?: string): ResolvedDocTarget {
  const aliasedNestedSlug = slug ? LEGACY_DOC_SLUG_ALIASES[slug] : undefined
  if (aliasedNestedSlug && aliasedNestedSlug in PAGES) {
    return { area: areaForSlug(aliasedNestedSlug), slug: aliasedNestedSlug }
  }

  const aliasedRootSlug = areaOrSlug ? LEGACY_DOC_SLUG_ALIASES[areaOrSlug] : undefined
  if (aliasedRootSlug && aliasedRootSlug in PAGES) {
    return { area: areaForSlug(aliasedRootSlug), slug: aliasedRootSlug }
  }

  if (isDocAreaId(areaOrSlug)) {
    const fallbackSlug = DOC_AREA_DEFAULTS[areaOrSlug]
    if (slug && slug in PAGES) {
      return { area: areaForSlug(slug), slug }
    }
    return { area: areaOrSlug, slug: fallbackSlug }
  }

  if (isLegacyDocAreaId(areaOrSlug)) {
    const fallbackSlug = LEGACY_DOC_AREA_DEFAULTS[areaOrSlug]
    const activeSlug = slug && slug in PAGES ? slug : fallbackSlug
    return { area: areaForSlug(activeSlug), slug: activeSlug }
  }

  if (areaOrSlug && areaOrSlug in PAGES) {
    return { area: areaForSlug(areaOrSlug), slug: areaOrSlug }
  }

  return { area: DEFAULT_DOC_AREA, slug: DEFAULT_DOC_SLUG }
}

export function slugFromPath(pathname = window.location.pathname): string {
  const [, firstSegment, secondSegment] = pathname.split('/')
  return resolveDocTarget(firstSegment, secondSegment).slug
}

export function pathForSlug(slug: string): string {
  return pathForDoc(areaForSlug(slug), slug)
}
