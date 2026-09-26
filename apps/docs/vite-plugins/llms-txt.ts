import fs from 'node:fs/promises'
import path from 'node:path'
import type { Plugin } from 'vite'
import {
  craftCriteria,
  craftCriterionMarkdown,
} from '../../../scripts/design-system/lib/craft-rubric.mjs'
import {
  componentCatalogGroups,
  componentCatalogItems,
  componentDocSlug,
} from '../src/lib/component-catalog'
import {
  componentDocMarkdown,
  componentReferenceMarkdown,
  isComponentDocSlug,
} from '../src/lib/component-docs'
import {
  areaForSlug,
  DOC_AREA_DEFAULTS,
  DOC_AREA_IDS,
  DOC_AREA_LABELS,
  DOC_AREA_SECTIONS,
  type DocAreaId,
  labelFromSlug,
  parsePageSection,
  pathForDoc,
  sortSlugs,
} from '../src/lib/doc-taxonomy'
import { mdxToMarkdown } from '../src/lib/mdx-to-markdown'
import { buildChangelogMarkdown } from './changelog-data'

const SITE_TITLE = 'ATOM63 Design System'
const SITE_SUMMARY =
  'Atom63 Design System — one token architecture rendered in React, SwiftUI, and Figma: tokens, themes, component contracts, and components.'

export type DocEntry = {
  area: DocAreaId
  componentSlug?: string
  label: string
  route: string
  slug: string
}

export async function readEntries(pagesDir: string): Promise<DocEntry[]> {
  const files = await fs.readdir(pagesDir)
  const slugs = files.filter(file => file.endsWith('.mdx')).map(file => file.slice(0, -4))
  const discoveredSlugs = new Set(slugs)

  for (const item of componentCatalogItems) {
    const slug = componentDocSlug(item.slug)
    if (!discoveredSlugs.has(slug)) {
      slugs.push(slug)
    }
  }

  const entries = new Map<string, DocEntry>()
  entries.set('home', {
    area: 'architecture',
    label: 'Design system home',
    route: '/',
    slug: 'home',
  })
  for (const slug of slugs) {
    if (slug === 'home') {
      continue
    }

    const area = areaForSlug(slug)
    const componentItem = componentCatalogItems.find(item => componentDocSlug(item.slug) === slug)
    entries.set(slug, {
      area,
      componentSlug: discoveredSlugs.has(slug) ? undefined : componentItem?.slug,
      label: labelFromSlug(slug),
      route: pathForDoc(area, slug),
      slug,
    })
  }

  const ordered: DocEntry[] = []
  const appended = new Set<string>()
  const append = (slug: string) => {
    const entry = entries.get(slug)
    if (entry && !appended.has(slug)) {
      ordered.push(entry)
      appended.add(slug)
    }
  }

  append('home')
  for (const area of DOC_AREA_IDS) {
    append(DOC_AREA_DEFAULTS[area])

    for (const [section] of DOC_AREA_SECTIONS[area]) {
      const sectionSlugs = slugs.filter(slug => parsePageSection(slug) === section)
      if (section === 'component') {
        const catalogSlugs = new Set(componentCatalogItems.map(item => componentDocSlug(item.slug)))
        for (const slug of sortSlugs(
          section,
          sectionSlugs.filter(slug => !catalogSlugs.has(slug))
        )) {
          append(slug)
        }
        for (const group of componentCatalogGroups) {
          for (const item of group.items) {
            append(componentDocSlug(item.slug))
          }
        }
        continue
      }

      for (const slug of sortSlugs(section, sectionSlugs)) {
        append(slug)
      }
    }
  }

  for (const slug of slugs) {
    append(slug)
  }

  return ordered
}

/** `/` -> `/index.md`, `/components/component-button` -> `/components/component-button.md` */
export function markdownRoute(route: string): string {
  return route === '/' ? '/index.md' : `${route}.md`
}

function firstParagraph(source: string): string {
  const body = source
    .split('\n')
    .filter(line => !line.startsWith('#'))
    .join('\n')
    .trim()

  const paragraph = body.split('\n\n')[0] ?? ''
  return paragraph.replace(/\s+/g, ' ').slice(0, 200)
}

/** The craft rubric page renders each criterion from data; spell it out for the Markdown twin. */
function expandCraftCriteria(source: string): string {
  return source.replace(/^<CraftCriterion id="([^"]+)" \/>$/gm, (tag, id: string) => {
    const criterion = craftCriteria.find(entry => entry.id === id)
    return criterion ? craftCriterionMarkdown(criterion) : tag
  })
}

async function readUiReactIndexSource(pagesDir: string): Promise<string> {
  return fs.readFile(path.resolve(pagesDir, '../../../../packages/ui-react/src/index.ts'), 'utf8')
}

export async function readEntryMarkdown(
  pagesDir: string,
  entry: DocEntry,
  uiReactIndexSource: string
): Promise<string> {
  if (entry.slug === 'architecture-changelog') {
    return buildChangelogMarkdown(path.resolve(pagesDir, '../../../..'))
  }

  if (entry.componentSlug) {
    return componentDocMarkdown(entry.componentSlug, uiReactIndexSource)
  }

  const source = await fs.readFile(path.join(pagesDir, `${entry.slug}.mdx`), 'utf8')
  const markdown = mdxToMarkdown(expandCraftCriteria(source))
  if (!isComponentDocSlug(entry.slug)) {
    return markdown
  }

  const componentSlug = componentCatalogItems.find(
    item => componentDocSlug(item.slug) === entry.slug
  )?.slug
  const reference = componentSlug
    ? componentReferenceMarkdown(componentSlug, uiReactIndexSource)
    : ''
  return reference ? `${markdown}\n\n${reference}` : markdown
}

export async function buildLlmsTxt(
  pagesDir: string,
  entries: DocEntry[],
  uiReactIndexSource: string
): Promise<string> {
  const byArea = new Map<DocAreaId, DocEntry[]>()
  for (const entry of entries) {
    byArea.set(entry.area, [...(byArea.get(entry.area) ?? []), entry])
  }

  const sections = await Promise.all(
    DOC_AREA_IDS.filter(area => byArea.has(area)).map(async area => {
      const lines = await Promise.all(
        (byArea.get(area) ?? []).map(async entry => {
          const source = await readEntryMarkdown(pagesDir, entry, uiReactIndexSource)
          return `- [${entry.label}](${markdownRoute(entry.route)}): ${firstParagraph(source)}`
        })
      )
      return `## ${DOC_AREA_LABELS[area]}\n\n${lines.join('\n')}`
    })
  )

  return `# ${SITE_TITLE}\n\n> ${SITE_SUMMARY}\n\n${sections.join('\n\n')}\n`
}

/** Route (`/components/component-button`) -> page slug, mirroring `pathForDoc`. */
function slugForMarkdownRequest(url: string, entries: DocEntry[]): string | null {
  return entries.find(entry => markdownRoute(entry.route) === url)?.slug ?? null
}

const VIRTUAL_MARKDOWN_ID = 'virtual:atom63-doc-markdown'
const RESOLVED_MARKDOWN_ID = `\0${VIRTUAL_MARKDOWN_ID}`

async function buildMarkdownModule(pagesDir: string): Promise<string> {
  const entries = await readEntries(pagesDir)
  const uiReactIndexSource = await readUiReactIndexSource(pagesDir)
  const pairs = await Promise.all(
    entries.map(async entry => {
      return [entry.slug, await readEntryMarkdown(pagesDir, entry, uiReactIndexSource)] as const
    })
  )

  return `export default ${JSON.stringify(Object.fromEntries(pairs))}\n`
}

/**
 * Serves `llms.txt`, per-page `.md` twins, and a `virtual:atom63-doc-markdown`
 * module the client search index reads. The MDX plugin compiles `.mdx` before
 * Vite's `?raw` suffix applies, so plain markdown has to come from here.
 */
export function llmsTxtPlugin(appRoot: string): Plugin {
  const pagesDir = path.join(appRoot, 'src/pages')

  return {
    name: 'design-system-llms-txt',

    resolveId(id) {
      return id === VIRTUAL_MARKDOWN_ID ? RESOLVED_MARKDOWN_ID : null
    },

    async load(id) {
      return id === RESOLVED_MARKDOWN_ID ? await buildMarkdownModule(pagesDir) : null
    },

    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = (req.url ?? '').split('?')[0] ?? ''

        if (url === '/llms.txt') {
          const entries = await readEntries(pagesDir)
          const uiReactIndexSource = await readUiReactIndexSource(pagesDir)
          res.setHeader('Content-Type', 'text/plain; charset=utf-8')
          res.end(await buildLlmsTxt(pagesDir, entries, uiReactIndexSource))
          return
        }

        if (!url.endsWith('.md')) {
          next()
          return
        }

        const entries = await readEntries(pagesDir)
        const slug = slugForMarkdownRequest(url, entries)
        if (!slug) {
          next()
          return
        }

        const entry = entries.find(candidate => candidate.slug === slug)
        if (!entry) {
          next()
          return
        }
        const uiReactIndexSource = await readUiReactIndexSource(pagesDir)
        const source = await readEntryMarkdown(pagesDir, entry, uiReactIndexSource)
        res.setHeader('Content-Type', 'text/markdown; charset=utf-8')
        res.end(`${source}\n`)
      })
    },

    async generateBundle() {
      const entries = await readEntries(pagesDir)
      const uiReactIndexSource = await readUiReactIndexSource(pagesDir)

      this.emitFile({
        type: 'asset',
        fileName: 'llms.txt',
        source: await buildLlmsTxt(pagesDir, entries, uiReactIndexSource),
      })

      for (const entry of entries) {
        const source = await readEntryMarkdown(pagesDir, entry, uiReactIndexSource)
        const fileName = markdownRoute(entry.route).slice(1)
        this.emitFile({ type: 'asset', fileName, source: `${source}\n` })
      }
    },
  }
}
