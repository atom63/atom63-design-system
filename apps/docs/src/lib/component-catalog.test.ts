import { describe, expect, it } from 'vitest'
import * as uiReactApi from '@atom63/ui-react'
import uiReactPackageSource from '../../../../packages/ui-react/package.json?raw'
import uiReactIndexSource from '../../../../packages/ui-react/src/index.ts?raw'
import {
  componentCatalogGroups,
  componentCatalogItems,
  componentSlugFromDocSlug,
} from './component-catalog'
import { componentDocMarkdown, componentExportSurface, getComponentDoc } from './component-docs'

const componentIndexSources = import.meta.glob<string>(
  '../../../../packages/ui-react/src/components/*/index.ts',
  {
    eager: true,
    import: 'default',
    query: '?raw',
  }
)
const componentStorySources = import.meta.glob<string>(
  '../../../../packages/ui-react/src/components/*/*.stories.tsx',
  {
    eager: true,
    import: 'default',
    query: '?raw',
  }
)
const componentTestSources = import.meta.glob<string>(
  '../../../../packages/ui-react/src/components/*/*.test.tsx',
  {
    eager: true,
    import: 'default',
    query: '?raw',
  }
)
const packageCssSources = import.meta.glob<string>('../../../../packages/ui-react/src/**/*.css', {
  eager: true,
  import: 'default',
  query: '?raw',
})

function publicComponentFamilies(): string[] {
  return [
    ...new Set(
      [...uiReactIndexSource.matchAll(/['"]\.\/components\/([^'"]+)['"]/g)].map(
        match => match[1] ?? ''
      )
    ),
  ]
    .filter(Boolean)
    .sort()
}

function sourceFor(sources: Record<string, string>, suffix: string): string | undefined {
  return Object.entries(sources).find(([path]) => path.endsWith(suffix))?.[1]
}

describe('component catalog inventory', () => {
  it('covers every root @atom63/ui-react component family exactly once', () => {
    const catalogSlugs = componentCatalogItems.map(item => item.slug).sort()
    const publicFamilies = publicComponentFamilies()

    expect(publicFamilies).toHaveLength(68)
    expect(catalogSlugs).toEqual(publicFamilies)
    expect(new Set(catalogSlugs).size).toBe(catalogSlugs.length)
  })

  it('keeps internal source helpers out of the public family inventory', () => {
    expect(publicComponentFamilies()).not.toContain('menu')
    expect(componentCatalogItems.map(item => item.slug)).not.toContain('menu')
    expect(sourceFor(componentStorySources, '/components/menu/menu.stories.tsx')).toBeDefined()
  })

  it('keeps groups non-empty, category-aligned, and uniquely keyed', () => {
    expect(componentCatalogGroups.every(group => group.items.length > 0)).toBe(true)
    expect(new Set(componentCatalogGroups.map(group => group.id)).size).toBe(
      componentCatalogGroups.length
    )

    for (const group of componentCatalogGroups) {
      expect(group.items.every(item => item.category === group.id)).toBe(true)
    }
  })

  it('keeps item guidance and related links complete and canonical', () => {
    const slugs = new Set(componentCatalogItems.map(item => item.slug))

    for (const item of componentCatalogItems) {
      expect(item.importPath).toBe('@atom63/ui-react')
      expect(item.summary.length).toBeGreaterThan(20)
      expect(item.usage.length).toBeGreaterThan(20)
      expect(item.usageExports.length).toBeGreaterThan(0)
      expect(item.relatedSlugs.length).toBeGreaterThanOrEqual(2)
      expect(new Set(item.relatedSlugs).size).toBe(item.relatedSlugs.length)
      expect(item.relatedSlugs).not.toContain(item.slug)
      expect(item.relatedSlugs.every(slug => slugs.has(slug))).toBe(true)

      const doc = getComponentDoc(item.slug)
      expect(doc?.related.map(related => related.slug)).toEqual(item.relatedSlugs)
      expect(doc?.guidance[0]).toBe(item.usage)
    }
  })

  it('only resolves canonical component document slugs', () => {
    expect(componentSlugFromDocSlug('component-sidebar')).toBe('sidebar')
    expect(componentSlugFromDocSlug('component-not-real')).toBeNull()
    expect(componentSlugFromDocSlug('architecture-overview')).toBeNull()
  })
})

describe('component public exports', () => {
  it('uses the package root entry for component imports', () => {
    const packageJson = JSON.parse(uiReactPackageSource) as {
      exports: Record<string, string | Record<string, string>>
    }

    expect(packageJson.exports['.']).toMatchObject({
      '@atom63/source': './src/index.ts',
      import: './dist/index.js',
      types: './dist/index.d.ts',
    })
    expect(
      Object.keys(packageJson.exports).filter(path => path.startsWith('./components/'))
    ).toEqual([])
    expect(componentCatalogItems.every(item => item.importPath === '@atom63/ui-react')).toBe(true)
  })

  it('maps every family to its actual root values and types', () => {
    const publicValueOwners = new Map<string, string>()

    for (const item of componentCatalogItems) {
      const exports = componentExportSurface(item.slug, uiReactIndexSource)
      expect(exports.values.length + exports.types.length, item.slug).toBeGreaterThan(0)
      expect(
        item.usageExports.every(name => exports.values.includes(name)),
        `${item.slug} representative import`
      ).toBe(true)
      expect(
        sourceFor(componentIndexSources, `/components/${item.slug}/index.ts`),
        `${item.slug} family barrel`
      ).toBeDefined()

      for (const name of exports.values) {
        const previousOwner = publicValueOwners.get(name)
        expect(
          previousOwner,
          `${name} is exported by ${previousOwner} and ${item.slug}`
        ).toBeUndefined()
        publicValueOwners.set(name, item.slug)
      }
    }
  })

  it('resolves every documented runtime value from the public package import', () => {
    const runtimeApi = uiReactApi as Record<string, unknown>

    for (const item of componentCatalogItems) {
      const exports = componentExportSurface(item.slug, uiReactIndexSource)
      for (const name of exports.values) {
        expect(runtimeApi[name], `${item.slug}.${name}`).toBeDefined()
      }
    }
  })

  it('does not mistake family-local aliases for root package exports', () => {
    expect(componentExportSurface('hover-card', uiReactIndexSource).values).toEqual([
      'HoverCard',
      'HoverCardContent',
      'HoverCardTrigger',
    ])
    expect(componentExportSurface('preview-card', uiReactIndexSource).values).toEqual([
      'PreviewCard',
      'PreviewCardPopup',
      'PreviewCardTrigger',
    ])
    expect(componentExportSurface('tabs', uiReactIndexSource).values).toEqual(
      expect.arrayContaining(['TabsContent', 'TabsPanel', 'TabsTab', 'TabsTrigger'])
    )
  })

  it('associates the public toast helper with the Toaster family', () => {
    const exports = componentExportSurface('toaster', uiReactIndexSource)
    expect(exports.values).toEqual(['Toaster', 'toast'])
    expect(exports.types).toEqual(['ToasterProps'])
  })

  it('keeps every published CSS recipe target on disk', () => {
    const packageJson = JSON.parse(uiReactPackageSource) as {
      exports: Record<string, string | Record<string, string>>
    }
    const cssPaths = Object.keys(packageCssSources)

    for (const [exportPath, target] of Object.entries(packageJson.exports)) {
      if (!(exportPath.startsWith('./recipes/') && typeof target === 'string')) {
        continue
      }

      const targetSuffix = `/packages/ui-react/${target.replace(/^\.\//, '')}`
      expect(
        cssPaths.some(path => path.endsWith(targetSuffix)),
        `${exportPath} -> ${target}`
      ).toBe(true)
    }
  })
})

describe('component reference coverage', () => {
  it('selects an existing co-located representative story for every family', () => {
    for (const item of componentCatalogItems) {
      const storySource = sourceFor(
        componentStorySources,
        `/components/${item.slug}/${item.slug}.stories.tsx`
      )
      expect(storySource, `${item.slug} story module`).toBeDefined()
      expect(storySource, `${item.slug}.${item.storyExport}`).toMatch(
        new RegExp(`export const ${item.storyExport}\\b`)
      )
    }
  })

  it('derives status from co-located story and focused test coverage', () => {
    for (const item of componentCatalogItems) {
      const hasStory = Boolean(
        sourceFor(componentStorySources, `/components/${item.slug}/${item.slug}.stories.tsx`)
      )
      const hasTest = Boolean(
        sourceFor(componentTestSources, `/components/${item.slug}/${item.slug}.test.tsx`)
      )
      expect(item.status, item.slug).toBe(hasStory && hasTest ? 'stable' : 'preview')
    }

    expect(componentCatalogItems.filter(item => item.status === 'stable')).toHaveLength(68)
  })

  it('emits correct generated Markdown imports and API names', () => {
    const toasterMarkdown = componentDocMarkdown('toaster', uiReactIndexSource)

    expect(toasterMarkdown).toContain("import { Toaster, toast } from '@atom63/ui-react'")
    expect(toasterMarkdown).toContain('`ToasterProps`')
    expect(componentDocMarkdown('not-real', uiReactIndexSource)).toBe('')
  })
})
