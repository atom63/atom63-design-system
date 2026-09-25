/**
 * Plans and writes a new Atom63 project: the shared base plus the files of
 * one kind, with package.json built here so every version comes from this
 * repo (the design system packages at their released versions, everything
 * else as the repo pins it).
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { agentsBlock } from '@atom63/cli/agents-md'

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const repoRoot = path.resolve(packageRoot, '../..')
const starterRoot = path.join(packageRoot, 'starter')

export const kinds = ['site']

const atom63Packages = {
  '@atom63/mdx': 'packages/mdx',
  '@atom63/styles': 'packages/styles',
  '@atom63/ui-foundation': 'packages/ui-foundation',
  '@atom63/ui-react': 'packages/ui-react',
}

/**
 * Packages the starter needs that no workspace package uses, so the repo has
 * no range to copy. Keep this list short, and check a new entry against npm.
 */
const starterOnly = {
  // shadcn's `init` normally installs it; every shadcn component imports it.
  'class-variance-authority': '^0.7.1',
}

const dependencies = [
  '@atom63/mdx',
  '@atom63/styles',
  '@atom63/ui-foundation',
  '@atom63/ui-react',
  '@mdx-js/react',
  '@tanstack/react-router',
  'class-variance-authority',
  'clsx',
  'lucide-react',
  'react',
  'react-dom',
  'tailwind-merge',
]

const devDependencies = [
  '@mdx-js/rollup',
  '@tailwindcss/vite',
  '@types/react',
  '@types/react-dom',
  '@vitejs/plugin-react',
  'remark-frontmatter',
  'remark-gfm',
  'remark-mdx-frontmatter',
  'tailwindcss',
  'typescript',
  'vite',
]

const readJson = relative => JSON.parse(readFileSync(path.join(repoRoot, relative), 'utf8'))

/** `catalog:` entries from pnpm-workspace.yaml. */
function catalog() {
  const source = readFileSync(path.join(repoRoot, 'pnpm-workspace.yaml'), 'utf8')
  const block = /^catalog:\n((?: {2}.+\n)+)/m.exec(source)
  if (!block) throw new Error('pnpm-workspace.yaml has no catalog')
  return Object.fromEntries(
    [...block[1].matchAll(/^ {2}'?([^':]+)'?:\s*(.+)$/gm)].map(([, name, range]) => [
      name,
      range.trim(),
    ])
  )
}

/**
 * The version range for each dependency. Design system packages use their
 * exact version: only the release that publishes them changes it. Other
 * packages use the range this repo already tests with; an exact pin becomes
 * a caret range so the app can take patch fixes.
 */
export function resolveVersions() {
  const pinned = catalog()
  const docs = readJson('apps/docs/package.json')
  const rootManifest = readJson('package.json')
  const sources = [
    { ...docs.dependencies, ...docs.devDependencies },
    { ...rootManifest.dependencies, ...rootManifest.devDependencies },
  ]
  const versions = {}
  for (const name of [...dependencies, ...devDependencies]) {
    if (atom63Packages[name]) {
      versions[name] = readJson(`${atom63Packages[name]}/package.json`).version
      continue
    }
    let range = sources.map(source => source[name]).find(value => value && value !== 'catalog:')
    range ??= pinned[name] ?? starterOnly[name]
    if (!range) throw new Error(`No version for ${name} in this repo`)
    versions[name] = /^\d/.test(range) ? `^${range}` : range
  }
  return versions
}

function listFiles(directory, prefix = '') {
  if (!existsSync(directory)) return []
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name
    return entry.isDirectory()
      ? listFiles(path.join(directory, entry.name), relative)
      : [{ relative, source: path.join(directory, entry.name) }]
  })
}

/** A package name from the directory name: lowercase, npm-safe. */
export function packageName(directory) {
  const base = path.basename(path.resolve(directory))
  const name = base
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^[._-]+|[-]+$/g, '')
  if (!name) throw new Error(`Cannot derive a package name from "${directory}"`)
  return name
}

/** "my-new-site" → "My new site". */
export function titleFromName(name) {
  const words = name.replace(/[-_.]+/g, ' ').trim()
  return words[0].toUpperCase() + words.slice(1)
}

/**
 * Every file of the new project, keyed by its path in the project.
 * @param {{ name: string, kind?: string, title?: string, date?: string, versions?: Record<string, string> }} options
 */
export function planProject({ name, kind = 'site', title = titleFromName(name), date, versions }) {
  if (!kinds.includes(kind)) {
    throw new Error(`Unknown kind "${kind}". Choose one of: ${kinds.join(', ')}`)
  }
  const resolved = versions ?? resolveVersions()
  const today = date ?? new Date().toISOString().slice(0, 10)
  const fill = text => text.replaceAll('{{title}}', title).replaceAll('{{date}}', today)

  const files = new Map()
  for (const layer of ['base', kind]) {
    for (const { relative, source } of listFiles(path.join(starterRoot, layer))) {
      // npm drops .gitignore from published packages, so the template stores it as _gitignore.
      const target = relative === '_gitignore' ? '.gitignore' : relative
      files.set(target, fill(readFileSync(source, 'utf8')))
    }
  }

  const pick = names =>
    Object.fromEntries(names.map(dependency => [dependency, resolved[dependency]]))
  const manifest = {
    name,
    version: '0.0.0',
    private: true,
    type: 'module',
    scripts: {
      dev: 'vite',
      build: 'tsc --noEmit && vite build',
      typecheck: 'tsc --noEmit',
      preview: 'vite preview',
    },
    dependencies: pick(dependencies),
    devDependencies: pick(devDependencies),
  }
  files.set('package.json', `${JSON.stringify(manifest, null, 2)}\n`)
  files.set(
    'AGENTS.md',
    `# ${title}\n\n${files.get('AGENTS.md') ?? ''}${agentsBlock({ variant: 'docs' })}\n`
  )
  return new Map([...files].sort(([left], [right]) => left.localeCompare(right)))
}

/** Write a planned project into `directory`, which must be missing or empty. */
export function writeProject(directory, files) {
  if (existsSync(directory) && readdirSync(directory).length > 0) {
    throw new Error(`${directory} is not empty. Choose a new directory.`)
  }
  for (const [relative, content] of files) {
    const target = path.join(directory, relative)
    mkdirSync(path.dirname(target), { recursive: true })
    writeFileSync(target, content)
  }
}
