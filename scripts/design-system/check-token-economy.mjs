/**
 * Token economy guardrail for @atom63/styles. Fails on theme base definitions
 * that are overridden in both light and dark (the base value never applies);
 * reports restated tokens and unreferenced theme-private tokens as advisories.
 */
import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

import {
  findRestatements,
  findUnreachableBaseDefs,
  findUnusedThemePrivate,
  parseCssBlocks,
} from './lib/token-economy.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const tokensDir = path.join(root, 'packages/styles/src')

function walk(dir, test, acc = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const entryPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (['archive', 'dist', 'node_modules'].includes(entry.name)) continue
      walk(entryPath, test, acc)
    } else if (test(entryPath)) acc.push(entryPath)
  }
  return acc
}

const allBlocks = walk(tokensDir, file => file.endsWith('.css')).flatMap(file =>
  parseCssBlocks(readFileSync(file, 'utf8'))
)

// Responsive window-size typography restates the base by design.
const restatements = findRestatements(allBlocks).filter(
  item => !/\[data-window-size=/.test(item.selector)
)
const unreachable = findUnreachableBaseDefs(allBlocks)

const definedPrivate = new Set(
  allBlocks
    .flatMap(block => Object.keys(block.decls))
    .filter(token => /^--(theme|gel)-/.test(token))
)
const referenced = new Set()
for (const baseDir of ['packages', 'apps'].map(dir => path.join(root, dir))) {
  for (const file of walk(baseDir, entry => /\.(css|tsx?|mjs)$/.test(entry))) {
    for (const match of readFileSync(file, 'utf8').matchAll(/var\(\s*(--[a-z0-9-]+)/gi))
      referenced.add(match[1])
  }
}
const unused = findUnusedThemePrivate(definedPrivate, referenced)

if (restatements.length > 0) {
  process.stdout.write(
    `\n${restatements.length} restated token(s) (advisory; often intentional .dark/theme completeness):\n`
  )
  for (const item of restatements)
    process.stdout.write(`  - ${item.token} in \`${item.selector}\` = base value (${item.value})\n`)
}
if (unused.length > 0) {
  process.stdout.write(
    `\n${unused.length} theme-private token(s) appear unreferenced (advisory):\n`
  )
  for (const token of unused) process.stdout.write(`  - ${token}\n`)
}

if (unreachable.length > 0) {
  process.stderr.write('\nToken economy check failed (dead base definitions):\n')
  for (const item of unreachable) {
    process.stderr.write(
      `  - dead-base ${item.token} in theme "${item.theme}" is overridden in both light and dark\n`
    )
  }
  process.exit(1)
}

process.stdout.write(
  `Token economy check passed (${restatements.length} restate + ${unused.length} unused advisory notices).\n`
)
