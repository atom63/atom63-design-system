import { readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const repositoryRoot = resolve(scriptDirectory, '../..')
const rootSourcePath = 'packages/ui-react/src/index.ts'
const packageManifestPath = 'packages/ui-react/package.json'
const outputPath = 'docs/design-system/audits/ui-react-export-inventory.json'

const compositionModules = new Set([
  './components/command',
  './components/connected-panel',
  './components/context-menu',
  './components/dropdown-menu',
  './components/empty',
  './components/feedback-state',
  './components/frame',
  './components/hover-card',
  './components/item',
  './components/menubar',
  './components/navigation-menu',
  './components/preview-card',
  './components/sidebar',
  './components/sidebar-nav-tree',
])

const monitorModules = new Set([
  './components/animated-check',
  './components/autocomplete',
  './components/calendar',
  './components/carousel',
  './components/copy-button',
  './components/destination-link',
  './components/input-otp',
  './components/load-more-trigger',
  './components/marquee',
  './components/panel-setting-button',
  './components/portal-container',
  './components/progressive-blur',
  './components/text-ticker',
  './hooks/use-extract-color',
  './lib/extract-color',
])

const previewNames = new Set([
  'AlertDialogCreateHandle',
  'AlertDialogPrimitive',
  'AutocompletePrimitive',
  'AvatarPrimitive',
  'ButtonGroupProvider',
  'CommandCreateHandle',
  'DialogCreateHandle',
  'DialogPrimitive',
  'InputPrimitive',
  'ProgressPrimitive',
  'SeparatorPrimitive',
  'SheetPrimitive',
  'TooltipCreateHandle',
  'TooltipPrimitive',
  'cardLinkClassName',
  'navigationMenuTriggerStyle',
  'scrollableListControlClassNames',
  'selectTriggerDefaultClassName',
  'useButtonGroupContext',
])

function proposedTier(name, source) {
  if (
    previewNames.has(name) ||
    name.startsWith('ATOM63_') ||
    source === './conformance' ||
    source === './lib/motion'
  ) {
    return 'preview-experimental-candidate'
  }

  if (
    monitorModules.has(source) ||
    (source === './components/card' && /^(CardCursor|UseCardCursor|useCardCursor)/.test(name))
  ) {
    return 'monitor-high-risk'
  }

  if (compositionModules.has(source)) {
    return 'beta-supported-composition-conditional'
  }

  return 'beta-supported-core'
}

function parseSpecifier(specifier, statementIsType) {
  const withoutComments = specifier
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '')
    .trim()
  const isType = statementIsType || withoutComments.startsWith('type ')
  const declaration = withoutComments.replace(/^type\s+/, '').trim()
  const [importedName, exportedName = importedName] = declaration.split(/\s+as\s+/)

  return { kind: isType ? 'type' : 'value', name: exportedName.trim() }
}

function parseRootExports(source) {
  const groups = new Map()
  const exportPattern = /export\s+(type\s+)?\{([\s\S]*?)\}\s+from\s+['"]([^'"]+)['"]/g

  for (const match of source.matchAll(exportPattern)) {
    const [, typeKeyword, body, sourceModule] = match
    const group = groups.get(sourceModule) ?? { source: sourceModule, values: [], types: [] }

    for (const rawSpecifier of body.split(',')) {
      if (!rawSpecifier.trim()) continue
      const { kind, name } = parseSpecifier(rawSpecifier, Boolean(typeKeyword))
      group[kind === 'type' ? 'types' : 'values'].push({
        name,
        proposedTier: proposedTier(name, sourceModule),
      })
    }

    groups.set(sourceModule, group)
  }

  return [...groups.values()]
    .map(group => ({
      ...group,
      values: group.values.sort((left, right) => left.name.localeCompare(right.name)),
      types: group.types.sort((left, right) => left.name.localeCompare(right.name)),
    }))
    .sort((left, right) => left.source.localeCompare(right.source))
}

function packageExportTarget(value) {
  if (typeof value === 'string') return value
  return Object.fromEntries(
    Object.entries(value).sort(([left], [right]) => left.localeCompare(right))
  )
}

function buildInventory(rootSource, packageManifest) {
  const rootExports = parseRootExports(rootSource)
  const packageExports = Object.entries(packageManifest.exports)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([subpath, target]) => ({
      subpath,
      kind: subpath.endsWith('.css') ? 'css' : 'module',
      target: packageExportTarget(target),
    }))
  const rootValueExports = rootExports.flatMap(group => group.values)
  const rootTypeExports = rootExports.flatMap(group => group.types)

  return {
    schemaVersion: 1,
    inputs: [rootSourcePath, packageManifestPath],
    rootExportSource: rootSourcePath,
    tierSource: 'docs/design-system/ui-react-root-api-audit.md',
    tierDefinitions: {
      'beta-supported-core': 'Recommended beta-supported primitives and core components.',
      'beta-supported-composition-conditional':
        'Recommended beta support conditional on documentation and focused tests.',
      'monitor-high-risk': 'High-risk API to monitor before promising compatibility.',
      'preview-experimental-candidate':
        'Candidate for a preview or experimental boundary if export changes are approved later.',
    },
    counts: {
      rootValueExports: rootValueExports.length,
      rootTypeExports: rootTypeExports.length,
      packageExportKeys: packageExports.length,
      cssExportKeys: packageExports.filter(entry => entry.kind === 'css').length,
    },
    packageExportKeys: packageExports.map(entry => entry.subpath),
    cssExportKeys: packageExports.filter(entry => entry.kind === 'css').map(entry => entry.subpath),
    packageExports,
    rootExports,
  }
}

const rootSource = await readFile(resolve(repositoryRoot, rootSourcePath), 'utf8')
const packageManifest = JSON.parse(
  await readFile(resolve(repositoryRoot, packageManifestPath), 'utf8')
)
const inventory = buildInventory(rootSource, packageManifest)
const resolvedOutputPath = resolve(repositoryRoot, outputPath)
const rawInventory = `${JSON.stringify(inventory, null, 2)}\n`
let expected = rawInventory

try {
  const prettier = await import('prettier')
  const prettierConfig = (await prettier.resolveConfig(resolvedOutputPath)) ?? {}
  expected = await prettier.format(rawInventory, {
    ...prettierConfig,
    filepath: resolvedOutputPath,
  })
} catch {
  // Keep this audit runnable with Node alone when repository tooling is unavailable.
}

if (process.argv.includes('--write')) {
  await writeFile(resolvedOutputPath, expected)
  console.log(`Wrote @atom63/ui-react export inventory -> ${outputPath}`)
} else {
  let actual = ''
  try {
    actual = await readFile(resolvedOutputPath, 'utf8')
  } catch {
    // A missing inventory is reported as drift below.
  }

  if (actual !== expected) {
    console.error(`@atom63/ui-react export inventory is stale. Regenerate it with:`)
    console.error(`  pnpm check:ui-react-exports --write`)
    process.exitCode = 1
  } else {
    console.log(`@atom63/ui-react export inventory is current (${outputPath})`)
  }
}
