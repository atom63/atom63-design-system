import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))

export const workspaceRoot = path.resolve(scriptDir, '../..')

export function fromRoot(...segments) {
  return path.join(workspaceRoot, ...segments)
}

export function relativeToRoot(filePath) {
  return path.relative(workspaceRoot, filePath).split(path.sep).join('/')
}

export async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'))
}

export async function walkFiles(directory, predicate = () => true) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []

  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const entryPath = path.join(directory, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await walkFiles(entryPath, predicate)))
    } else if (predicate(entryPath)) {
      files.push(entryPath)
    }
  }

  return files
}

export async function writeAuditJson(relativePath, value) {
  const outputPath = fromRoot(relativePath)
  await mkdir(path.dirname(outputPath), { recursive: true })

  const raw = `${JSON.stringify(value, null, 2)}\n`
  let content = raw

  if (relativePath.endsWith('.json')) {
    try {
      const prettier = await import('prettier')
      const options = (await prettier.resolveConfig(outputPath)) ?? {}
      content = await prettier.format(raw, { ...options, filepath: outputPath })
    } catch {
      content = raw
    }
  }

  await writeFile(outputPath, content)
  return outputPath
}

export function uniqueSorted(values) {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b))
}
