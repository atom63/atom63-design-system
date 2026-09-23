import fs from 'node:fs/promises'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { componentCatalogItems, componentDocSlug } from '../src/lib/component-catalog'
import { buildLlmsTxt, markdownRoute, readEntries, readEntryMarkdown } from './llms-txt'

const pagesDir = path.resolve(process.cwd(), 'src/pages')
const uiReactIndexPath = path.resolve(process.cwd(), '../../packages/ui-react/src/index.ts')

describe('LLM documentation inventory', () => {
  it('matches canonical reading order without duplicates', async () => {
    const entries = await readEntries(pagesDir)
    const slugs = entries.map(entry => entry.slug)
    const authoredSlugs = (await fs.readdir(pagesDir))
      .filter(file => file.endsWith('.mdx'))
      .map(file => file.slice(0, -4))
    const expectedSlugs = new Set([
      ...authoredSlugs,
      ...componentCatalogItems.map(item => componentDocSlug(item.slug)),
    ])

    expect(new Set(slugs)).toEqual(expectedSlugs)
    expect(new Set(slugs).size).toBe(slugs.length)
    expect(entries[0]?.label).toBe('Design system home')
    expect(slugs.slice(0, 4)).toEqual([
      'home',
      'architecture-overview',
      'architecture-appearance-ui',
      'architecture-changelog',
    ])
    expect(slugs.indexOf('foundation-designing-in-code')).toBeLessThan(
      slugs.indexOf('foundation-personalization')
    )
    expect(slugs.indexOf('component-contract')).toBeLessThan(slugs.indexOf('component-button'))
    expect(slugs.indexOf('component-button')).toBeLessThan(slugs.indexOf('component-accordion'))
  })

  it('routes every compact-index entry to its Markdown twin', async () => {
    const entries = await readEntries(pagesDir)
    const uiReactIndexSource = await fs.readFile(uiReactIndexPath, 'utf8')
    const llmsTxt = await buildLlmsTxt(pagesDir, entries, uiReactIndexSource)

    expect(markdownRoute('/')).toBe('/index.md')
    for (const entry of entries) {
      expect(llmsTxt).toContain(`](${markdownRoute(entry.route)}): `)
    }
    expect(llmsTxt).not.toContain('## API surface')
  })

  it('keeps authored component guidance, examples, and generated reference together', async () => {
    const entries = await readEntries(pagesDir)
    const button = entries.find(entry => entry.slug === 'component-button')
    const uiReactIndexSource = await fs.readFile(uiReactIndexPath, 'utf8')

    expect(button).toBeDefined()
    if (!button) {
      return
    }

    const markdown = await readEntryMarkdown(pagesDir, button, uiReactIndexSource)

    expect(markdown).toContain('## When to use')
    expect(markdown).toContain('<Button variant="primary">Save changes</Button>')
    expect(markdown).toContain("import { Button } from '@atom63/ui-react'")
    expect(markdown).toContain('## API surface')
    expect(markdown).toContain('## Related components')
  })

  it('expands generated changelog sections in the page twin', async () => {
    const entries = await readEntries(pagesDir)
    const changelog = entries.find(entry => entry.slug === 'architecture-changelog')
    const uiReactIndexSource = await fs.readFile(uiReactIndexPath, 'utf8')

    expect(changelog).toBeDefined()
    if (!changelog) {
      return
    }

    const markdown = await readEntryMarkdown(pagesDir, changelog, uiReactIndexSource)
    expect(markdown).toContain('## Unreleased')
    expect(markdown).toContain('## Released')
    expect(markdown).toContain('@atom63/ui-react')
  })
})
