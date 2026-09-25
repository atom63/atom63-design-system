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
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

import { createServer, defaultServerConditions } from 'vite'

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
    tokens: tokens(),
  }
} finally {
  await server.close()
}

/** Story export names in declaration order: `export const Sizes: Story = …`. */
function storyNames(source) {
  return [...source.matchAll(/^export const ([A-Z]\w*)\s*:\s*Story\b/gm)].map(match => match[1])
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
    `Wrote ${path.relative(root, indexPath)}: ${index.components.length} components, ${index.docs.length} docs pages, ${index.tokens.length} tokens.\n`
  )
}
