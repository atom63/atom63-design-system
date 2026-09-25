#!/usr/bin/env node
/**
 * Checks what npm consumers get from the published packages, on packed tarballs:
 * - publint: `exports`, `files` and package.json fields point at real files.
 * - @arethetypeswrong/cli: every typed entry point resolves its types under
 *   Node16 ESM and bundler resolution (the packages are ESM-only).
 *
 * Build the packages first (`pnpm --filter @atom63/ui-react build`).
 */
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { publishedPackageDirs } from './published-packages.mjs'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const packageDirs = publishedPackageDirs

function run(args) {
  execFileSync('pnpm', ['exec', ...args], { cwd: repoRoot, stdio: 'inherit' })
}

const failures = []
for (const packageDir of packageDirs) {
  const manifest = JSON.parse(readFileSync(path.join(repoRoot, packageDir, 'package.json'), 'utf8'))
  try {
    run(['publint', '--strict', packageDir])
  } catch {
    failures.push(`publint: ${manifest.name}`)
  }

  // CSS subpaths have no types to resolve; check only the exports that declare them.
  const typedEntrypoints = Object.entries(manifest.exports ?? {})
    .filter(([, target]) => typeof target === 'object' && target.types)
    .map(([subpath]) => subpath)
  if (typedEntrypoints.length === 0) continue
  try {
    run([
      'attw',
      '--pack',
      packageDir,
      '--profile',
      'esm-only',
      '--format',
      'table-flipped',
      '--entrypoints',
      ...typedEntrypoints,
    ])
  } catch {
    failures.push(`attw: ${manifest.name}`)
  }
}

if (failures.length > 0) {
  console.error(`Package correctness failed:\n- ${failures.join('\n- ')}`)
  process.exit(1)
}
console.log('Published packages resolve correctly.')
