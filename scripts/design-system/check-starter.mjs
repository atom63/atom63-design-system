/**
 * Proves the project starter works: generate an app, install it against
 * freshly packed design system tarballs, typecheck and build it, and hold its
 * source to the craft rules. With --shadcn it also adds a shadcn component
 * (the Tailwind + shadcn path the starter promises) and builds again.
 *
 * Needs the packages built first (dist is packed). Needs the network for the
 * third-party dependencies.
 *
 * Usage: node scripts/design-system/check-starter.mjs [--shadcn] [--keep]
 */
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

import { planProject, writeProject } from '../../packages/create/src/generate.mjs'
import { scanCss, scanSource } from './lib/craft-rules.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const packages = {
  '@atom63/styles': 'packages/styles',
  '@atom63/ui-foundation': 'packages/ui-foundation',
  '@atom63/ui-react': 'packages/ui-react',
  '@atom63/mdx': 'packages/mdx',
}
const withShadcn = process.argv.includes('--shadcn')
const keep = process.argv.includes('--keep')

const work = mkdtempSync(path.join(tmpdir(), 'atom63-starter-'))
const tarballs = path.join(work, 'tarballs')
const app = path.join(work, 'app')

const run = (command, args, cwd) => {
  process.stdout.write(`\n$ ${command} ${args.join(' ')}\n`)
  execFileSync(command, args, { cwd, stdio: 'inherit', env: { ...process.env, CI: 'true' } })
}

let failed = false
try {
  for (const [name, directory] of Object.entries(packages)) {
    const manifest = JSON.parse(readFileSync(path.join(root, directory, 'package.json'), 'utf8'))
    if (manifest.files?.includes('dist')) {
      const dist = path.join(root, directory, 'dist')
      try {
        readdirSync(dist)
      } catch {
        throw new Error(`${name} has no dist; build it before running the starter check`)
      }
    }
    run('pnpm', ['pack', '--pack-destination', tarballs], path.join(root, directory))
  }
  const tarballFor = name => {
    const prefix = name.replace('@', '').replace('/', '-')
    const file = readdirSync(tarballs).find(entry => entry.startsWith(`${prefix}-`))
    if (!file) throw new Error(`No tarball for ${name}`)
    return `file:${path.join(tarballs, file)}`
  }

  const files = planProject({ name: 'starter-check', title: 'Starter check' })
  writeProject(app, files)

  // Point the app, and every package that depends on another, at the tarballs.
  const manifestPath = path.join(app, 'package.json')
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
  const overrides = Object.fromEntries(Object.keys(packages).map(name => [name, tarballFor(name)]))
  for (const name of Object.keys(packages)) manifest.dependencies[name] = overrides[name]
  manifest.pnpm = { overrides }
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)

  run('pnpm', ['install', '--ignore-workspace', '--no-frozen-lockfile'], app)
  run('pnpm', ['typecheck'], app)
  run('pnpm', ['build'], app)

  const violations = []
  for (const [relative, text] of files) {
    if (!relative.startsWith('src/')) continue
    const found = relative.endsWith('.css')
      ? scanCss(text)
      : /\.(tsx?|mdx)$/.test(relative)
        ? scanSource(text)
        : []
    for (const violation of found)
      violations.push(`${relative}:${violation.line} ${violation.rule} ${violation.match}`)
  }
  if (violations.length > 0) {
    throw new Error(`The starter breaks the craft rules:\n  ${violations.join('\n  ')}`)
  }
  process.stdout.write('\nThe generated source passes the craft rules.\n')

  if (withShadcn) {
    run(
      'pnpm',
      [
        'dlx',
        'shadcn@latest',
        'add',
        'button',
        '--yes',
        '--overwrite',
        '--path',
        'src/components/ui',
      ],
      app
    )
    writeFileSync(
      path.join(app, 'src/shadcn-check.tsx'),
      "import { Button } from '@/components/ui/button'\n\nexport const ShadcnCheck = () => <Button>shadcn</Button>\n"
    )
    run('pnpm', ['build'], app)
  }

  process.stdout.write('\nStarter check passed.\n')
} catch (error) {
  failed = true
  process.stderr.write(`\nStarter check failed: ${error.message}\n`)
} finally {
  if (keep) process.stdout.write(`Kept ${work}\n`)
  else rmSync(work, { recursive: true, force: true })
}
process.exitCode = failed ? 1 : 0
