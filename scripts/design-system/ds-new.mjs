/**
 * Scaffold a new web component and wire it into every registry the checks
 * read, then regenerate the audit files. The component starts presentational
 * (a sized, token-styled block); shape it from there.
 *
 * Usage:
 *   pnpm ds:new <slug> --archetype <id> --category <id> --summary <text>
 *     --usage <text> --related <slug,slug> [--ios [--ios-section <id>]
 *     [--ios-symbol <sf symbol>]] [--dry-run] [--no-generate]
 *
 * --ios  also scaffolds the SwiftUI counterpart: a cross-renderer contract,
 *        conformance evidence on both sides, Atom<Name>.swift, and an iOS
 *        demo catalog entry with a showcase. The section defaults from
 *        --category; the symbol defaults to square.dashed.
 * --dry-run  checks the name, the options and every registry anchor, and
 *            lists what would change, without writing. CI runs it so a
 *            registry that changes shape breaks the scaffold at once.
 * --no-generate  writes the files but skips the builds and audit rewrites.

 */
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { parseArgs } from 'node:util'
import { fileURLToPath } from 'node:url'

import {
  addCrossRendererContract,
  addDemoCatalogItem,
  addDemoShowcase,
  addReactConformance,
  addSwiftConformance,
  addToArchetype,
  appendRecipeImport,
  archetypeIds,
  catalogCategories,
  catalogSlugs,
  changesetFile,
  componentFile,
  componentIndexFile,
  componentNames,
  contractFile,
  demoSections,
  foundationExportBlock,
  foundationFamily,
  insertCatalogDefinition,
  insertCatalogGroupSlug,
  insertExportBlock,
  insertRecipeExport,
  iosSectionForCategory,
  reactExportBlock,
  reactFamily,
  recipeFile,
  storyFile,
  swiftViewFile,
  testFile,
} from './lib/ds-new.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const read = relative => readFileSync(path.join(root, relative), 'utf8')

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    archetype: { type: 'string' },
    category: { type: 'string' },
    summary: { type: 'string' },
    usage: { type: 'string' },
    related: { type: 'string' },
    ios: { type: 'boolean', default: false },
    'ios-section': { type: 'string' },
    'ios-symbol': { type: 'string', default: 'square.dashed' },
    'dry-run': { type: 'boolean', default: false },
    'no-generate': { type: 'boolean', default: false },
  },
})

function fail(message) {
  process.stderr.write(`ds:new: ${message}\n`)
  process.exit(1)
}

if (positionals.length !== 1) fail('pass exactly one component name, e.g. `pnpm ds:new stat-meter`')
let names
try {
  names = componentNames(positionals[0])
} catch (error) {
  fail(error.message)
}
const { slug, pascal } = names

const paths = {
  archetypes: 'packages/ui-foundation/src/visual-archetypes.ts',
  foundationIndex: 'packages/ui-foundation/src/index.ts',
  reactIndex: 'packages/ui-react/src/index.ts',
  reactPackage: 'packages/ui-react/package.json',
  recipes: 'packages/ui-react/src/styles/recipes.css',
  catalog: 'apps/docs/src/lib/component-catalog.ts',
  contract: `packages/ui-foundation/src/components/${slug}/${slug}-contract.ts`,
  component: `packages/ui-react/src/components/${slug}`,
  changeset: `.changeset/add-${slug}.md`,
  crossRenderer: 'packages/ui-foundation/contracts/cross-renderer-contracts.json',
  reactConformance: 'packages/ui-react/src/conformance/renderer-conformance.ts',
  swiftConformance: 'packages/ui-ios/Sources/Atom63UI/AtomRendererConformance.swift',
  swiftView: `packages/ui-ios/Sources/Atom63UI/Atom${pascal}.swift`,
  demoCatalog: 'examples/ios-demo/Atom63Demo/CatalogRegistry.swift',
  demoShowcases: 'examples/ios-demo/Atom63Demo/CatalogShowcases.swift',
}

const archetypes = archetypeIds(read(paths.archetypes))
const catalogSource = read(paths.catalog)
const categories = catalogCategories(catalogSource)
const knownSlugs = catalogSlugs(catalogSource)
const related = (values.related ?? '')
  .split(',')
  .map(item => item.trim())
  .filter(Boolean)

const problems = []
if (existsSync(path.join(root, paths.component))) problems.push(`${paths.component} already exists`)
if (!archetypes.includes(values.archetype)) {
  problems.push(`--archetype must be one of: ${archetypes.join(', ')}`)
}
if (!categories.includes(values.category)) {
  problems.push(`--category must be one of: ${categories.join(', ')}`)
}
for (const [option, text] of [
  ['summary', values.summary],
  ['usage', values.usage],
]) {
  if (!text || text.length <= 20)
    problems.push(`--${option} must be a sentence longer than 20 characters`)
}
if (related.length < 2) problems.push('--related needs at least two existing component slugs')
const unknown = related.filter(item => !knownSlugs.includes(item))
if (unknown.length > 0) problems.push(`--related names unknown slugs: ${unknown.join(', ')}`)
const iosSections = demoSections(read(paths.demoCatalog))
const iosSection = values['ios-section'] ?? iosSectionForCategory[values.category]
if (values.ios && !iosSections.includes(iosSection)) {
  problems.push(`--ios-section must be one of: ${iosSections.join(', ')}`)
}
if (problems.length > 0) fail(`\n  ${problems.join('\n  ')}`)

/* Every edit is computed before anything is written, so a missing anchor
   leaves the tree untouched. */
const edits = new Map()
try {
  edits.set(paths.archetypes, addToArchetype(read(paths.archetypes), values.archetype, pascal))
  edits.set(
    paths.foundationIndex,
    insertExportBlock(
      read(paths.foundationIndex),
      slug,
      foundationExportBlock(names),
      foundationFamily
    )
  )
  edits.set(
    paths.reactIndex,
    insertExportBlock(read(paths.reactIndex), slug, reactExportBlock(names), reactFamily)
  )
  edits.set(paths.reactPackage, insertRecipeExport(read(paths.reactPackage), slug))
  edits.set(paths.recipes, appendRecipeImport(read(paths.recipes), slug))
  edits.set(
    paths.catalog,
    insertCatalogGroupSlug(
      insertCatalogDefinition(catalogSource, slug, {
        relatedSlugs: related,
        summary: values.summary,
        usage: values.usage,
        usageExports: [pascal],
      }),
      values.category,
      slug
    )
  )
  if (values.ios) {
    edits.set(
      paths.crossRenderer,
      addCrossRendererContract(read(paths.crossRenderer), names, values.summary)
    )
    edits.set(paths.reactConformance, addReactConformance(read(paths.reactConformance), names))
    edits.set(paths.swiftConformance, addSwiftConformance(read(paths.swiftConformance), names))
    edits.set(
      paths.demoCatalog,
      addDemoCatalogItem(read(paths.demoCatalog), names, {
        section: iosSection,
        symbol: values['ios-symbol'],
        summary: values.summary,
      })
    )
    edits.set(paths.demoShowcases, addDemoShowcase(read(paths.demoShowcases), names))
  }
} catch (error) {
  fail(`a registry no longer has the shape the scaffold expects: ${error.message}`)
}

const created = new Map([
  [paths.contract, contractFile(names, values.archetype)],
  [`${paths.component}/index.ts`, componentIndexFile(names)],
  [`${paths.component}/${slug}.tsx`, componentFile(names)],
  [`${paths.component}/${slug}.css`, recipeFile(names, values.archetype)],
  [`${paths.component}/${slug}.stories.tsx`, storyFile(names)],
  [`${paths.component}/${slug}.test.tsx`, testFile(names)],
  [paths.changeset, changesetFile(names, values.summary)],
])
if (values.ios) created.set(paths.swiftView, swiftViewFile(names))

if (values['dry-run']) {
  process.stdout.write(`ds:new ${slug} (dry run): every registry anchor resolved.\n`)
  for (const file of edits.keys()) process.stdout.write(`  edit    ${file}\n`)
  for (const file of created.keys()) process.stdout.write(`  create  ${file}\n`)
  process.exit(0)
}

for (const [file, text] of edits) writeFileSync(path.join(root, file), text)
for (const [file, text] of created) {
  mkdirSync(path.dirname(path.join(root, file)), { recursive: true })
  writeFileSync(path.join(root, file), text)
}

const run = (command, args) => {
  process.stdout.write(`\n$ ${command} ${args.join(' ')}\n`)
  execFileSync(command, args, { cwd: root, stdio: 'inherit' })
}

const formatted = [...edits.keys(), ...created.keys()].filter(file => !file.endsWith('.swift'))
run('pnpm', ['exec', 'prettier', '--write', ...formatted])
// The generated TypeScript and Swift contracts follow the JSON source.
if (values.ios) run('node', ['scripts/generate-cross-renderer-contracts.mjs'])

if (!values['no-generate']) {
  run('pnpm', ['--filter', '@atom63/ui-foundation', 'build'])
  run('pnpm', ['--filter', '@atom63/ui-react', 'build'])
  run('pnpm', ['check:ui-react-exports', '--write'])
  run('pnpm', ['check:ui-react-stable-actions', '--write'])
  run('pnpm', ['check:package-surface'])
  run('pnpm', ['api:report'])
  run('pnpm', ['--filter', '@atom63/ui-react', 'generate:utilities'])
  // The Swift public API report needs a Swift toolchain, so only macOS writes it.
  if (values.ios && process.platform === 'darwin') {
    run('node', ['packages/ui-ios/Scripts/check-public-api.mjs', '--write'])
  }
}

const iosNext = values.ios
  ? `  5. Fill in the TODO(ds:new) intent, outcomes and adaptations in cross-renderer-contracts.json,
     keep both conformance entries in step, and shape Atom${pascal}.swift and its showcase.
     Run \`pnpm --filter @atom63/ui-ios test:swift\` and \`test:app\` on a Mac.
`
  : `With an iOS counterpart, rerun with --ios instead of adding the Swift side by hand.
`

process.stdout.write(`
Scaffolded ${pascal}. Next:
  1. Shape the contract, component, recipe and stories (search for TODO(ds:new)).
  2. Rerun \`pnpm api:report\` and \`pnpm check:ui-react-exports --write\` after the API settles.
  3. Push, then run the visual workflow with "update" on the branch to record baselines.
  4. Optional: a hand-written page at apps/docs/src/pages/component-${slug}.mdx.
${iosNext}`)
