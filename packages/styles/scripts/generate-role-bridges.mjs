/**
 * Writes the semantic role block of src/tailwind/theme.css and the whole of
 * src/compat/shadcn.css from src/tailwind/roles.json, and fails when a role
 * points at a token the manifest does not declare. Run after
 * generate-token-manifest.mjs, which writes the manifest it reads.
 *
 * Usage: node scripts/generate-role-bridges.mjs [--check]
 */
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import prettier from 'prettier'

import {
  renderCompat,
  renderThemeBlock,
  replaceThemeBlock,
  unknownTokens,
} from './lib/role-bridges.mjs'

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const check = process.argv.includes('--check')
const rolesPath = path.join(packageRoot, 'src/tailwind/roles.json')
const themePath = path.join(packageRoot, 'src/tailwind/theme.css')
const compatPath = path.join(packageRoot, 'src/compat/shadcn.css')
const manifestPath = path.join(packageRoot, 'generated/atom63.tokens.json')

const table = JSON.parse(await readFile(rolesPath, 'utf8'))
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'))
const missing = unknownTokens(table, new Set(manifest.entries.map(entry => entry.cssVar)))
if (missing.length > 0) {
  throw new Error(
    `roles.json maps roles to undeclared tokens: ${missing.map(([role, token]) => `${role} → ${token}`).join(', ')}`
  )
}

const format = async (css, filepath) =>
  prettier.format(css, { ...((await prettier.resolveConfig(filepath)) ?? {}), filepath })
const currentTheme = (await readFile(themePath, 'utf8')).replace(/\r\n/g, '\n')
const outputs = [
  [themePath, await format(replaceThemeBlock(currentTheme, renderThemeBlock(table)), themePath)],
  [compatPath, await format(renderCompat(table), compatPath)],
]

const stale = []
for (const [file, content] of outputs) {
  const current = (await readFile(file, 'utf8').catch(() => '')).replace(/\r\n/g, '\n')
  if (current === content) continue
  if (check) stale.push(path.relative(packageRoot, file).split(path.sep).join('/'))
  else await writeFile(file, content)
}
if (stale.length > 0) {
  process.stderr.write(
    `Stale role bridges: ${stale.join(', ')}. Run pnpm --filter @atom63/styles generate:roles.\n`
  )
  process.exit(1)
}
process.stdout.write(
  check
    ? 'Role bridges are current.\n'
    : `Wrote the role bridges for ${table.groups.length} groups.\n`
)
