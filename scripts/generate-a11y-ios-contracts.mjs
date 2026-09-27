/**
 * Writes the iOS side of the APG pattern contracts into the demo app's UI
 * test target: every pattern in @atom63/ui-foundation with an `ios` section,
 * with the catalog showcase it is checked in. A pattern reaches its showcase
 * through the component contract bound to it and that component's
 * cross-renderer contract (`catalogItem`).
 *
 * Usage: node scripts/generate-a11y-ios-contracts.mjs [--check]
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

import { createServer, defaultServerConditions } from 'vite'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outputPath = path.join(
  root,
  'examples/ios-demo/Atom63DemoUITests/A11yContracts.generated.swift'
)
const crossRenderer = JSON.parse(
  readFileSync(
    path.join(root, 'packages/ui-foundation/contracts/cross-renderer-contracts.json'),
    'utf8'
  )
)

const conditions = ['@atom63/source', ...defaultServerConditions]
const server = await createServer({
  appType: 'custom',
  configFile: false,
  logLevel: 'silent',
  optimizeDeps: { include: [], noDiscovery: true },
  root,
  server: { hmr: false, middlewareMode: true, watch: null },
  ssr: { noExternal: [/^@atom63\//], resolve: { conditions, externalConditions: conditions } },
})
let foundation
try {
  foundation = await server.ssrLoadModule(path.join(root, 'packages/ui-foundation/src/index.ts'))
} finally {
  await server.close()
}

const kebab = name => name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()

/* Component contracts bound to a pattern, keyed by pattern id. */
const componentsByPattern = new Map()
for (const [name, value] of Object.entries(foundation)) {
  if (!name.endsWith('Contract') || !value?.accessibility?.pattern) continue
  const list = componentsByPattern.get(value.accessibility.pattern) ?? []
  list.push(kebab(name.slice(0, -'Contract'.length)))
  componentsByPattern.set(value.accessibility.pattern, list)
}

const elementTypes = {
  alert: '.alert',
  button: '.button',
  staticText: '.staticText',
  switch: '.switch',
}
const scopes = { app: '.app', popup: '.popup', preview: '.preview' }

const str = value => JSON.stringify(value)
const optional = value =>
  value === undefined ? 'nil' : typeof value === 'string' ? str(value) : String(value)

function position(at) {
  if (at === undefined) return 'nil'
  if (typeof at === 'number') return `.index(${at})`
  return `.${at}`
}

function target(pattern, value) {
  if (!pattern.ios.parts[value.part]) {
    throw new Error(`${pattern.id}: iOS target names an unknown part "${value.part}"`)
  }
  return `.init(part: ${str(value.part)}, at: ${position(value.at)}, label: ${optional(value.label)})`
}

function check(pattern, value) {
  const fields = ['exists', 'enabled', 'selected', 'value', 'labelIncludes']
  if (!fields.some(field => value[field] !== undefined)) {
    throw new Error(`${pattern.id}: an iOS check states no fact`)
  }
  return `.init(target: ${target(pattern, value.target)}, ${fields
    .map(field => `${field}: ${optional(value[field])}`)
    .join(', ')})`
}

const list = (items, indent) =>
  items.length === 0
    ? '[]'
    : `[\n${items.map(item => `${indent}  ${item},`).join('\n')}\n${indent}]`

const contracts = []
for (const pattern of Object.values(foundation.a11yPatterns).sort((a, b) =>
  a.id.localeCompare(b.id)
)) {
  if (!pattern.ios) continue
  const components = componentsByPattern.get(pattern.id) ?? []
  const catalogItems = components
    .map(
      id =>
        crossRenderer.contracts.find(contract => contract.foundationContract === id)?.catalogItem
    )
    .filter(Boolean)
  if (catalogItems.length !== 1) {
    throw new Error(
      `${pattern.id}: expected one catalog showcase through its component contract, found ${catalogItems.length}`
    )
  }
  const parts = Object.entries(pattern.ios.parts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([id, part]) => {
      if (!elementTypes[part.type]) throw new Error(`${pattern.id}: unknown iOS type ${part.type}`)
      return `${str(id)}: .init(type: ${elementTypes[part.type]}, nameRequired: ${part.name === 'required'}, scope: ${scopes[part.scope ?? 'preview']})`
    })
  const interactions = pattern.ios.interactions.map(
    interaction => `.init(
        id: ${str(interaction.id)},
        on: ${target(pattern, interaction.on)},
        given: ${list(
          (interaction.given ?? []).map(value => check(pattern, value)),
          '        '
        )},
        then: ${list(
          interaction.then.map(value => check(pattern, value)),
          '        '
        )},
        result: ${str(interaction.result)}
      )`
  )
  contracts.push(`  .init(
    pattern: ${str(pattern.id)},
    catalogItem: ${str(catalogItems[0])},
    parts: [
${parts.map(part => `      ${part},`).join('\n')}
    ],
    structure: ${list(
      pattern.ios.structure.map(value => check(pattern, value)),
      '    '
    )},
    interactions: ${list(interactions, '    ')}
  )`)
}

const output = `// Generated by scripts/generate-a11y-ios-contracts.mjs from the APG pattern
// contracts in @atom63/ui-foundation (src/a11y). Do not edit; change the
// contract and run \`pnpm --filter @atom63/ui-foundation generate:a11y-ios\`.

import XCTest

extension A11yIOSContract {
  static let all: [A11yIOSContract] = [
${contracts.join(',\n')},
  ]
}
`

if (process.argv.includes('--check')) {
  if (!existsSync(outputPath) || readFileSync(outputPath, 'utf8') !== output) {
    process.stderr.write(
      'A11yContracts.generated.swift is stale. Run `pnpm --filter @atom63/ui-foundation generate:a11y-ios` and commit it.\n'
    )
    process.exit(1)
  }
  process.stdout.write(`iOS accessibility contracts are current (${contracts.length} patterns).\n`)
} else {
  writeFileSync(outputPath, output)
  process.stdout.write(`Wrote ${path.relative(root, outputPath)} (${contracts.length} patterns).\n`)
}
