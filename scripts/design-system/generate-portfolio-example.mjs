/**
 * Writes examples/portfolio from the portfolio starter (see
 * lib/portfolio-example.mjs). Run it after changing the starter; the
 * test:scripts suite fails while the two differ.
 *
 * Usage: node scripts/design-system/generate-portfolio-example.mjs
 */
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'

import {
  exampleDir,
  planPortfolioExample,
  portfolioExampleDrift,
} from './lib/portfolio-example.mjs'

const files = planPortfolioExample()
for (const entry of portfolioExampleDrift(files)) {
  if (entry.startsWith('extra ')) rmSync(path.join(exampleDir, entry.slice('extra '.length)))
}
for (const [relative, content] of files) {
  const target = path.join(exampleDir, relative)
  mkdirSync(path.dirname(target), { recursive: true })
  writeFileSync(target, content)
}
process.stdout.write(`Wrote ${files.size} files to examples/portfolio.\n`)
