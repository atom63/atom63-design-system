/**
 * Publishes first-wave package versions that are not on npm yet to the `beta`
 * dist-tag. Replaces `changeset publish`, whose 3.0.1 publish plan misreads
 * `pnpm info` (locally it plans already-published packages as first releases on
 * `latest`; in CI it crashes on missing dist-tags).
 *
 * Each package is packed with pnpm, which rewrites `workspace:*` ranges, and the
 * tarball is published with the npm CLI, which performs trusted-publisher OIDC
 * and provenance in CI. Order follows the dependency graph.
 *
 * Usage: node scripts/design-system/publish-beta.mjs [--dry-run]
 */
import { execFileSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

import { publishedPackageDirs } from './published-packages.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const packageDirectories = publishedPackageDirs
const dryRun = process.argv.includes('--dry-run')
const tag = 'beta'

function isPublished(name, version) {
  try {
    execFileSync('npm', ['view', `${name}@${version}`, 'version'], {
      stdio: ['ignore', 'pipe', 'ignore'],
    })
    return true
  } catch {
    return false
  }
}

const outDir = mkdtempSync(path.join(tmpdir(), 'atom63-publish-'))
let published = 0
try {
  for (const directory of packageDirectories) {
    const packageDir = path.join(root, directory)
    const {
      name,
      version,
      private: isPrivate,
      files = [],
    } = JSON.parse(readFileSync(path.join(packageDir, 'package.json'), 'utf8'))
    if (isPrivate) throw new Error(`${name} is private and cannot be published`)
    if (files.includes('dist') && !existsSync(path.join(packageDir, 'dist/index.js'))) {
      throw new Error(`${name} has no dist/index.js; build it before publishing`)
    }
    if (!/-beta\.\d+$/.test(version))
      throw new Error(
        `${name}@${version} is not a beta version; refusing to publish it to "${tag}"`
      )
    if (isPublished(name, version)) {
      process.stdout.write(`skip ${name}@${version} (already on npm)\n`)
      continue
    }

    const before = new Set(readdirSync(outDir))
    execFileSync('pnpm', ['pack', '--pack-destination', outDir], {
      cwd: packageDir,
      stdio: ['ignore', 'ignore', 'inherit'],
    })
    const tarball = readdirSync(outDir).find(file => !before.has(file))
    if (!tarball) throw new Error(`pnpm pack produced no tarball for ${name}`)

    const args = ['publish', path.join(outDir, tarball), '--tag', tag, '--access', 'public']
    if (dryRun) args.push('--dry-run')
    process.stdout.write(`${dryRun ? 'dry-run ' : ''}publish ${name}@${version} --tag ${tag}\n`)
    execFileSync('npm', args, { cwd: packageDir, stdio: 'inherit' })
    published += 1
  }
} finally {
  rmSync(outDir, { recursive: true, force: true })
}

process.stdout.write(
  `${dryRun ? 'Dry run: would publish' : 'Published'} ${published} package(s) to "${tag}".\n`
)
