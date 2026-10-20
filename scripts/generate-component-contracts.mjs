/**
 * Writes the TypeScript component contracts of @atom63/ui-foundation from their
 * JSON sources: src/components/<slug>/<slug>-contract.ts and the barrel
 * src/components/<slug>/index.ts for every file in contracts/components and
 * contracts/shared. A barrel also re-exports every other TypeScript module in
 * the component folder (hand-written helpers such as frame-chrome.ts). It also
 * writes generated/component-contracts.json: every component contract with its
 * references resolved, which the docs site and the CLI read.
 *
 * Usage: node scripts/generate-component-contracts.mjs [--check]
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

import * as prettier from 'prettier'

import {
  contractFields,
  contractsDir,
  listInfo,
  loadContractSources,
  pascal,
  resolvedComponent,
  sections,
} from './design-system/lib/component-contracts.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const componentsDir = path.join(root, 'packages/ui-foundation/src/components')
const check = process.argv.includes('--check')

const sources = loadContractSources(root)

const literal = value => JSON.stringify(value)

function comment(text, width = 98) {
  const lines = []
  let line = ''
  for (const word of text.split(/\s+/)) {
    if (line && line.length + word.length + 1 > width) {
      lines.push(line)
      line = word
    } else line = line ? `${line} ${word}` : word
  }
  if (line) lines.push(line)
  return lines.map(text => `// ${text}`).join('\n')
}

// A map is documented API, so its description is a doc comment.
const docComment = text => `/** ${text} */`

const accessibilityDoc = '/** The WAI-ARIA APG pattern the component implements. */'

function contractModule(source) {
  const imports = new Map() // module -> { values: Set, types: Set }
  const use = (module, name, type) => {
    if (!imports.has(module)) imports.set(module, { values: new Set(), types: new Set() })
    imports.get(module)[type ? 'types' : 'values'].add(name)
  }
  const external = info => {
    if (info.section.source === source) return
    const target = info.section.source.name
    return `../${target}/${target}-contract`
  }
  const body = []
  if (source.doc.description) body.push(comment(source.doc.description))
  for (const section of sections(source)) {
    const lists = Object.keys(section.lists).map(key => listInfo(section, key))
    const values = []
    const types = []
    const maps = []
    for (const info of lists) {
      const lead = info.entry.description ? `${comment(info.entry.description)}\n` : ''
      const name = info.exportName
      if (info.kind === 'map') {
        const keyType = listInfo(section, info.entry.keys).typeName
        const shape = Object.entries(info.entry.fields)
          .map(([field, key]) => `${field}: ${listInfo(section, key).typeName}`)
          .join('; ')
        const doc = info.entry.description ? `${docComment(info.entry.description)}\n` : ''
        maps.push(
          `${doc}export const ${name} = ${literal(info.entry.entries)} satisfies Record<${keyType}, { ${shape} }>`
        )
        continue
      }
      let expression
      if (info.kind === 'concat') {
        expression = `[${info.entry.concat.map(key => `...${listInfo(section, key).exportName}`).join(', ')}] as const`
      } else if (info.kind === 'flatten') {
        const from = listInfo(section, info.entry.flatten)
        const fields = Object.keys(from.entry.values[0])
        expression = `${from.exportName}.flatMap(pair => [${fields.map(field => `pair.${field}`).join(', ')}])`
      } else {
        expression = `${literal(info.entry.values)} as const`
        if (info.key === 'visualArchetypes') {
          expression += ' satisfies readonly VisualArchetypeId[]'
          use('../../visual-archetypes', 'VisualArchetypeId', true)
        }
      }
      values.push(`${lead}export const ${name} = ${expression}`)
      if (info.typeName) types.push(`export type ${info.typeName} = (typeof ${name})[number]`)
    }
    body.push(values.join('\n'), types.join('\n'), maps.join('\n\n'))
    if (!section.contract) continue
    const contractName = `${section.prefix}Contract`
    const members = []
    const fields = []
    for (const field of contractFields(sources, section)) {
      if (field.list) {
        const info = field.list
        const from = external(info)
        if (from) use(from, info.exportName, false)
        let type
        if (info.typeName) {
          type = `readonly ${info.typeName}[]`
          if (from) use(from, info.typeName, true)
        } else if (info.key === 'visualArchetypes') type = 'readonly VisualArchetypeId[]'
        else type = `typeof ${info.exportName}`
        members.push(`${field.field}: ${type}`)
        fields.push(`${field.field}: ${info.exportName}`)
      } else if (field.accessibility) {
        use('../../a11y/types', 'A11yPatternBinding', true)
        members.push(`${accessibilityDoc}\naccessibility: A11yPatternBinding`)
        fields.push(`accessibility: ${literal(field.value)}`)
      } else if (field.defaultOf) {
        const from = external(field.defaultOf)
        if (from) use(from, field.defaultOf.typeName, true)
        members.push(`${field.field}: ${field.defaultOf.typeName}`)
        fields.push(`${field.field}: ${literal(field.value)}`)
      } else {
        members.push(`${field.field}: ${field.primitive}`)
        fields.push(`${field.field}: ${literal(field.value)}`)
      }
    }
    body.push(
      `export interface ${pascal(contractName)} {\n${members.join('\n')}\n}`,
      `export const ${contractName} = {\n${fields.join(',\n')}\n} satisfies ${pascal(contractName)}`
    )
  }
  const importLines = [...imports]
    .sort(([a], [b]) =>
      a.startsWith('../../') === b.startsWith('../../')
        ? a.localeCompare(b)
        : a.startsWith('../../')
          ? -1
          : 1
    )
    .map(([module, { values, types }]) => {
      if (values.size === 0)
        return `import type { ${[...types].sort().join(', ')} } from '${module}'`
      const names = [...[...types].map(name => `type ${name}`), ...values].sort((a, b) =>
        a.replace(/^type /, '').localeCompare(b.replace(/^type /, ''))
      )
      return `import { ${names.join(', ')} } from '${module}'`
    })
  const sourcePath = `${contractsDir}/${source.folder}/${source.name}.json`
  return [
    `// Generated by scripts/generate-component-contracts.mjs from ${sourcePath}.\n// Do not edit; change the JSON and run \`pnpm --filter @atom63/ui-foundation generate:contracts\`.`,
    importLines.join('\n'),
    ...body,
  ]
    .filter(Boolean)
    .join('\n\n')
}

function barrelModule(source) {
  const values = []
  const types = []
  for (const section of sections(source)) {
    for (const key of Object.keys(section.lists)) {
      const info = listInfo(section, key)
      values.push(info.exportName)
      if (info.typeName) types.push(info.typeName)
    }
    if (section.contract) {
      values.push(`${section.prefix}Contract`)
      types.push(pascal(`${section.prefix}Contract`))
    }
  }
  const module = `./${source.name}-contract`
  const dir = path.join(componentsDir, source.name)
  const helpers = existsSync(dir)
    ? readdirSync(dir)
        .filter(file => /\.ts$/.test(file) && !/\.test\.ts$/.test(file))
        .filter(file => file !== 'index.ts' && file !== `${source.name}-contract.ts`)
        .sort()
    : []
  return [
    `// Generated by scripts/generate-component-contracts.mjs. Do not edit.`,
    `export { ${values.sort().join(', ')} } from '${module}'`,
    `export type { ${types.sort().join(', ')} } from '${module}'`,
    ...helpers.map(file => `export * from './${file.slice(0, -'.ts'.length)}'`),
  ].join('\n')
}

const outputs = new Map()
for (const source of sources.values()) {
  const dir = path.join(componentsDir, source.name)
  outputs.set(path.join(dir, `${source.name}-contract.ts`), contractModule(source))
  outputs.set(path.join(dir, 'index.ts'), barrelModule(source))
}

const components = [...sources.values()]
  .filter(source => source.folder === 'components')
  .map(source => [source.name, resolvedComponent(sources, source)])
outputs.set(
  path.join(root, 'packages/ui-foundation/generated/component-contracts.json'),
  JSON.stringify({
    $comment: `Generated by scripts/generate-component-contracts.mjs from ${contractsDir}. Do not edit.`,
    components: Object.fromEntries(components),
  })
)

let stale = false
for (const name of readdirSync(componentsDir)) {
  if (![...sources.values()].some(source => source.name === name)) {
    process.stderr.write(`src/components/${name} has no source in ${contractsDir}\n`)
    stale = true
  }
}

for (const [file, text] of outputs) {
  const options = { ...(await prettier.resolveConfig(file)), filepath: file }
  const formatted = await prettier.format(text, options)
  if (check) {
    const current = existsSync(file) ? readFileSync(file, 'utf8') : ''
    if (current !== formatted) {
      process.stderr.write(`Generated contract is stale: ${path.relative(root, file)}\n`)
      stale = true
    }
  } else {
    mkdirSync(path.dirname(file), { recursive: true })
    writeFileSync(file, formatted)
  }
}
if (stale) {
  process.stderr.write('Run `pnpm --filter @atom63/ui-foundation generate:contracts`.\n')
  process.exitCode = 1
} else if (!check) {
  process.stdout.write(`Wrote ${sources.size} component contracts.\n`)
}
