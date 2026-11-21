/**
 * Contract consistency lint over packages/ui-foundation/contracts/components
 * (see lib/contract-consistency.mjs for the rules).
 *
 * Existing findings live in
 * docs/design-system/audits/contract-consistency-baseline.json. The check
 * fails on any finding the baseline does not cover, and on baseline entries
 * that no longer occur, so a fix must also shrink the baseline. `--write`
 * rewrites the baseline from the current contracts.
 *
 * Usage: node scripts/design-system/check-contract-consistency.mjs [--write]
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

import { compareToBaseline } from './lib/craft-rules.mjs'
import { checkContracts, countFindings } from './lib/contract-consistency.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const dir = path.join(root, 'packages/ui-foundation/contracts/components')
const baselinePath = path.join(root, 'docs/design-system/audits/contract-consistency-baseline.json')

const contracts = readdirSync(dir)
  .filter(file => file.endsWith('.json'))
  .map(file => ({
    component: file.replace(/\.json$/, ''),
    lists: JSON.parse(readFileSync(path.join(dir, file), 'utf8')).lists,
  }))

const current = countFindings(checkContracts(contracts))

if (process.argv.includes('--write')) {
  writeFileSync(baselinePath, `${JSON.stringify(current, null, 2)}\n`)
  process.stdout.write(
    `Wrote ${Object.keys(current).length} baseline finding(s) to ${path.relative(root, baselinePath)}\n`
  )
  process.exit(0)
}

const baseline = JSON.parse(readFileSync(baselinePath, 'utf8'))
const { added, resolved } = compareToBaseline(current, baseline)

if (added.length > 0) {
  process.stderr.write('New contract consistency findings:\n')
  for (const { key } of added) process.stderr.write(`  ${key}\n`)
  process.stderr.write('Rename the value to its canonical name (lib/contract-consistency.mjs).\n')
}
if (resolved.length > 0) {
  process.stderr.write('Baseline entries that no longer occur:\n')
  for (const { key } of resolved) process.stderr.write(`  ${key}\n`)
  process.stderr.write('Run `pnpm check:contract-consistency --write` to shrink the baseline.\n')
}
if (added.length > 0 || resolved.length > 0) process.exit(1)
process.stdout.write(`Contract consistency OK (${contracts.length} contracts).\n`)
