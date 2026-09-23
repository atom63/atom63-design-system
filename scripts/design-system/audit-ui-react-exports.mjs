import { readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const repositoryRoot = resolve(scriptDirectory, '../..')
const rootSourcePath = 'packages/ui-react/src/index.ts'
const packageManifestPath = 'packages/ui-react/package.json'
const supportPolicyPath = 'docs/design-system/ui-react-support-policy.json'
const outputPath = 'docs/design-system/audits/ui-react-export-inventory.json'

function supportTier(name, source, supportPolicy) {
  if (supportPolicy.symbolTiers?.[name]) return supportPolicy.symbolTiers[name]

  for (const [prefix, tier] of Object.entries(supportPolicy.symbolPrefixTiers ?? {})) {
    if (name.startsWith(prefix)) return tier
  }

  return supportPolicy.sourceModuleTiers?.[source] ?? supportPolicy.defaultTier
}

function validateTier(tier, name, source, supportPolicy) {
  if (!tier || !supportPolicy.tiers?.[tier]) {
    throw new Error(
      `No valid support tier for ${name} from ${source}. Update ${supportPolicyPath}.`
    )
  }
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

function parseRootExports(source, supportPolicy) {
  const groups = new Map()
  const exportPattern = /export\s+(type\s+)?\{([\s\S]*?)\}\s+from\s+['"]([^'"]+)['"]/g

  for (const match of source.matchAll(exportPattern)) {
    const [, typeKeyword, body, sourceModule] = match
    const group = groups.get(sourceModule) ?? {
      source: sourceModule,
      values: [],
      types: [],
    }

    for (const rawSpecifier of body.split(',')) {
      if (!rawSpecifier.trim()) continue
      const { kind, name } = parseSpecifier(rawSpecifier, Boolean(typeKeyword))
      const proposedTier = supportTier(name, sourceModule, supportPolicy)
      validateTier(proposedTier, name, sourceModule, supportPolicy)
      group[kind === 'type' ? 'types' : 'values'].push({
        name,
        proposedTier,
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

function buildInventory(rootSource, packageManifest, supportPolicy) {
  const rootExports = parseRootExports(rootSource, supportPolicy)
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
    inputs: [rootSourcePath, packageManifestPath, supportPolicyPath],
    rootExportSource: rootSourcePath,
    tierSource: supportPolicyPath,
    tierDefinitions: supportPolicy.tiers,
    tierPolicy: {
      status: supportPolicy.status,
      effectiveFrom: supportPolicy.effectiveFrom,
      defaultTier: supportPolicy.defaultTier,
      stableBlockers: supportPolicy.stableBlockers,
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
const supportPolicy = JSON.parse(await readFile(resolve(repositoryRoot, supportPolicyPath), 'utf8'))
const inventory = buildInventory(rootSource, packageManifest, supportPolicy)
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
