/**
 * Keeps the generated `atom63:agents` block in the repo's AGENTS.md in step
 * with packages/cli/src/rules.mjs.
 *
 * Usage: node packages/cli/scripts/sync-agents-md.mjs [--check]
 */
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

import { syncAgentsBlock } from '../src/agents-md.mjs'

const file = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../AGENTS.md')
const current = readFileSync(file, 'utf8')
const next = syncAgentsBlock(current)

if (process.argv.includes('--check')) {
  if (next !== current) {
    process.stderr.write('AGENTS.md is stale. Run `pnpm --filter @atom63/cli sync:agents-md`.\n')
    process.exit(1)
  }
  process.stdout.write('AGENTS.md is current.\n')
} else {
  writeFileSync(file, next)
  process.stdout.write('Updated AGENTS.md.\n')
}
