import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  addToArchetype,
  appendRecipeImport,
  archetypeIds,
  catalogCategories,
  catalogSlugs,
  componentNames,
  foundationFamily,
  insertCatalogDefinition,
  insertCatalogGroupSlug,
  insertExportBlock,
  insertRecipeExport,
  reactFamily,
} from './ds-new.mjs'

describe('componentNames', () => {
  it('derives Pascal and camel names from a kebab-case slug', () => {
    assert.deepEqual(componentNames('stat-meter'), {
      slug: 'stat-meter',
      pascal: 'StatMeter',
      camel: 'statMeter',
    })
  })

  it('rejects names that are not kebab-case', () => {
    assert.throws(() => componentNames('StatMeter'), /kebab-case/)
    assert.throws(() => componentNames('stat_meter'), /kebab-case/)
  })
})

describe('insertExportBlock', () => {
  const index = `export { Badge } from './components/badge'
export type { BadgeProps } from './components/badge'
export { cn } from './lib/cn'
export { Kbd } from './components/kbd'
`
  it('inserts before the first family that sorts after the slug', () => {
    const next = insertExportBlock(
      index,
      'card',
      "export { Card } from './components/card'\n",
      reactFamily
    )
    assert.match(next, /badge'\nexport \{ cn \} from '\.\/lib\/cn'\nexport \{ Card \}/)
  })

  it('appends after the last family when the slug sorts last', () => {
    const next = insertExportBlock(
      index,
      'tabs',
      "export { Tabs } from './components/tabs'\n",
      reactFamily
    )
    assert.ok(
      next.endsWith(
        "export { Kbd } from './components/kbd'\nexport { Tabs } from './components/tabs'\n"
      )
    )
  })

  it('refuses a family that already exists', () => {
    assert.throws(() => insertExportBlock(index, 'kbd', '', reactFamily), /already exist/)
  })

  it('recognises foundation contract paths', () => {
    assert.equal(foundationFamily('./components/kbd/kbd-contract'), 'kbd')
    assert.equal(foundationFamily('./visual-archetypes'), null)
  })
})

describe('insertRecipeExport', () => {
  it('adds the recipe subpath in order among the recipes', () => {
    const pkg = JSON.stringify({
      exports: {
        '.': './src/index.ts',
        './recipes/badge.css': 'b',
        './recipes/kbd.css': 'k',
        './theme': './src/theme.ts',
      },
    })
    assert.deepEqual(Object.keys(JSON.parse(insertRecipeExport(pkg, 'card')).exports), [
      '.',
      './recipes/badge.css',
      './recipes/card.css',
      './recipes/kbd.css',
      './theme',
    ])
  })
})

describe('appendRecipeImport', () => {
  it('appends after the last component import', () => {
    const css = `@import './reset.css';
@import '../components/badge/badge.css' layer(components);
@import '../media/lightbox.css' layer(components);
`
    assert.equal(
      appendRecipeImport(css, 'card'),
      `@import './reset.css';
@import '../components/badge/badge.css' layer(components);
@import '../components/card/card.css' layer(components);
@import '../media/lightbox.css' layer(components);
`
    )
  })
})

const archetypes = `export const visualArchetypes = {
  marker: {
    id: 'marker',
    label: 'Markers',
    components: ['Avatar', 'Badge'],
    contracts: ['marker'],
  },
  trigger: {
    id: 'trigger',
    label: 'Triggers',
    components: [
      'DialogTrigger',
    ],
    contracts: ['trigger'],
  },
}
`

describe('archetypes', () => {
  it('lists the archetype ids', () => {
    assert.deepEqual(archetypeIds(archetypes), ['marker', 'trigger'])
  })

  it('adds the component to the chosen archetype only', () => {
    const next = addToArchetype(archetypes, 'marker', 'StatMeter')
    assert.match(next, /components: \['Avatar', 'Badge', 'StatMeter'\]/)
    assert.match(next, /'DialogTrigger',\n/)
  })

  it('rejects an unknown archetype', () => {
    assert.throws(() => addToArchetype(archetypes, 'nope', 'X'), /unknown visual archetype/)
  })
})

const catalog = `const componentDefinitions = {
  badge: {
    relatedSlugs: ['kbd'],
  },
  'input-otp': {
    relatedSlugs: ['input'],
  },
  kbd: {
    relatedSlugs: ['badge'],
  },
}

export const groups = [
  {
    items: components('feedback', [
      'badge',
      'kbd',
    ]),
  },
]
`

describe('catalog', () => {
  it('reads slugs and categories', () => {
    assert.deepEqual(catalogSlugs(catalog), ['badge', 'input-otp', 'kbd'])
    assert.deepEqual(catalogCategories(catalog), ['feedback'])
  })

  it('inserts a definition in order, quoting kebab-case keys and escaping quotes', () => {
    const next = insertCatalogDefinition(catalog, 'icon-grid', {
      relatedSlugs: ['badge', 'kbd'],
      summary: "IconGrid lays out icons in a grid that doesn't reflow.",
      usage: 'Use it for glyph pickers.',
      usageExports: ['IconGrid'],
    })
    assert.deepEqual(catalogSlugs(next), ['badge', 'icon-grid', 'input-otp', 'kbd'])
    assert.match(next, /summary: 'IconGrid lays out icons in a grid that doesn\\'t reflow\.',/)
  })

  it('adds the slug to its group in order', () => {
    const next = insertCatalogGroupSlug(catalog, 'feedback', 'card')
    assert.match(
      next,
      /components\('feedback', \[\n {6}'badge',\n {6}'card',\n {6}'kbd',\n {4}\]\)/
    )
  })
})
