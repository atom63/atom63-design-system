/**
 * The shadcn registry for @atom63/templates (T8 in
 * docs/design-system/template-library-plan.md), generated from the agent
 * index so it lists exactly the templates, files and dependencies the
 * `atom63` CLI knows. Writes `registry.json` and one built item per template
 * (files with their content) to apps/docs/public/r, which the docs site
 * serves at https://system.atom63.io/r/.
 *
 * Every file installs under `@components/atom63/`, keeping the `pages/<id>/`
 * and `blocks/<id>/` layout, so the templates' relative imports still resolve
 * in the consuming project. A page lists the blocks it uses as registry
 * dependencies by URL, so `shadcn add` installs them too.
 *
 * Usage: node scripts/design-system/build-registry.mjs [--check]
 *   [--base <url>] [--out <dir>]   (for installing from a local server)
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const option = name => {
  const at = process.argv.indexOf(`--${name}`)
  return at === -1 ? undefined : process.argv[at + 1]
}
const base = (option('base') ?? 'https://system.atom63.io').replace(/\/$/, '')
const outDir = path.resolve(root, option('out') ?? 'apps/docs/public/r')
const check = process.argv.includes('--check')

const index = JSON.parse(
  readFileSync(path.join(root, 'packages/cli/generated/agent-index.json'), 'utf8')
)

const itemUrl = id => `${base}/r/${id}.json`

function item(template) {
  return {
    $schema: 'https://ui.shadcn.com/schema/registry-item.json',
    name: template.id,
    type: template.kind === 'page' ? 'registry:page' : 'registry:block',
    title: template.title,
    description: template.description,
    // React comes with the project; the design system and icons may not.
    dependencies: template.packages.filter(name => name !== 'react'),
    registryDependencies: template.blocksUsed.map(itemUrl),
    files: template.files.map(file => ({
      path: `templates/${file.path}`,
      type: template.kind === 'page' ? 'registry:page' : 'registry:component',
      target: `@components/atom63/${file.path}`,
      content: file.source,
    })),
    categories: [template.category],
    meta: { readiness: template.readiness, tags: template.tags },
    docs: 'Needs the Atom63 token stack and recipes in your CSS, as an @atom63/create app sets up: https://system.atom63.io/patterns/pattern-templates',
  }
}

const json = value => `${JSON.stringify(value, null, 2)}\n`

const outputs = new Map()
outputs.set(
  'registry.json',
  json({
    $schema: 'https://ui.shadcn.com/schema/registry.json',
    name: 'atom63',
    homepage: 'https://system.atom63.io/patterns/pattern-templates',
    items: index.templates.map(template => {
      const { files, ...rest } = item(template)
      return { ...rest, files: files.map(({ content, ...file }) => file) }
    }),
  })
)
for (const template of index.templates) outputs.set(`${template.id}.json`, json(item(template)))

if (check) {
  const stale = [...outputs].filter(([name, content]) => {
    const file = path.join(outDir, name)
    return !existsSync(file) || readFileSync(file, 'utf8') !== content
  })
  const extra = existsSync(outDir) ? readdirSync(outDir).filter(name => !outputs.has(name)) : []
  if (stale.length > 0 || extra.length > 0) {
    process.stderr.write(
      `The shadcn registry is stale (${[...stale.map(([name]) => name), ...extra].join(', ')}). Run \`pnpm build:registry\` and commit it.\n`
    )
    process.exit(1)
  }
  process.stdout.write(`The shadcn registry is current (${index.templates.length} items).\n`)
} else {
  rmSync(outDir, { recursive: true, force: true })
  mkdirSync(outDir, { recursive: true })
  for (const [name, content] of outputs) writeFileSync(path.join(outDir, name), content)
  process.stdout.write(
    `Wrote ${outputs.size} files to ${path.relative(root, outDir) || outDir} (${index.templates.length} items, base ${base}).\n`
  )
}
