import { access, readFile } from 'node:fs/promises'
import path from 'node:path'
import {
  fromRoot,
  readJson,
  relativeToRoot,
  uniqueSorted,
  walkFiles,
  writeAuditJson,
} from './audit-utils.mjs'

const tokenRoot = fromRoot('packages/styles/src/tokens')
const contractRoot = fromRoot('packages/styles/src/contracts')
const generatorPath = fromRoot('apps/figma-plugin/scripts/generate-atom63-preset.ts')
const presetPath = fromRoot('apps/figma-plugin/src/generated/atom63-preset.json')
const handlersRoot = fromRoot('apps/figma-plugin/src/handlers')
const componentGeneratorPath = fromRoot('apps/figma-plugin/src/handlers/component-generator.ts')

const [tokenFiles, contractFiles, handlerFiles, generatorSource, preset, componentGeneratorSource] =
  await Promise.all([
    walkFiles(tokenRoot, file => file.endsWith('.css')),
    walkFiles(contractRoot, file => file.endsWith('.css')),
    walkFiles(handlersRoot, file => file.endsWith('.ts')),
    readFile(generatorPath, 'utf8'),
    readJson(presetPath),
    readFile(componentGeneratorPath, 'utf8'),
  ])

const cssFiles = [...tokenFiles, ...contractFiles]
const variablesByName = new Map()
const cssSources = []

for (const file of cssFiles) {
  const source = (await readFile(file, 'utf8')).replace(/\/\*[\s\S]*?\*\//g, '')
  const relativePath = relativeToRoot(file)
  const layer = relativePath.includes('/contracts/') ? 'contract' : 'token'
  const sourceCategory = relativePath
    .replace(/^packages\/styles\/src\/(tokens|contracts)\//, '')
    .replace(/\.css$/, '')
  const declarations = [...source.matchAll(/^\s*(--[a-zA-Z0-9-_]+)\s*:\s*([^;]+);/gm)]

  cssSources.push({
    path: relativePath,
    layer,
    category: `${layer}/${sourceCategory}`,
    declarationCount: declarations.length,
    uniqueVariableCount: new Set(declarations.map(match => match[1])).size,
  })

  for (const match of declarations) {
    const name = match[1]
    const record = variablesByName.get(name) ?? {
      name,
      sourceFiles: new Set(),
      layers: new Set(),
    }
    record.sourceFiles.add(relativePath)
    record.layers.add(layer)
    variablesByName.set(name, record)
  }
}

const cssVariables = [...variablesByName.values()]
  .map(record => ({
    name: record.name,
    sourceFiles: uniqueSorted(record.sourceFiles),
    layers: uniqueSorted(record.layers),
  }))
  .sort((left, right) => left.name.localeCompare(right.name))

const presetTokens = Array.isArray(preset.tokens) ? preset.tokens : []
const presetCssNames = new Set(presetTokens.map(token => token.cssName))
const cssVariableNames = new Set(cssVariables.map(variable => variable.name))
const cssVariablesWithoutPreset = cssVariables.filter(
  variable => !presetCssNames.has(variable.name)
)
const presetEntriesWithoutCssDeclaration = presetTokens
  .filter(token => !cssVariableNames.has(token.cssName))
  .map(token => ({
    category: token.category,
    cssName: token.cssName,
    figmaName: token.figmaName,
    sourceFile: token.sourceFile,
  }))

const presetEntriesWithoutSourceFiles = []
for (const token of presetTokens) {
  const sourceFile = token.sourceFile?.split('#')[0]
  if (!sourceFile) {
    presetEntriesWithoutSourceFiles.push({ ...token, reason: 'sourceFile is missing' })
    continue
  }

  try {
    await access(fromRoot(sourceFile))
  } catch {
    presetEntriesWithoutSourceFiles.push({ ...token, reason: `${sourceFile} does not exist` })
  }
}

const handlerSources = new Map(
  await Promise.all(
    handlerFiles.map(async file => [relativeToRoot(file), await readFile(file, 'utf8')])
  )
)
const sourceContains = (relativePath, pattern) =>
  pattern.test(handlerSources.get(relativePath) ?? '')
const capability = (present, evidence) => ({ present, evidence })
const componentGeneratorRelativePath = relativeToRoot(componentGeneratorPath)
const importHandlerPath = 'apps/figma-plugin/src/handlers/import-handler.ts'
const exportHandlerPath = 'apps/figma-plugin/src/handlers/export-handler.ts'
const styleguidePagePath = fromRoot('apps/figma-plugin/src/pages/StyleguidePage.tsx')
const pluginRuntimePath = fromRoot('apps/figma-plugin/src/code.ts')
const [styleguidePageSource, pluginRuntimeSource] = await Promise.all([
  readFile(styleguidePagePath, 'utf8'),
  readFile(pluginRuntimePath, 'utf8'),
])

const capabilities = {
  import: capability(
    sourceContains(importHandlerPath, /export async function createVariablesFromTokens/) &&
      sourceContains(importHandlerPath, /export async function importStylesFromTokens/),
    [
      `${importHandlerPath}#createVariablesFromTokens`,
      `${importHandlerPath}#importStylesFromTokens`,
    ]
  ),
  export: capability(
    sourceContains(exportHandlerPath, /export async function exportVariablesAsTokens/) &&
      sourceContains(exportHandlerPath, /export async function exportStylesAsTokens/),
    [`${exportHandlerPath}#exportVariablesAsTokens`, `${exportHandlerPath}#exportStylesAsTokens`]
  ),
  styleguide: capability(
    /export function StyleguidePage/.test(styleguidePageSource) &&
      /export async function generateComponentPrimitives/.test(componentGeneratorSource),
    [
      'apps/figma-plugin/src/pages/StyleguidePage.tsx#StyleguidePage',
      `${componentGeneratorRelativePath}#generateComponentPrimitives`,
    ]
  ),
  componentGeneration: capability(
    /export async function generateComponentPrimitives/.test(componentGeneratorSource),
    [`${componentGeneratorRelativePath}#generateComponentPrimitives`]
  ),
  rebind: capability(
    /case 'scan-rebind'/.test(pluginRuntimeSource) &&
      /case 'apply-rebind'/.test(pluginRuntimeSource),
    [
      'apps/figma-plugin/src/code.ts#scan-rebind',
      'apps/figma-plugin/src/code.ts#apply-rebind',
      'apps/figma-plugin/src/libraries/rebind-matching.ts',
    ]
  ),
}

const generatorLines = componentGeneratorSource.split('\n')
const hardcodedFallbacks = []
let fallbackBlock = null

for (const [index, line] of generatorLines.entries()) {
  if (line.startsWith('const FALLBACKS = {')) fallbackBlock = 'color'
  if (line.startsWith('const COMPONENT_BASELINE_FLOAT_VARIABLES = [')) fallbackBlock = 'baseline'

  if (fallbackBlock === 'color') {
    const match = line.match(/^\s*([a-zA-Z]+):\s*(\{\s*r:\s*[^}]+})/)
    if (match) {
      hardcodedFallbacks.push({
        kind: 'color',
        name: match[1],
        value: match[2],
        line: index + 1,
      })
    }
  }

  if (fallbackBlock === 'baseline') {
    const match = line.match(/\{\s*name:\s*'([^']+)',\s*value:\s*([^}]+)}/)
    if (match) {
      hardcodedFallbacks.push({
        kind: 'baseline-variable',
        name: match[1],
        value: match[2].trim(),
        line: index + 1,
      })
    }
  }

  const isDesignFallbackLine =
    /Spec\.|options\.(?:fontFamily|fontSize|fontWeight|gap)|radiusFallback/.test(line)
  if (!fallbackBlock && isDesignFallbackLine) {
    for (const inlineMatch of line.matchAll(/\?\?\s*(\d+(?:\.\d+)?|'[^']+'|"[^"]+")/g)) {
      hardcodedFallbacks.push({
        kind: 'inline-literal',
        value: inlineMatch[1],
        line: index + 1,
        expression: line.trim(),
      })
    }
  }

  if (fallbackBlock === 'color' && line.includes('satisfies Record<string, RGB>')) {
    fallbackBlock = null
  }
  if (fallbackBlock === 'baseline' && line.includes('] as const')) fallbackBlock = null
}

const presetCategoryCounts = Object.fromEntries(
  uniqueSorted(presetTokens.map(token => token.category)).map(category => [
    category,
    presetTokens.filter(token => token.category === category).length,
  ])
)
const cssSourceCategoryCounts = Object.fromEntries(
  cssSources.map(source => [source.category, source.uniqueVariableCount])
)

const audit = {
  schemaVersion: 1,
  inputs: {
    css: ['packages/styles/src/tokens/**/*.css', 'packages/styles/src/contracts/**/*.css'],
    presetGenerator: relativeToRoot(generatorPath),
    generatedPreset: relativeToRoot(presetPath),
    handlers: 'apps/figma-plugin/src/handlers/*.ts',
    capabilityEvidence: [
      'apps/figma-plugin/src/pages/StyleguidePage.tsx',
      'apps/figma-plugin/src/code.ts',
      'apps/figma-plugin/src/libraries/rebind-matching.ts',
    ],
  },
  summary: {
    cssSourceFiles: cssSources.length,
    cssTokenSourceFiles: tokenFiles.length,
    cssContractSourceFiles: contractFiles.length,
    uniqueCssVariables: cssVariables.length,
    generatedPresetEntries: presetTokens.length,
    generatedPresetCssNames: presetCssNames.size,
    cssVariablesWithoutPreset: cssVariablesWithoutPreset.length,
    presetEntriesWithoutCssDeclaration: presetEntriesWithoutCssDeclaration.length,
    presetEntriesWithoutSourceFiles: presetEntriesWithoutSourceFiles.length,
    capabilitiesPresent: Object.values(capabilities).filter(item => item.present).length,
    capabilitiesAudited: Object.keys(capabilities).length,
    hardcodedFallbackCandidates: hardcodedFallbacks.length,
  },
  tokenCategories: {
    cssSourceCategories: cssSourceCategoryCounts,
    generatedPresetCategories: presetCategoryCounts,
  },
  generator: {
    path: relativeToRoot(generatorPath),
    generatedFrom: preset.generatedFrom ?? [],
    sourceMentionsCompatibilityTokens: /extractFoundationCompatibilityTokens/.test(generatorSource),
  },
  cssSources,
  cssVariablesWithoutPreset,
  presetEntriesWithoutCssDeclaration,
  presetEntriesWithoutSourceFiles,
  capabilities,
  componentGeneratorHardcodedFallbacks: hardcodedFallbacks.map(item => ({
    ...item,
    sourceFile: componentGeneratorRelativePath,
  })),
}

const outputPath = await writeAuditJson('docs/design-system/audits/token-figma-surface.json', audit)

console.log(
  `Audited ${cssVariables.length} CSS variables and ${presetTokens.length} preset entries; ${cssVariablesWithoutPreset.length} CSS variables are outside the preset -> ${relativeToRoot(outputPath)}`
)
