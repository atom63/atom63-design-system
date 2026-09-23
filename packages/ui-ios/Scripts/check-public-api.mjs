import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const manifestPath = join(packageRoot, 'api', 'public-api.json')
const shouldWrite = process.argv.includes('--write')
execFileSync('swift', ['build', '--package-path', packageRoot, '--target', 'Atom63UI'], {
  stdio: 'inherit',
})
const buildDirectory = execFileSync(
  'swift',
  ['build', '--package-path', packageRoot, '--show-bin-path'],
  { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] }
).trim()
const targetInfo = JSON.parse(
  execFileSync('swift', ['-print-target-info'], {
    encoding: 'utf8',
  })
)
const sdkPath = execFileSync('xcrun', ['--sdk', 'macosx', '--show-sdk-path'], {
  encoding: 'utf8',
}).trim()
const symbolGraphDirectory = join(packageRoot, '.build', 'atom63-symbolgraph')

rmSync(symbolGraphDirectory, { recursive: true, force: true })
mkdirSync(symbolGraphDirectory, { recursive: true })
execFileSync(
  'xcrun',
  [
    'swift-symbolgraph-extract',
    '-module-name',
    'Atom63UI',
    '-I',
    join(buildDirectory, 'Modules'),
    '-target',
    targetInfo.target.triple,
    '-sdk',
    sdkPath,
    '-output-dir',
    symbolGraphDirectory,
    '-minimum-access-level',
    'public',
    '-pretty-print',
    '-skip-synthesized-members',
    '-skip-inherited-docs',
  ],
  { stdio: 'inherit' }
)

const symbolGraphPath = join(symbolGraphDirectory, 'Atom63UI.symbols.json')
if (!existsSync(symbolGraphPath)) {
  throw new Error('Atom63UI symbol graph was not emitted')
}

const symbolGraph = JSON.parse(readFileSync(symbolGraphPath, 'utf8'))
const sourceMarker = '/Sources/Atom63UI/'
const normalizeDeclaration = declaration =>
  declaration
    .replace(/@(?:_Concurrency\.)?MainActor\s+/g, '')
    .replace(/\bnonisolated\s+/g, '')
    .replace(/\s+/g, ' ')
    .trim()
const symbols = symbolGraph.symbols
  .filter(symbol => symbol.accessLevel === 'public' && symbol.location?.uri.includes(sourceMarker))
  .map(symbol => ({
    id: symbol.identifier.precise,
    kind: symbol.kind.identifier,
    path: symbol.pathComponents.join('.'),
    declaration: normalizeDeclaration(
      symbol.declarationFragments.map(fragment => fragment.spelling).join('')
    ),
    source: symbol.location.uri.split(sourceMarker)[1],
  }))
  .sort((left, right) => left.id.localeCompare(right.id))
const publicSymbolIds = new Set(symbols.map(symbol => symbol.id))
const relationships = symbolGraph.relationships
  .filter(relationship => publicSymbolIds.has(relationship.source))
  .filter(relationship => relationship.targetFallback !== 'Swift.SendableMetatype')
  .map(relationship => ({
    source: relationship.source,
    target: publicSymbolIds.has(relationship.target)
      ? relationship.target
      : `external:${(relationship.targetFallback ?? relationship.target).split('.').at(-1)}`,
    kind: relationship.kind,
  }))
  .sort((left, right) => {
    const sourceOrder = left.source.localeCompare(right.source)
    if (sourceOrder !== 0) return sourceOrder
    const kindOrder = left.kind.localeCompare(right.kind)
    return kindOrder !== 0 ? kindOrder : left.target.localeCompare(right.target)
  })

const manifest = `${JSON.stringify(
  {
    schemaVersion: 1,
    module: 'Atom63UI',
    symbolCount: symbols.length,
    symbols,
    relationships,
  },
  null,
  2
)}\n`

if (shouldWrite) {
  mkdirSync(dirname(manifestPath), { recursive: true })
  writeFileSync(manifestPath, manifest)
  console.log(`Wrote ${relative(process.cwd(), manifestPath)} (${symbols.length} symbols)`)
} else {
  if (!existsSync(manifestPath)) {
    throw new Error('Public API manifest is missing; run check:api:write')
  }
  const expected = readFileSync(manifestPath, 'utf8')
  if (expected !== manifest) {
    throw new Error('Atom63UI public API changed; run check:api:write and review the diff')
  }
  console.log(`Atom63UI public API matches ${symbols.length} frozen symbols`)
}
