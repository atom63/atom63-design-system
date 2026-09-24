/**
 * Applies a token patch exported by the Atom63 Figma plugin ("Export to code")
 * to the DTCG sources, then regenerates the CSS and every generated model.
 * All or nothing: if any token cannot be applied, no file is written.
 *
 * Usage: pnpm --filter @atom63/styles tokens:apply <patch.json>
 */
import { execFileSync } from 'node:child_process'
import { readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import prettier from 'prettier'

import { applyPatch } from './lib/token-patch.mjs'

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const tokensRoot = path.join(packageRoot, 'src/tokens')

const patchArgument = process.argv[2]
if (!patchArgument) {
  process.stderr.write('Usage: pnpm --filter @atom63/styles tokens:apply <patch.json>\n')
  process.exit(1)
}
// pnpm runs scripts from the package directory; resolve the path from where the
// command was typed.
const patchPath = path.resolve(process.env.INIT_CWD ?? process.cwd(), patchArgument)
const patch = JSON.parse(await readFile(patchPath, 'utf8'))

async function findSources(directory) {
  const found = []
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name)
    if (entry.isDirectory()) found.push(...(await findSources(entryPath)))
    else if (/\.(tokens|resolver)\.json$/.test(entry.name)) found.push(entryPath)
  }
  return found.sort()
}

const documents = new Map()
const sourceRoots = [
  tokensRoot,
  ...['src/contracts', 'src/themes'].map(dir => path.join(packageRoot, dir)),
]
for (const file of (await Promise.all(sourceRoots.map(findSources))).flat()) {
  documents.set(file, JSON.parse(await readFile(file, 'utf8')))
}

const result = applyPatch(documents, patch)
if (result.errors.length) {
  process.stderr.write(
    `No tokens were written. Fix these and export again:\n${result.errors.map(error => `  ${error}`).join('\n')}\n`
  )
  process.exit(1)
}

for (const [file, document] of result.documents) {
  const options = (await prettier.resolveConfig(file)) ?? {}
  await writeFile(
    file,
    await prettier.format(JSON.stringify(document, null, 2), { ...options, filepath: file })
  )
}
process.stdout.write(
  `Applied ${result.changed.length} tokens: ${result.changed.join(', ')}\nRegenerating…\n`
)
execFileSync('pnpm', ['run', '--silent', 'generate:tokens'], {
  cwd: packageRoot,
  stdio: 'inherit',
})
process.stdout.write('Done. Review the diff, add a changeset, and open a pull request.\n')
