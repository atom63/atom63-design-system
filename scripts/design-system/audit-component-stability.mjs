import { access, readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import {
  fromRoot,
  readJson,
  relativeToRoot,
  uniqueSorted,
  walkFiles,
  writeAuditJson,
} from './audit-utils.mjs'

const componentsRoot = fromRoot('packages/ui-react/src/components')
const rootIndexPath = fromRoot('packages/ui-react/src/index.ts')
const catalogPath = fromRoot('apps/design-system/src/lib/component-catalog.ts')
const pagesRoot = fromRoot('apps/design-system/src/pages')
const packageManifestPath = fromRoot('packages/ui-react/package.json')

const [componentEntries, rootIndexSource, catalogSource, pageEntries, packageManifest] =
  await Promise.all([
    readdir(componentsRoot, { withFileTypes: true }),
    readFile(rootIndexPath, 'utf8'),
    readFile(catalogPath, 'utf8'),
    readdir(pagesRoot, { withFileTypes: true }),
    readJson(packageManifestPath),
  ])

const componentDirectories = componentEntries
  .filter(entry => entry.isDirectory())
  .map(entry => entry.name)
  .sort((a, b) => a.localeCompare(b))

const rootExportSlugs = uniqueSorted(
  [...rootIndexSource.matchAll(/from\s+['"]\.\/components\/([^'"]+)['"]/g)].map(match => match[1])
)

const catalogBySlug = new Map()
const catalogGroupPattern = /items:\s*components\(\s*'([^']+)'\s*,\s*\[([\s\S]*?)\]\s*\)/g
const catalogFactorySource =
  catalogSource.match(/function component\([\s\S]*?\n}\n\nfunction components/)?.[0] ?? ''
const defaultCatalogStatus = catalogFactorySource.match(/status:\s*'([^']+)'/)?.[1] ?? null

for (const groupMatch of catalogSource.matchAll(catalogGroupPattern)) {
  const category = groupMatch[1]
  for (const slugMatch of groupMatch[2].matchAll(/'([^']+)'/g)) {
    catalogBySlug.set(slugMatch[1], { category, status: defaultCatalogStatus })
  }
}

const authoredDocFiles = pageEntries
  .filter(entry => entry.isFile() && /^component-.+\.mdx$/.test(entry.name))
  .map(entry => entry.name)
  .sort((a, b) => a.localeCompare(b))
const authoredDocsBySlug = new Map(
  authoredDocFiles.map(fileName => [
    fileName.replace(/^component-/, '').replace(/\.mdx$/, ''),
    `apps/design-system/src/pages/${fileName}`,
  ])
)

const recipeExports = new Map(
  Object.entries(packageManifest.exports ?? {}).filter(([key, target]) => {
    return key.startsWith('./recipes/') && key.endsWith('.css') && typeof target === 'string'
  })
)

const allSlugs = uniqueSorted([
  ...componentDirectories,
  ...rootExportSlugs,
  ...catalogBySlug.keys(),
])

const components = []

for (const slug of allSlugs) {
  const componentDirectory = path.join(componentsRoot, slug)
  const sourceDirectoryPresent = componentDirectories.includes(slug)
  const files = sourceDirectoryPresent ? await walkFiles(componentDirectory) : []
  const stories = files
    .filter(file => /\.stories\.tsx$/.test(file))
    .map(relativeToRoot)
    .sort((a, b) => a.localeCompare(b))
  const tests = files
    .filter(file => /\.test\.tsx?$/.test(file))
    .map(relativeToRoot)
    .sort((a, b) => a.localeCompare(b))
  const recipeExport = `./recipes/${slug}.css`
  const recipeTarget = recipeExports.get(recipeExport) ?? null
  let recipeCssPresent = false

  if (recipeTarget) {
    try {
      await access(fromRoot('packages/ui-react', recipeTarget))
      recipeCssPresent = true
    } catch {
      recipeCssPresent = false
    }
  }

  const catalog = catalogBySlug.get(slug) ?? null
  const rootExportPresent = rootExportSlugs.includes(slug)
  const storyPresent = stories.length > 0
  const testPresent = tests.length > 0
  const generatedDocPresent = catalog !== null
  const authoredMdxPath = authoredDocsBySlug.get(slug) ?? null
  const stableEvidence =
    rootExportPresent &&
    storyPresent &&
    testPresent &&
    generatedDocPresent &&
    catalog?.status === 'stable'
  const recommendedLifecycle =
    !rootExportPresent || !generatedDocPresent
      ? 'internal-review'
      : stableEvidence
        ? 'stable'
        : 'preview'
  const lifecycleReasons = []

  if (!rootExportPresent) lifecycleReasons.push('not exported from the package root')
  if (!storyPresent) lifecycleReasons.push('no co-located story')
  if (!testPresent) lifecycleReasons.push('no co-located focused test')
  if (!generatedDocPresent) lifecycleReasons.push('not present in the generated component catalog')
  if (catalog && catalog.status !== 'stable') {
    lifecycleReasons.push(`catalog status is ${catalog.status}`)
  }

  components.push({
    slug,
    sourceDirectoryPresent,
    rootExportPresent,
    storyPresent,
    storyFiles: stories,
    testPresent,
    testFiles: tests,
    catalogStatus: catalog?.status ?? null,
    catalogCategory: catalog?.category ?? null,
    generatedDocPresent,
    authoredMdxPresent: authoredMdxPath !== null,
    authoredMdxPath,
    recipeCssPresent,
    recipeExport: recipeTarget ? recipeExport : null,
    recipeTarget,
    recommendedLifecycle,
    lifecycleReasons,
  })
}

const lifecycleCounts = Object.fromEntries(
  ['stable', 'preview', 'internal-review'].map(lifecycle => [
    lifecycle,
    components.filter(item => item.recommendedLifecycle === lifecycle).length,
  ])
)
const unmatchedAuthoredDocs = authoredDocFiles.filter(fileName => {
  const slug = fileName.replace(/^component-/, '').replace(/\.mdx$/, '')
  return !allSlugs.includes(slug)
})

const audit = {
  schemaVersion: 1,
  inputs: [
    'packages/ui-react/src/components/*',
    'packages/ui-react/src/index.ts',
    'packages/ui-react/src/**/*.stories.tsx',
    'packages/ui-react/src/**/*.test.ts?(x)',
    'packages/ui-react/package.json',
    'apps/design-system/src/lib/component-catalog.ts',
    'apps/design-system/src/pages/component-*.mdx',
  ],
  lifecycleRules: {
    stable:
      'Root export, co-located story, focused test, generated catalog documentation, and stable catalog status are all present.',
    preview:
      'The component is public and documented but is missing at least one stable evidence item.',
    'internal-review':
      'The source directory is not exported from the package root or is absent from the public generated catalog.',
    note: 'Authored MDX and recipe CSS are reported but do not gate stability because generated references and intentionally unstyled components are supported.',
  },
  summary: {
    componentRecords: components.length,
    sourceDirectories: componentDirectories.length,
    rootExportedFamilies: rootExportSlugs.length,
    catalogFamilies: catalogBySlug.size,
    generatedDocs: components.filter(item => item.generatedDocPresent).length,
    authoredComponentDocs: authoredDocFiles.length,
    authoredDocsMatchedToComponents: components.filter(item => item.authoredMdxPresent).length,
    componentsWithStories: components.filter(item => item.storyPresent).length,
    componentsWithTests: components.filter(item => item.testPresent).length,
    componentsWithRecipeCss: components.filter(item => item.recipeCssPresent).length,
    lifecycleCounts,
  },
  unmatchedAuthoredDocs: unmatchedAuthoredDocs.map(
    fileName => `apps/design-system/src/pages/${fileName}`
  ),
  components,
}

const outputPath = await writeAuditJson('docs/design-system/audits/component-stability.json', audit)

console.log(
  `Audited ${components.length} component records (${lifecycleCounts.stable} stable, ${lifecycleCounts.preview} preview, ${lifecycleCounts['internal-review']} internal review) -> ${relativeToRoot(outputPath)}`
)
