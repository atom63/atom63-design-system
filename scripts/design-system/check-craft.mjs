/**
 * Craft lint for the design-system packages: raw colors, physical directions
 * and focus styles outside `:focus-visible` (see lib/craft-rules.mjs).
 *
 * Existing violations live in docs/design-system/audits/craft-baseline.json.
 * The check fails on any violation the baseline does not cover, and on
 * baseline entries that no longer occur, so a fix must also shrink the
 * baseline. `--write` rewrites the baseline from the current source.
 *
 * Usage: node scripts/design-system/check-craft.mjs [--write]
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

import { compareToBaseline, countViolations, scanCss, scanSource } from './lib/craft-rules.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const baselinePath = path.join(root, 'docs/design-system/audits/craft-baseline.json')
const sourceRoots = [
  'packages/ui-react/src',
  'packages/mdx/src',
  'packages/brand/src',
  'packages/inform/src',
  'packages/agent/src',
  'packages/widgets/src',
]
// Generated from the recipes, so its literals are the recipes' literals.
const generated = new Set(['packages/ui-react/src/styles/utilities.css'])

function walk(dir, acc = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const entryPath = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(entryPath, acc)
    else acc.push(entryPath)
  }
  return acc
}

const isScanned = file =>
  /\.(css|ts|tsx)$/.test(file) &&
  !/\.(test|stories)\.(ts|tsx)$/.test(file) &&
  !file.endsWith('.d.ts') &&
  !file.includes(`${path.sep}test${path.sep}`)

const violations = []
for (const sourceRoot of sourceRoots) {
  for (const absolute of walk(path.join(root, sourceRoot)).filter(isScanned)) {
    const file = path.relative(root, absolute).split(path.sep).join('/')
    if (generated.has(file)) continue
    const text = readFileSync(absolute, 'utf8')
    const found = file.endsWith('.css') ? scanCss(text) : scanSource(text)
    for (const violation of found) violations.push({ file, ...violation })
  }
}

const current = countViolations(violations)

if (process.argv.includes('--write')) {
  writeFileSync(baselinePath, `${JSON.stringify(current, null, 2)}\n`)
  const total = Object.values(current).reduce((sum, count) => sum + count, 0)
  process.stdout.write(
    `Wrote ${total} baseline violation(s) to ${path.relative(root, baselinePath)}\n`
  )
  process.exit(0)
}

const baseline = JSON.parse(readFileSync(baselinePath, 'utf8'))
const { added, resolved } = compareToBaseline(current, baseline)

if (added.length > 0) {
  process.stderr.write('New craft violations:\n')
  for (const { key } of added) {
    const [rule, file, match] = key.split(' | ')
    const lines = violations
      .filter(v => v.rule === rule && v.file === file && v.match === match)
      .map(v => v.line)
    process.stderr.write(`  ${file}:${lines.join(',')}  ${rule}  ${match}\n`)
  }
}
if (resolved.length > 0) {
  process.stderr.write(
    'Fixed violations are still in the baseline. Run `pnpm check:craft --write` to shrink it:\n'
  )
  for (const { key } of resolved) process.stderr.write(`  ${key}\n`)
}
if (added.length > 0 || resolved.length > 0) process.exit(1)

const total = Object.values(current).reduce((sum, count) => sum + count, 0)
process.stdout.write(`Craft check passed (${total} baseline violation(s) remaining).\n`)
