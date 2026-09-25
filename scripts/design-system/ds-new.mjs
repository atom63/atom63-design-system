/**
 * Scaffold a new web component and wire it into every registry the checks
 * read, then regenerate the audit files. The component starts presentational
 * (a sized, token-styled block); shape it from there.
 *
 * Usage:
 *   pnpm ds:new <slug> --archetype <id> --category <id> --summary <text>
 *     --usage <text> --related <slug,slug> [--dry-run] [--no-generate]
 *
 * --dry-run  checks the name, the options and every registry anchor, and
 *            lists what would change, without writing. CI runs it so a
 *            registry that changes shape breaks the scaffold at once.
 * --no-generate  writes the files but skips the builds and audit rewrites.
 *
 * Web only for now: a component with an iOS counterpart still needs the
 * cross-renderer steps the script prints at the end.
 */
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { parseArgs } from 'node:util'
import { fileURLToPath } from 'node:url'

import {
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
  foundationExportBlock,
  foundationFamily,
  insertCatalogDefinition,
  insertCatalogGroupSlug,
  insertExportBlock,
  insertRecipeExport,
  reactExportBlock,
  reactFamily,
  recipeFile,
  storyFile,
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

run('pnpm', ['exec', 'prettier', '--write', ...edits.keys(), ...created.keys()])

if (!values['no-generate']) {
  run('pnpm', ['--filter', '@atom63/ui-foundation', 'build'])
  run('pnpm', ['--filter', '@atom63/ui-react', 'build'])
  run('pnpm', ['check:ui-react-exports', '--write'])
  run('pnpm', ['check:ui-react-stable-actions', '--write'])
  run('pnpm', ['check:package-surface'])
  run('pnpm', ['api:report'])
  run('pnpm', ['--filter', '@atom63/ui-react', 'generate:utilities'])
}

process.stdout.write(`
Scaffolded ${pascal}. Next:
  1. Shape the contract, component, recipe and stories (search for TODO(ds:new)).
  2. Rerun \`pnpm api:report\` and \`pnpm check:ui-react-exports --write\` after the API settles.
  3. Push, then run the visual workflow with "update" on the branch to record baselines.
  4. Optional: a hand-written page at apps/docs/src/pages/component-${slug}.mdx.
With an iOS counterpart, also: add it to packages/ui-foundation/contracts/cross-renderer-contracts.json
and scripts/generate-cross-renderer-contracts.mjs, run \`pnpm --filter @atom63/ui-ios generate:swift\`,
add renderer-conformance evidence on both sides, write Atom${pascal}.swift, and add it to the iOS
demo catalog (see docs/design-system/cross-renderer-contracts.md).
`)
