import fs from 'node:fs/promises'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { readEntries, readEntryMarkdown } from './llms-txt'
import { readMdxBlockProps } from './mdx-block-props'

const pagesDir = path.resolve(process.cwd(), 'src/pages')

describe('MDX block props', () => {
  const props = readMdxBlockProps()
  const blocks = Object.keys(props).filter(name => !name.includes('.'))

  it('reads every block @atom63/mdx/blocks exports, with its parts', () => {
    expect(blocks.length).toBeGreaterThanOrEqual(30)
    expect(blocks).toEqual(expect.arrayContaining(['Callout', 'KeyIdea', 'VideoBlock', 'Steps']))
    expect(props['Steps.Step']?.map(row => row.name)).toContain('title')
  })

  it('reads types, defaults and doc comments from the source', () => {
    expect(props.KeyIdea).toContainEqual({
      name: 'label',
      type: 'ReactNode',
      required: false,
      defaultValue: "'Key idea'",
    })
    // An unexported literal alias is spelled out; a module constant becomes its value.
    expect(props.Callout?.find(row => row.name === 'type')?.type).toBe(
      "'info' | 'warning' | 'error' | 'success'"
    )
    expect(props.ImageCompare?.find(row => row.name === 'position')?.defaultValue).toBe('50')
    expect(props.VideoBlock?.find(row => row.name === 'trackLang')?.description).toMatch(/BCP 47/)
    // DOM attributes ImageCompare passes through are not listed as its props.
    expect(props.ImageCompare?.some(row => row.name === 'onClick')).toBe(false)
  })

  it('documents every block on the MDX blocks page', async () => {
    const page = await fs.readFile(path.join(pagesDir, 'pattern-mdx-blocks.mdx'), 'utf8')
    for (const name of blocks) {
      expect(page, name).toContain(`\n### ${name}\n`)
      expect(page, name).toContain(`\n<MdxBlockProps name="${name}" />\n`)
    }
  })

  it('spells the props tables out in the Markdown twin', async () => {
    const entry = (await readEntries(pagesDir)).find(item => item.slug === 'pattern-mdx-blocks')
    expect(entry).toBeDefined()
    const markdown = await readEntryMarkdown(pagesDir, entry!, '')
    expect(markdown).not.toContain('<MdxBlockProps')
    expect(markdown).toContain("- `label`: `ReactNode` (default `'Key idea'`)")
    expect(markdown).toContain('Props of `Steps.Step`:')
    expect(markdown).toContain('<KeyIdea title="One token architecture">')
  })
})
