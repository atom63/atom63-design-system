import { describe, expect, it } from 'vitest'
import { buttonSizes, buttonStates, buttonVariants } from '@atom63/ui-foundation'
import * as uiReactRootApi from '@atom63/ui-react'
import * as uiReactCalendarApi from '@atom63/ui-react/calendar'
import uiReactPackageSource from '../../../../packages/ui-react/package.json?raw'
import uiReactCalendarSource from '../../../../packages/ui-react/src/calendar/index.ts?raw'
import uiReactRootSource from '../../../../packages/ui-react/src/index.ts?raw'
import {
  componentCatalogGroups,
  componentCatalogItems,
  componentSlugFromDocSlug,
} from './component-catalog'
import { getComponentContractDoc, getComponentMaturity } from './component-contract'
import { componentDocMarkdown, componentExportSurface, getComponentDoc } from './component-docs'

// Calendar has its own entry; with the root entry it exports every component family.
const uiReactApi = { ...uiReactRootApi, ...uiReactCalendarApi }
const uiReactIndexSource = `${uiReactRootSource}\n${uiReactCalendarSource}`

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
      [...uiReactIndexSource.matchAll(/['"]\.\.?\/components\/([^'"]+)['"]/g)].map(
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
  it('covers every @atom63/ui-react component family exactly once', () => {
    const catalogSlugs = componentCatalogItems.map(item => item.slug).sort()
    const publicFamilies = publicComponentFamilies()

    expect(publicFamilies.length).toBeGreaterThan(0)
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
      expect(item.importPath).toBe(
        item.slug === 'calendar' ? '@atom63/ui-react/calendar' : '@atom63/ui-react'
      )
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

  it('keys axis guidance by contract values, one short sentence each', () => {
    for (const item of componentCatalogItems) {
      if (!item.axisGuidance) {
        continue
      }

      const contract = getComponentContractDoc(item.slug)
      expect(contract, `${item.slug} has axis guidance but no contract`).not.toBeNull()
      const axisValues = (name: string) => contract?.axes.find(axis => axis.name === name)?.values
      const allowed: Record<string, readonly string[] | undefined> = {
        size: axisValues('sizes'),
        state: contract?.states,
        variant: axisValues('variants'),
      }

      for (const [axis, lines] of Object.entries(item.axisGuidance)) {
        expect(Object.keys(allowed), `${item.slug} axis ${axis}`).toContain(axis)
        const values = allowed[axis]
        expect(values, `${item.slug} contract has no ${axis} values`).toBeDefined()
        for (const [value, line] of Object.entries(lines ?? {})) {
          const where = `${item.slug} ${axis} ${value}`
          expect(values, where).toContain(value)
          expect(line.trim(), where).toBe(line)
          expect(line, where).toMatch(/^[A-Z].*\.$/)
          expect(line.length, where).toBeLessThan(120)
        }
      }
    }
  })

  // Components with a Figma model need a line for every modelled value: the
  // generated spec card shows one per variant, rendered size and state.
  it('gives Button a guidance line for every variant, rendered size and state', () => {
    const button = componentCatalogItems.find(item => item.slug === 'button')
    const keys = (lines: Readonly<Record<string, string>> | undefined) =>
      Object.keys(lines ?? {}).sort()

    expect(keys(button?.axisGuidance?.variant)).toEqual([...buttonVariants].sort())
    // Rendered sizes only: icon-only steps and the tile are layouts of the same sizes.
    const renderedSizes = buttonSizes.filter(size => !size.startsWith('icon') && size !== 'tile')
    expect(keys(button?.axisGuidance?.size)).toEqual([...renderedSizes].sort())
    expect(keys(button?.axisGuidance?.state)).toEqual([...buttonStates].sort())
  })

  it('carries axis guidance into the component Markdown only when present', () => {
    const buttonMarkdown = componentDocMarkdown('button', uiReactIndexSource)
    expect(buttonMarkdown).toContain('## Variants, sizes and states')
    expect(buttonMarkdown).toContain('| Size | `md` | Default. |')
    expect(buttonMarkdown.indexOf('## Variants, sizes and states')).toBeLessThan(
      buttonMarkdown.indexOf('## Usage')
    )
    expect(componentDocMarkdown('kbd', uiReactIndexSource)).not.toContain(
      '## Variants, sizes and states'
    )
  })

  it('only resolves canonical component document slugs', () => {
    expect(componentSlugFromDocSlug('component-sidebar')).toBe('sidebar')
    expect(componentSlugFromDocSlug('component-not-real')).toBeNull()
    expect(componentSlugFromDocSlug('architecture-overview')).toBeNull()
  })
})

describe('component public exports', () => {
  it('uses the package root entry for component imports, and the calendar entry for Calendar', () => {
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
    expect(packageJson.exports['./calendar']).toMatchObject({
      '@atom63/source': './src/calendar/index.ts',
      import: './dist/calendar/index.js',
      types: './dist/calendar/index.d.ts',
    })
    expect(uiReactRootSource).not.toContain('./components/calendar')
    expect(
      componentCatalogItems
        .filter(item => item.importPath !== '@atom63/ui-react')
        .map(item => [item.slug, item.importPath])
    ).toEqual([['calendar', '@atom63/ui-react/calendar']])
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

  it('derives status from coverage and the contract maturity', () => {
    for (const item of componentCatalogItems) {
      const hasStory = Boolean(
        sourceFor(componentStorySources, `/components/${item.slug}/${item.slug}.stories.tsx`)
      )
      const hasTest = Boolean(
        sourceFor(componentTestSources, `/components/${item.slug}/${item.slug}.test.tsx`)
      )
      // A covered component is stable unless its contract still marks it preview.
      const expected =
        hasStory && hasTest ? (getComponentMaturity(item.slug) ?? 'stable') : 'preview'
      expect(item.status, item.slug).toBe(expected)
    }

    // Every public family ships a story and a test, so all of them are stable
    // except those whose contract is still preview.
    const preview = componentCatalogItems.filter(
      item => getComponentMaturity(item.slug) === 'preview'
    )
    expect(componentCatalogItems.filter(item => item.status === 'stable')).toHaveLength(
      publicComponentFamilies().length - preview.length
    )
  })

  it('emits correct generated Markdown imports and API names', () => {
    const toasterMarkdown = componentDocMarkdown('toaster', uiReactIndexSource)

    expect(toasterMarkdown).toContain("import { Toaster, toast } from '@atom63/ui-react'")
    expect(toasterMarkdown).toContain('`ToasterProps`')
    expect(componentDocMarkdown('not-real', uiReactIndexSource)).toBe('')
  })
})
