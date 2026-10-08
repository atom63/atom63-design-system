/**
 * Builds the agent index: one JSON file that holds every answer the `atom63`
 * CLI and MCP server give, so a query needs no repo, network or build.
 *
 * It reads the same sources the packages and the docs site are built from.
 * The docs site's own TypeScript helpers (catalog, component docs, contract
 * docs, llms Markdown) load through a Vite SSR server with the
 * `@atom63/source` condition, so the docs pages and the index share one
 * implementation and nothing needs a prebuilt dist.
 *
 * Usage: node packages/cli/scripts/build-index.mjs [--check]
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

import { createServer, defaultServerConditions } from 'vite'

import {
  importSpecifiers,
  parseTemplateMetadata,
} from '../../../scripts/design-system/lib/templates-check.mjs'

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const root = path.resolve(packageRoot, '../..')
const indexPath = path.join(packageRoot, 'generated/agent-index.json')
const read = relative => readFileSync(path.join(root, relative), 'utf8')

const conditions = ['@atom63/source', ...defaultServerConditions]
const server = await createServer({
  appType: 'custom',
  configFile: false,
  logLevel: 'silent',
  optimizeDeps: { include: [], noDiscovery: true },
  root,
  server: { hmr: false, middlewareMode: true, watch: null },
  ssr: { noExternal: [/^@atom63\//], resolve: { conditions, externalConditions: conditions } },
})

let index
try {
  const load = relative => server.ssrLoadModule(path.join(root, relative))
  const catalog = await load('apps/docs/src/lib/component-catalog.ts')
  const componentDocs = await load('apps/docs/src/lib/component-docs.ts')
  const contracts = await load('apps/docs/src/lib/component-contract.ts')
  const llms = await load('apps/docs/vite-plugins/llms-txt.ts')

  const uiReactIndexSource = read('packages/ui-react/src/index.ts')
  const pagesDir = path.join(root, 'apps/docs/src/pages')

  const components = catalog.componentCatalogItems.map(item => {
    const doc = componentDocs.getComponentDoc(item.slug)
    const group = catalog.componentCatalogGroupForSlug(item.slug)
    const storyPath = `packages/ui-react/src/components/${item.slug}/${item.slug}.stories.tsx`
    const storySource = existsSync(path.join(root, storyPath)) ? read(storyPath) : null
    return {
      axisGuidance: item.axisGuidance ?? null,
      contract: contracts.getComponentContractDoc(item.slug),
      exports: componentDocs.componentExportSurface(item.slug, uiReactIndexSource),
      group: group ? { id: group.id, title: group.title } : null,
      guidance: [...doc.guidance],
      importPath: item.importPath,
      label: doc.label,
      markdown: componentDocs.componentDocMarkdown(item.slug, uiReactIndexSource),
      related: [...item.relatedSlugs],
      slug: item.slug,
      status: item.status,
      stories: storySource
        ? { file: storyPath, names: storyNames(storySource), source: storySource }
        : null,
      summary: item.summary,
      usage: item.usage,
      usageExports: [...item.usageExports],
    }
  })

  const docs = []
  for (const entry of await llms.readEntries(pagesDir)) {
    // Component pages are in `components`. The changelog changes with every
    // release, which would make the index stale after each version bump.
    if (entry.componentSlug || entry.slug === 'architecture-changelog') continue
    docs.push({
      area: entry.area,
      label: entry.label,
      markdown: await llms.readEntryMarkdown(pagesDir, entry, uiReactIndexSource),
      route: entry.route,
      slug: entry.slug,
    })
  }

  index = {
    schemaVersion: 1,
    generatedBy: 'packages/cli/scripts/build-index.mjs',
    components,
    docs: docs.sort((left, right) => left.slug.localeCompare(right.slug)),
    templates: templates(components),
    tokens: tokens(),
  }
} finally {
  await server.close()
}

/** Story export names in declaration order: `export const Sizes: Story = …`. */
function storyNames(source) {
  return [...source.matchAll(/^export const ([A-Z]\w*)\s*:\s*Story\b/gm)].map(match => match[1])
}

/** Names imported from a module: `import { A, type B, C as D } from 'x'` → A, C. */
function namedImports(source, specifier) {
  const names = []
  const pattern = new RegExp(`import\\s*\\{([^}]*)\\}\\s*from\\s*'${specifier}'`, 'g')
  for (const match of source.matchAll(pattern)) {
    for (const part of match[1].split(',')) {
      const name = part.trim()
      if (name && !name.startsWith('type ')) names.push(name.split(/\s+as\s+/)[0])
    }
  }
  return names
}

/** The package a specifier names: `@atom63/ui-react/layout` → `@atom63/ui-react`. */
function packageName(specifier) {
  const parts = specifier.split('/')
  return specifier.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0]
}

/**
 * Page and block templates from packages/templates, pages first. The files
 * are the template's folder without its stories; `componentsUsed` is derived
 * from the design system imports, so it cannot drift from the source.
 */
function templates(components) {
  const srcDir = path.join(root, 'packages/templates/src')
  const slugByExport = new Map(
    components.flatMap(component => component.exports.values.map(name => [name, component.slug]))
  )
  const entries = []
  for (const [dir, kind] of [
    ['pages', 'page'],
    ['blocks', 'block'],
  ]) {
    for (const id of readdirSync(path.join(srcDir, dir)).sort()) {
      const folder = path.join(srcDir, dir, id)
      const files = readdirSync(folder)
        .filter(name => /\.(ts|tsx)$/.test(name) && !/\.(stories|test)\.tsx?$/.test(name))
        .sort()
        .map(name => ({
          path: `${dir}/${id}/${name}`,
          source: readFileSync(path.join(folder, name), 'utf8'),
        }))
      const main = files.find(file => file.path.endsWith(`/${id}.tsx`))
      const metadata = parseTemplateMetadata(main.source)
      const sources = files.map(file => file.source)
      const imported = sources.flatMap(source => [
        ...namedImports(source, '@atom63/ui-react'),
        ...namedImports(source, '@atom63/ui-react/layout'),
      ])
      const specifiers = sources.flatMap(importSpecifiers)
      entries.push({
        id,
        kind,
        title: metadata.title,
        description: metadata.description,
        category: metadata.category,
        tags: [...metadata.tags],
        readiness: metadata.readiness,
        componentsUsed: [...new Set(imported.map(name => slugByExport.get(name) ?? name))].sort(),
        blocksUsed: [
          ...new Set(
            specifiers
              .filter(specifier => specifier.startsWith('.'))
              .map(specifier => path.posix.join(dir, id, specifier))
              .flatMap(target => target.match(/^blocks\/([^/]+)\//)?.[1] ?? [])
              .filter(block => block !== id)
          ),
        ].sort(),
        packages: [
          ...new Set(specifiers.filter(specifier => !specifier.startsWith('.')).map(packageName)),
        ].sort(),
        files,
      })
    }
  }
  return entries
}

/** Swift color names keyed by the CSS variable they are generated from. */
function swiftColorNames() {
  const source = read('packages/ui-ios/Scripts/generate-swift-tokens.mjs')
  const block = /const colors = \{([\s\S]*?)\n\}/.exec(source)
  if (!block) throw new Error('generate-swift-tokens.mjs has no colors map')
  return new Map(
    [...block[1].matchAll(/^\s*(\w+): '(--[\w-]+)',/gm)].map(([, swift, cssVar]) => [
      cssVar,
      `AtomTokens.Color.${swift}`,
    ])
  )
}

/**
 * One record per CSS variable, with every context it is defined in (mode,
 * theme, brand scopes) and where it lives in Figma and Swift.
 */
function tokens() {
  const manifest = JSON.parse(read('packages/styles/generated/atom63.tokens.json'))
  const swift = swiftColorNames()
  const byVar = new Map()
  for (const entry of manifest.entries) {
    const token = byVar.get(entry.cssVar) ?? {
      cssVar: entry.cssVar,
      figma: null,
      layer: entry.layer,
      swift: swift.get(entry.cssVar) ?? null,
      type: entry.type,
      values: [],
    }
    token.values.push({ scope: entry.scope ?? ':root', value: entry.value })
    if (!token.figma && entry.figma) {
      token.figma = { collection: entry.figma.collection, path: entry.figma.path }
    }
    byVar.set(entry.cssVar, token)
  }
  return [...byVar.values()].sort((left, right) => left.cssVar.localeCompare(right.cssVar))
}

const output = `${JSON.stringify(index, null, 1)}\n`

if (process.argv.includes('--check')) {
  const current = existsSync(indexPath) ? readFileSync(indexPath, 'utf8') : ''
  if (current !== output) {
    process.stderr.write(
      'The agent index is stale. Run `pnpm --filter @atom63/cli generate:index` and commit it.\n'
    )
    process.exit(1)
  }
  process.stdout.write('Agent index is current.\n')
} else {
  writeFileSync(indexPath, output)
  process.stdout.write(
    `Wrote ${path.relative(root, indexPath)}: ${index.components.length} components, ${index.docs.length} docs pages, ${index.templates.length} templates, ${index.tokens.length} tokens.\n`
  )
}
