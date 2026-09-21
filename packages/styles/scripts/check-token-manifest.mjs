import { readFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { buildTokenManifestOutputs } from './generate-token-manifest.mjs'

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))
const workspaceRoot = path.resolve(scriptDirectory, '../../..')
const expectedOutputs = await buildTokenManifestOutputs()
const driftedFiles = []

for (const [relativePath, expected] of Object.entries(expectedOutputs)) {
  let actual
  try {
    actual = await readFile(path.join(workspaceRoot, relativePath), 'utf8')
  } catch {
    driftedFiles.push(`${relativePath} (missing)`)
    continue
  }

  if (actual !== expected) driftedFiles.push(relativePath)
}

if (driftedFiles.length > 0) {
  process.stderr.write(`Token manifest drift detected:\n- ${driftedFiles.join('\n- ')}\n`)
  process.stderr.write('Run pnpm --filter @atom63/styles generate:tokens and commit the result.\n')
  process.exitCode = 1
} else {
  process.stdout.write(
    `Token manifests are current (${Object.keys(expectedOutputs).length} files checked).\n`
  )
}
