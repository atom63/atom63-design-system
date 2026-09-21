import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))
const packageRoot = path.resolve(scriptDirectory, '..')
const workspaceRoot = path.resolve(packageRoot, '../..')
const generatedDirectory = path.join(packageRoot, 'generated')

const manifestRelativePath = 'packages/styles/generated/atom63.tokens.json'
const figmaManifestRelativePath = 'packages/styles/generated/atom63.figma-tokens.json'
const generatorRelativePath = 'packages/styles/scripts/generate-token-manifest.mjs'

const sourceDirectories = [
  path.join(packageRoot, 'src/tokens'),
  path.join(packageRoot, 'src/contracts'),
]

// Public stability is intentionally opt-in. Milestone 2 establishes evidence; it
// does not promote the existing token surface to a semver promise.
const lifecycleOverrides = new Map()

const figmaOverrides = new Map([
  ['--color-white-100', { collection: 'Atom63 Foundation', path: 'color/static/white' }],
  ['--color-black-100', { collection: 'Atom63 Foundation', path: 'color/static/black' }],
])

const figmaSupportedTypes = new Set([
  'color',
  'dimension',
  'radius',
  'typography',
  'shadow',
  'blur',
  'motion',
  'z-index',
])

function toWorkspacePath(filePath) {
  return path.relative(workspaceRoot, filePath).split(path.sep).join('/')
}

async function walkCssFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []

  for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
    const entryPath = path.join(directory, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await walkCssFiles(entryPath)))
    } else if (entry.name.endsWith('.css')) {
      files.push(entryPath)
    }
  }

  return files
}

function normalizeWhitespace(value) {
  return value.replace(/\s+/g, ' ').trim()
}

function stripComments(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, '')
}

function declarationContexts(source, declarationIndexes) {
  const contexts = new Map()
  const stack = []
  let statementStart = 0
  let cursor = 0

  for (const declarationIndex of declarationIndexes) {
    while (cursor < declarationIndex) {
      const character = source[cursor]

      if (character === '{') {
        stack.push(normalizeWhitespace(source.slice(statementStart, cursor)))
        statementStart = cursor + 1
      } else if (character === '}') {
        stack.pop()
        statementStart = cursor + 1
      } else if (character === ';') {
        statementStart = cursor + 1
      }

      cursor += 1
    }

    contexts.set(declarationIndex, [...stack])
  }

  return contexts
}

function inferLayer(sourceFile) {
  if (sourceFile.includes('/contracts/')) return 'contract'
  if (sourceFile.includes('/tokens/foundation/')) return 'foundation'
  if (sourceFile.endsWith('/tokens/foundation.css')) return 'foundation'
  return 'semantic'
}

function inferType(cssVar, value) {
  const name = cssVar.toLowerCase()

  if (/(^|-)z(-|$)|z-index/.test(name)) return 'z-index'
  if (/shadow/.test(name)) return 'shadow'
  if (/blur/.test(name)) return 'blur'
  if (/radius|rounded/.test(name)) return 'radius'
  if (/motion|duration|eas(e|ing)|transition/.test(name)) return 'motion'
  if (/typography|font|line-height|tracking|letter-spacing/.test(name)) return 'typography'
  if (
    /space|spacing|size|width|height|gap|padding|inset|offset|thickness|stroke|breakpoint|safe-area|target/.test(
      name
    ) ||
    /^-?(?:\d*\.)?\d+(?:px|r?em|%|vh|vw|dvh|svh|lvh|ch|ex|cm|mm|in|pt|pc)?$/.test(value)
  ) {
    return 'dimension'
  }
  if (
    (/border/.test(name) && !/border-(?:width|radius|style)/.test(name)) ||
    /color|foreground|background|surface|text-|brand-|status-|focus-ring|accent|condition-(?:start|end)|skeleton-(?:base|highlight)|choice-thumb|action-(?:primary|neutral|danger)/.test(
      name
    ) ||
    /var\(\s*--(?:color|surface|a63-brand)-/.test(value) ||
    /^(#|rgba?\(|hsla?\(|oklch\(|oklab\(|color\(|color-mix\(|transparent$|currentcolor$|white$|black$)/i.test(
      value
    )
  ) {
    return 'color'
  }

  return 'string'
}

function inferFigmaMode(scope, conditions) {
  const context = [scope, ...conditions].join(' ')
  if (/\bdark\b|a63-mode=['"]dark/.test(context)) return 'Dark'
  if (/\blight\b|a63-mode=['"]light/.test(context)) return 'Light'

  const axisMatch = context.match(/data-(?:a63-)?([a-z-]+)=['"]([^'"]+)['"]/)
  if (axisMatch) return `${axisMatch[1]}: ${axisMatch[2]}`
  if (conditions.length > 0) return conditions.join(' / ')
  return undefined
}

function inferFigmaMapping(cssVar, type, layer, scope, conditions) {
  const override = figmaOverrides.get(cssVar)
  const mode = inferFigmaMode(scope, conditions)

  if (override) return mode ? { ...override, mode } : override
  if (!figmaSupportedTypes.has(type)) return undefined

  const collection = {
    foundation: 'Atom63 Foundation',
    semantic: 'Atom63 Semantic',
    contract: 'Atom63 Contract',
  }[layer]
  if (!collection) return undefined

  const normalizedName = cssVar.replace(/^--/, '').replace(/^a63-/, '')
  const pathName = normalizedName.split('-').filter(Boolean).join('/')
  if (!pathName) return undefined

  return mode ? { collection, path: pathName, mode } : { collection, path: pathName }
}

function extractAliases(value) {
  return [
    ...new Set([...value.matchAll(/var\(\s*(--[a-zA-Z0-9_-]+)/g)].map(match => match[1])),
  ].sort((left, right) => left.localeCompare(right))
}

function parseCssDeclarations(source, sourceFile) {
  const css = stripComments(source)
  const declarationPattern = /(--[a-zA-Z0-9_-]+)\s*:\s*([^;]+);/g
  const matches = [...css.matchAll(declarationPattern)]
  const contexts = declarationContexts(
    css,
    matches.map(match => match.index)
  )
  const layer = inferLayer(sourceFile)

  return matches.map(match => {
    const cssVar = match[1]
    const value = normalizeWhitespace(match[2])
    const context = contexts.get(match.index) ?? []
    const conditions = context.filter(item => item.startsWith('@'))
    const scope = [...context].reverse().find(item => !item.startsWith('@'))
    const type = inferType(cssVar, value)
    const aliases = extractAliases(value)
    const figma = inferFigmaMapping(cssVar, type, layer, scope ?? ':root', conditions)

    return {
      name: cssVar.slice(2),
      cssVar,
      type,
      value,
      sourceFile,
      layer,
      ...(figma ? { figma } : {}),
      lifecycle: lifecycleOverrides.get(cssVar) ?? 'preview',
      ...(aliases.length > 0 ? { aliases } : {}),
      ...(scope ? { scope } : {}),
      ...(conditions.length > 0 ? { conditions } : {}),
    }
  })
}

function compareEntries(left, right) {
  return (
    left.cssVar.localeCompare(right.cssVar) ||
    left.sourceFile.localeCompare(right.sourceFile) ||
    (left.scope ?? '').localeCompare(right.scope ?? '') ||
    (left.conditions ?? []).join('\u0000').localeCompare((right.conditions ?? []).join('\u0000')) ||
    left.value.localeCompare(right.value)
  )
}

export async function buildTokenManifestOutputs() {
  const sourceFiles = (
    await Promise.all(sourceDirectories.map(directory => walkCssFiles(directory)))
  )
    .flat()
    .sort((left, right) => left.localeCompare(right))

  const entries = (
    await Promise.all(
      sourceFiles.map(async file =>
        parseCssDeclarations(await readFile(file, 'utf8'), toWorkspacePath(file))
      )
    )
  )
    .flat()
    .sort(compareEntries)

  const figmaEntries = entries.filter(entry => entry.figma)
  const manifest = {
    schemaVersion: 1,
    generatedBy: generatorRelativePath,
    generatedFrom: sourceFiles.map(toWorkspacePath),
    summary: {
      sourceFiles: sourceFiles.length,
      declarations: entries.length,
      uniqueCssVariables: new Set(entries.map(entry => entry.cssVar)).size,
      figmaMappedDeclarations: figmaEntries.length,
    },
    entries,
  }
  const figmaManifest = {
    schemaVersion: 1,
    generatedBy: generatorRelativePath,
    derivedFrom: manifestRelativePath,
    entries: figmaEntries,
  }

  const prettier = await import('prettier')
  const formatJson = async (relativePath, value) => {
    const outputPath = path.join(workspaceRoot, relativePath)
    const options = (await prettier.resolveConfig(outputPath)) ?? {}
    return prettier.format(`${JSON.stringify(value, null, 2)}\n`, {
      ...options,
      filepath: outputPath,
    })
  }

  return {
    [manifestRelativePath]: await formatJson(manifestRelativePath, manifest),
    [figmaManifestRelativePath]: await formatJson(figmaManifestRelativePath, figmaManifest),
  }
}

export async function writeTokenManifestFiles() {
  const outputs = await buildTokenManifestOutputs()
  await mkdir(generatedDirectory, { recursive: true })

  for (const [relativePath, content] of Object.entries(outputs)) {
    await writeFile(path.join(workspaceRoot, relativePath), content)
  }

  return outputs
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : undefined
if (invokedPath === fileURLToPath(import.meta.url)) {
  const outputs = await writeTokenManifestFiles()
  const manifest = JSON.parse(outputs[manifestRelativePath])
  process.stdout.write(
    `Generated ${manifest.summary.declarations} token declarations (${manifest.summary.uniqueCssVariables} unique CSS variables; ${manifest.summary.figmaMappedDeclarations} Figma-mapped).\n`
  )
}
