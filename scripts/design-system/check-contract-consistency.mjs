/**
 * Contract consistency lint over packages/ui-foundation/contracts/components
 * (see lib/contract-consistency.mjs for the rules), including that every
 * contract slot is a data-slot value in the ui-react renderer's source.
 *
 * Existing findings live in
 * docs/design-system/audits/contract-consistency-baseline.json. The check
 * fails on any finding the baseline does not cover, and on baseline entries
 * that no longer occur, so a fix must also shrink the baseline. `--write`
 * rewrites the baseline from the current contracts.
 *
 * Usage: node scripts/design-system/check-contract-consistency.mjs [--write]
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

import { compareToBaseline } from './lib/craft-rules.mjs'
import { checkContracts, checkSlots, countFindings } from './lib/contract-consistency.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const dir = path.join(root, 'packages/ui-foundation/contracts/components')
const baselinePath = path.join(root, 'docs/design-system/audits/contract-consistency-baseline.json')

const contracts = readdirSync(dir)
  .filter(file => file.endsWith('.json'))
  .map(file => ({
    component: file.replace(/\.json$/, ''),
    lists: JSON.parse(readFileSync(path.join(dir, file), 'utf8')).lists,
  }))

const componentsDir = path.join(root, 'packages/ui-react/src/components')

/** Non-story, non-test sources of a component directory. */
const sourceFiles = dirPath =>
  readdirSync(dirPath, { recursive: true })
    .filter(file => /\.tsx?$/.test(file) && !/\.(stories|test)\.tsx?$/.test(file))
    .map(file => readFileSync(path.join(dirPath, file), 'utf8'))

/**
 * The web renderer source for a component: its own directory plus the sibling
 * component directories it imports (`../button`), transitively, since a
 * composed component renders its parts' slots (CopyButton renders `button`).
 */
function sourceFor(component) {
  if (!existsSync(path.join(componentsDir, component))) return null
  const seen = new Set([component])
  const queue = [component]
  const sources = []
  while (queue.length > 0) {
    for (const source of sourceFiles(path.join(componentsDir, queue.shift()))) {
      sources.push(source)
      for (const [, name] of source.matchAll(/from '\.\.\/([a-z0-9-]+)(?:\/[^']*)?'/g)) {
        if (!seen.has(name) && existsSync(path.join(componentsDir, name))) {
          seen.add(name)
          queue.push(name)
        }
      }
    }
  }
  return sources.join('\n')
}

const current = countFindings([...checkContracts(contracts), ...checkSlots(contracts, sourceFor)])

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
  process.stderr.write(
    'Rename the value to its canonical name, or a slot to the data-slot the renderer sets (lib/contract-consistency.mjs).\n'
  )
}
if (resolved.length > 0) {
  process.stderr.write('Baseline entries that no longer occur:\n')
  for (const { key } of resolved) process.stderr.write(`  ${key}\n`)
  process.stderr.write('Run `pnpm check:contract-consistency --write` to shrink the baseline.\n')
}
if (added.length > 0 || resolved.length > 0) process.exit(1)
process.stdout.write(`Contract consistency OK (${contracts.length} contracts).\n`)
