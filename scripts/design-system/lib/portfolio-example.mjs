/**
 * examples/portfolio is the portfolio starter, generated and committed so it
 * can be deployed as a showcase. It is the generator's output with one
 * change: the design system packages come from the workspace.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { planProject } from '../../../packages/create/src/generate.mjs'

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..')
export const exampleDir = path.join(root, 'examples/portfolio')

/** Every file of examples/portfolio, keyed by its path in the example. */
export function planPortfolioExample() {
  const files = planProject({
    name: 'atom63-portfolio-example',
    kind: 'portfolio',
    title: 'Portfolio',
    date: '2026-11-21',
  })
  const manifest = JSON.parse(files.get('package.json'))
  for (const field of ['dependencies', 'devDependencies']) {
    for (const name of Object.keys(manifest[field])) {
      if (name.startsWith('@atom63/')) manifest[field][name] = 'workspace:*'
    }
  }
  files.set('package.json', `${JSON.stringify(manifest, null, 2)}\n`)
  return files
}

const ignored = new Set(['node_modules', 'dist'])

function listFiles(directory, prefix = '') {
  if (!existsSync(directory)) return []
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    if (ignored.has(entry.name)) return []
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name
    return entry.isDirectory() ? listFiles(path.join(directory, entry.name), relative) : [relative]
  })
}

/** The files that differ between the plan and examples/portfolio on disk. */
export function portfolioExampleDrift(files = planPortfolioExample()) {
  const onDisk = new Set(listFiles(exampleDir))
  const drift = []
  for (const [relative, content] of files) {
    if (!onDisk.has(relative)) drift.push(`missing ${relative}`)
    else if (readFileSync(path.join(exampleDir, relative), 'utf8') !== content) {
      drift.push(`changed ${relative}`)
    }
    onDisk.delete(relative)
  }
  for (const relative of onDisk) drift.push(`extra ${relative}`)
  return drift
}
