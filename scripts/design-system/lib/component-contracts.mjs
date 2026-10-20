/**
 * Reads the component contract sources in packages/ui-foundation/contracts:
 * components/<slug>.json (one per component), shared/<name>.json (lists several
 * components use) and cross-renderer.json (the components with a SwiftUI
 * renderer, in catalog order). The format is described by
 * contracts/schema/component-intent.schema.json.
 *
 * A source has `lists` (the value lists a contract is made of: axes, states,
 * slots, token slots, or a map such as Frame's presets), a `contract` object
 * whose fields are literals or `{ "$ref": "#/lists/<key>" }` (another file:
 * `./button.json#/lists/sizes`, `../shared/selection.json#/lists/tokenSlots`),
 * optional `parts` with their own lists and contract (Input's `group`), and an
 * optional `crossRenderer` contract. The TypeScript names follow from the
 * component name; `exportPrefix`, `exportName` and `typeName` override them.
 */
import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'

export const contractsDir = 'packages/ui-foundation/contracts'

export const camel = slug => slug.replace(/-([a-z0-9])/g, (_, letter) => letter.toUpperCase())
export const pascal = name => camel(name).replace(/^./, letter => letter.toUpperCase())
export const singular = name => name.replace(/ies$/, 'y').replace(/s$/, '')

/** Every contract source, keyed by `components/<slug>` or `shared/<name>`. */
export function loadContractSources(root) {
  const sources = new Map()
  for (const folder of ['components', 'shared']) {
    const dir = path.join(root, contractsDir, folder)
    for (const file of readdirSync(dir)
      .filter(name => name.endsWith('.json'))
      .sort()) {
      const name = file.slice(0, -'.json'.length)
      const doc = JSON.parse(readFileSync(path.join(dir, file), 'utf8'))
      const declared = folder === 'components' ? doc.component : doc.shared
      if (declared !== name) {
        throw new Error(`${folder}/${file}: names itself "${declared}"; expected "${name}"`)
      }
      sources.set(`${folder}/${name}`, { id: `${folder}/${name}`, folder, name, doc })
    }
  }
  return sources
}

/** The components with a cross-renderer contract, in catalog order. */
export function loadCrossRendererOrder(root) {
  const index = JSON.parse(
    readFileSync(path.join(root, contractsDir, 'cross-renderer.json'), 'utf8')
  )
  if (index.version !== 3 || !Array.isArray(index.components)) {
    throw new Error('Unsupported cross-renderer index')
  }
  return index.components
}

/** The sections of a source: the main contract, then each part. */
export function sections(source) {
  const prefix = source.doc.exportPrefix ?? camel(source.name)
  const main = {
    source,
    part: null,
    prefix,
    lists: source.doc.lists ?? {},
    contract: source.doc.contract ?? null,
  }
  const parts = Object.entries(source.doc.parts ?? {}).map(([part, value]) => ({
    source,
    part,
    prefix: `${prefix}${pascal(part)}`,
    lists: value.lists ?? {},
    contract: value.contract ?? null,
  }))
  return [main, ...parts]
}

const entryOf = list => (Array.isArray(list) ? { values: list } : list)

/** A list of a section with its TypeScript names. */
export function listInfo(section, key) {
  const list = section.lists[key]
  if (list === undefined) {
    throw new Error(
      `${section.source.id}: no list "${key}"${section.part ? ` in part ${section.part}` : ''}`
    )
  }
  const entry = entryOf(list)
  const kind = entry.entries
    ? 'map'
    : entry.concat
      ? 'concat'
      : entry.flatten
        ? 'flatten'
        : 'values'
  const objects = kind === 'values' && entry.values.some(value => typeof value === 'object')
  return {
    section,
    key,
    entry,
    kind,
    exportName: entry.exportName ?? `${section.prefix}${pascal(key)}`,
    typeName:
      kind === 'map' || objects || entry.typed === false
        ? null
        : (entry.typeName ?? `${pascal(section.prefix)}${pascal(singular(key))}`),
  }
}

/** The values of a list, with concat and flatten resolved; a map has none. */
export function listValues(info) {
  const { entry, kind, section } = info
  if (kind === 'values') return entry.values
  if (kind === 'concat') return entry.concat.flatMap(key => listValues(listInfo(section, key)))
  if (kind === 'flatten') {
    return listValues(listInfo(section, entry.flatten)).flatMap(pair => Object.values(pair))
  }
  return undefined
}

/** Resolves a `$ref` from a section's contract to the list it names. */
export function resolveRef(sources, section, ref) {
  const match = /^(?:(\.\.?\/[\w/-]+)\.json)?#\/(?:parts\/([\w-]+)\/)?lists\/([\w-]+)$/.exec(ref)
  if (!match) throw new Error(`${section.source.id}: unsupported $ref "${ref}"`)
  const [, file, part, key] = match
  let source = section.source
  if (file) {
    const id = path.posix.normalize(path.posix.join(source.folder, file))
    source = sources.get(id)
    if (!source) throw new Error(`${section.source.id}: $ref "${ref}" names a missing file`)
  }
  const target = sections(source).find(
    candidate => candidate.part === (part ?? (file ? null : section.part))
  )
  if (!target) throw new Error(`${section.source.id}: $ref "${ref}" names a missing part`)
  return listInfo(target, key)
}

const isRef = value => value !== null && typeof value === 'object' && typeof value.$ref === 'string'

/** The contract fields of a section, each with the list it refers to or its type. */
export function contractFields(sources, section) {
  const refs = Object.entries(section.contract ?? {})
    .filter(([, value]) => isRef(value))
    .map(([field, value]) => [field, resolveRef(sources, section, value.$ref)])
  const byField = new Map(refs)
  return Object.entries(section.contract ?? {}).map(([field, value]) => {
    if (isRef(value)) return { field, value, list: byField.get(field) }
    if (field === 'accessibility') return { field, value, accessibility: true }
    const axis = /^default([A-Z]\w*)$/.exec(field)?.[1]
    if (axis) {
      const plural = [`${axis}s`, axis.replace(/y$/, 'ies')].map(name =>
        name.replace(/^./, l => l.toLowerCase())
      )
      const named = plural
        .map(name => byField.get(name) ?? (section.lists[name] && listInfo(section, name)))
        .find(Boolean)
      const holding = refs.filter(([, info]) => listValues(info)?.includes(value))
      const list = named ?? (holding.length === 1 ? holding[0][1] : undefined)
      if (list) {
        if (!listValues(list).includes(value)) {
          throw new Error(
            `${section.source.id}: ${field} "${value}" is not one of ${list.exportName}`
          )
        }
        return { field, value, defaultOf: list }
      }
    }
    if (typeof value !== 'string' && typeof value !== 'number') {
      throw new Error(`${section.source.id}: ${field} must be a $ref, a string or a number`)
    }
    return { field, value, primitive: typeof value }
  })
}
