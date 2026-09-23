import { describe, expect, it } from 'vitest'
import {
  areaForSlug,
  DOC_AREA_DEFAULTS,
  DOC_AREA_IDS,
  DOC_AREA_LABELS,
  DOC_AREAS,
  DOC_NAV_DOMAIN_IDS,
  DOC_NAV_DOMAINS,
  getAllDocEntries,
  getDocNavigation,
  isAuthoredPageSlug,
  isDocAreaId,
  navDomainForArea,
  PAGES,
} from './doc-pages'
import { resolveDocTarget } from './doc-routing'
import { componentCatalogItems, componentDocSlug } from './component-catalog'
import { LEGACY_DOC_SLUG_ALIASES, labelFromSlug } from './doc-taxonomy'

describe('DOC_AREA_IDS', () => {
  it('contains the five reader-facing knowledge areas', () => {
    expect([...DOC_AREA_IDS]).toEqual([
      'architecture',
      'foundations',
      'themes',
      'components',
      'patterns',
    ])
  })
})

describe('navigation domains', () => {
  it('compresses five content areas into two global contexts', () => {
    expect([...DOC_NAV_DOMAIN_IDS]).toEqual(['system', 'components'])
    expect(DOC_NAV_DOMAINS.system.areaIds).toEqual([
      'architecture',
      'foundations',
      'themes',
      'patterns',
    ])
    expect(navDomainForArea('themes')).toBe('system')
    expect(navDomainForArea('components')).toBe('components')
  })
})

describe('DOC_AREA_DEFAULTS', () => {
  it('each area has a default slug', () => {
    expect(DOC_AREA_DEFAULTS.architecture).toBe('architecture-overview')
    expect(DOC_AREA_DEFAULTS.foundations).toBe('foundation-designing-in-code')
    expect(DOC_AREA_DEFAULTS.themes).toBe('theme-overview')
    expect(DOC_AREA_DEFAULTS.components).toBe('component-overview')
    expect(DOC_AREA_DEFAULTS.patterns).toBe('pattern-layout')
  })
})

describe('DOC_AREA_LABELS', () => {
  it('each area has a label', () => {
    expect(DOC_AREA_LABELS.architecture).toBe('Architecture')
    expect(DOC_AREA_LABELS.foundations).toBe('Foundations')
    expect(DOC_AREA_LABELS.themes).toBe('Themes')
    expect(DOC_AREA_LABELS.components).toBe('Components')
    expect(DOC_AREA_LABELS.patterns).toBe('Patterns')
  })
})

describe('isDocAreaId', () => {
  it('returns true for valid area ids', () => {
    for (const id of DOC_AREA_IDS) {
      expect(isDocAreaId(id)).toBe(true)
    }
  })

  it('returns false for invalid values', () => {
    expect(isDocAreaId('system')).toBe(false)
    expect(isDocAreaId('unknown')).toBe(false)
    expect(isDocAreaId(undefined)).toBe(false)
  })
})

describe('areaForSlug', () => {
  it('maps home and architecture pages to architecture', () => {
    expect(areaForSlug('home')).toBe('architecture')
    expect(areaForSlug('architecture-overview')).toBe('architecture')
  })

  it('maps foundation pages to foundations', () => {
    expect(areaForSlug('foundation-colors')).toBe('foundations')
  })

  it('maps theme pages to themes', () => {
    expect(areaForSlug('theme-overview')).toBe('themes')
    expect(areaForSlug('theme-system')).toBe('themes')
  })

  it('maps component contracts to components', () => {
    expect(areaForSlug('component-overview')).toBe('components')
    expect(areaForSlug('component-button')).toBe('components')
    expect(areaForSlug('component-contract')).toBe('components')
  })

  it('maps pattern pages to patterns', () => {
    expect(areaForSlug('pattern-layout')).toBe('patterns')
  })
})

describe('DOC_AREAS', () => {
  it('has keys for all reader-facing areas', () => {
    expect(Object.keys(DOC_AREAS).sort()).toEqual([...DOC_AREA_IDS].sort())
  })

  it('groups supporting sections under their conceptual areas', () => {
    expect(DOC_AREAS.foundations.sections.map(section => section.title)).toEqual(['Foundations'])
    expect(DOC_AREAS.components.sections.map(section => section.title)).toEqual([
      'Contract',
      'Actions',
      'Forms and selection',
      'Navigation',
      'Overlays',
      'Content and surfaces',
      'Feedback and utilities',
    ])
    expect(DOC_AREAS.themes.sections.map(section => section.title)).toEqual(['Theme architecture'])
    expect(DOC_AREAS.patterns.sections.map(section => section.title)).toEqual(['Patterns'])
  })

  it('each area has required properties', () => {
    for (const id of DOC_AREA_IDS) {
      const area = DOC_AREAS[id]
      expect(area.id).toBe(id)
      expect(area.label).toBe(DOC_AREA_LABELS[id])
      expect(area.defaultSlug).toBe(DOC_AREA_DEFAULTS[id])
      expect(area).toHaveProperty('sections')
      expect(area).toHaveProperty('startLabel')
    }
  })

  it('labels area entry pages from their canonical page titles', () => {
    expect(DOC_AREAS.foundations.startLabel).toBe('Designing in code')
    expect(DOC_AREAS.patterns.startLabel).toBe('Page layout')
    expect(DOC_AREAS.themes.startLabel).toBe('Overview')
  })
})

describe('legacy area URLs', () => {
  it('resolve to the new conceptual area without losing the requested page', () => {
    expect(resolveDocTarget('architecture', 'architecture-component-contract')).toEqual({
      area: 'components',
      slug: 'component-contract',
    })
    expect(resolveDocTarget('architecture', 'architecture-theme-system')).toEqual({
      area: 'themes',
      slug: 'theme-system',
    })
    expect(resolveDocTarget('architecture', 'architecture-implementation-status')).toEqual({
      area: 'foundations',
      slug: 'foundation-personalization',
    })
    const movedThemePages = [
      ['theme-button', 'components', 'component-button'],
      ['theme-button-group', 'components', 'component-button-group'],
      ['theme-input', 'components', 'component-input'],
      ['theme-menu-popup', 'components', 'component-dropdown-menu'],
      ['theme-segment-control', 'components', 'component-segmented-control'],
      ['theme-tabs', 'components', 'component-tabs'],
    ] as const
    for (const [legacySlug, area, canonicalSlug] of movedThemePages) {
      expect(resolveDocTarget('themes', legacySlug)).toEqual({
        area,
        slug: canonicalSlug,
      })
    }
  })
})

describe('site home navigation', () => {
  it('keeps the home page searchable and connected to the architecture reading order', () => {
    expect(getAllDocEntries().some(entry => entry.slug === 'home')).toBe(true)
    expect(getDocNavigation('architecture', 'home').next?.slug).toBe('architecture-overview')
  })
})

describe('PAGES', () => {
  it('is a non-empty object with string keys', () => {
    const keys = Object.keys(PAGES)
    expect(keys.length).toBeGreaterThan(0)
    for (const key of keys) {
      expect(typeof key).toBe('string')
    }
  })

  it('provides a canonical page for every public component family', () => {
    for (const item of componentCatalogItems) {
      expect(PAGES).toHaveProperty(componentDocSlug(item.slug))
    }
  })

  it('includes every canonical page exactly once in reading order', () => {
    const entries = getAllDocEntries()
    const slugs = entries.map(entry => entry.slug)

    expect(new Set(slugs).size).toBe(slugs.length)
    expect([...slugs].sort()).toEqual(Object.keys(PAGES).sort())
    for (const entry of entries) {
      expect(entry.label).toBe(
        entry.slug === 'home' ? 'Design system home' : labelFromSlug(entry.slug)
      )
    }
  })

  it('does not emit legacy aliases as canonical pages', () => {
    for (const legacySlug of Object.keys(LEGACY_DOC_SLUG_ALIASES)) {
      expect(PAGES).not.toHaveProperty(legacySlug)
      expect(getAllDocEntries().some(entry => entry.slug === legacySlug)).toBe(false)
    }
  })

  it('distinguishes authored component guides from generated references', () => {
    expect(isAuthoredPageSlug('component-button')).toBe(true)
    expect(isAuthoredPageSlug('component-sidebar')).toBe(false)

    const authoredGuides = componentCatalogItems
      .map(item => componentDocSlug(item.slug))
      .filter(isAuthoredPageSlug)
      .sort()
    expect(authoredGuides).toEqual([
      'component-button',
      'component-button-group',
      'component-dropdown-menu',
      'component-input',
      'component-segmented-control',
      'component-tabs',
    ])
  })
})
