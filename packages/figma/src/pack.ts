/**
 * A compact encoding of a token set for use_figma scripts, which are limited
 * to 50,000 characters: colors as 24-bit hex per channel (close enough that
 * the engine's 1e-6 comparison sees no change), aliases as `@--token`, shared
 * scope lists by index, and code syntax left out (it is always var(<token>)).
 */
import type {
  SnapshotCollection,
  SyncModel,
  SyncValue,
  SyncVariable,
  SyncVariableType,
} from './plan'
import type { StyleSet } from './styles'

export type PackedValue = number | string
export type PackedVariable = [
  token: string,
  name: string,
  type: 'C' | 'F' | 'S',
  value: PackedValue | PackedValue[],
  scopeIndex: number,
]
export interface PackedModel {
  /** Distinct scope lists; variables point at them by index. `null` means "leave alone". */
  s: (string[] | null)[]
  c: [name: string, modes: string[], variables: PackedVariable[]][]
  /** Text and effect styles; small, so they travel unpacked. */
  y?: StyleSet
}

const TYPE_CODE: Record<SyncVariableType, 'C' | 'F' | 'S'> = { COLOR: 'C', FLOAT: 'F', STRING: 'S' }
const CODE_TYPE = { C: 'COLOR', F: 'FLOAT', S: 'STRING' } as const

const CHANNEL_MAX = 0xffffff
const hex24 = (channel: number) =>
  Math.round(Math.min(1, Math.max(0, channel)) * CHANNEL_MAX)
    .toString(16)
    .padStart(6, '0')

function packValue(value: SyncValue): PackedValue {
  if ('alias' in value) return `@${value.alias}`
  if ('composed' in value) return `@${value.composed.alias}*${value.composed.opacity}`
  if (typeof value.value === 'object')
    return `#${[value.value.r, value.value.g, value.value.b, value.value.a].map(hex24).join('')}`
  return value.value
}

function unpackValue(packed: PackedValue, type: SyncVariableType): SyncValue {
  if (typeof packed === 'string' && packed.startsWith('@')) {
    const [alias, opacity] = packed.slice(1).split('*')
    return opacity === undefined ? { alias } : { composed: { alias, opacity: Number(opacity) } }
  }
  if (type === 'COLOR' && typeof packed === 'string' && packed.startsWith('#')) {
    const channel = (index: number) =>
      parseInt(packed.slice(1 + index * 6, 7 + index * 6), 16) / CHANNEL_MAX
    return { value: { r: channel(0), g: channel(1), b: channel(2), a: channel(3) } }
  }
  return { value: packed }
}

export function packModel(model: SyncModel): PackedModel {
  const keys: string[] = []
  const scopeIndex = (list: string[] | undefined) => {
    const key = JSON.stringify(list ?? null)
    const found = keys.indexOf(key)
    return found >= 0 ? found : keys.push(key) - 1
  }
  const c = model.collections.map(collection => {
    const variables = collection.variables.map((variable): PackedVariable => {
      if ((variable.codeSyntax ?? `var(${variable.token})`) !== `var(${variable.token})`)
        throw new Error(`${variable.name}: code syntax must be var(${variable.token})`)
      const values = collection.modes.map(mode => packValue(variable.values[mode]))
      const value = values.every(item => item === values[0]) ? values[0] : values
      return [
        variable.token.slice(2),
        variable.name,
        TYPE_CODE[variable.type],
        value,
        scopeIndex(variable.scopes),
      ]
    })
    return [collection.name, collection.modes, variables] as PackedModel['c'][number]
  })
  const s = keys.map(key => JSON.parse(key) as string[] | null)
  return model.styles ? { s, c, y: model.styles } : { s, c }
}

export function unpackModel(packed: PackedModel): SyncModel {
  const collections = packed.c.map(([name, modes, variables]) => ({
    name,
    modes,
    variables: variables.map(([tokenName, variableName, code, value, scope]): SyncVariable => {
      const type = CODE_TYPE[code]
      const token = `--${tokenName}`
      return {
        name: variableName,
        token,
        type,
        values: Object.fromEntries(
          modes.map((mode, index) => [
            mode,
            unpackValue(Array.isArray(value) ? value[index] : value, type),
          ])
        ),
        codeSyntax: `var(${token})`,
        scopes: packed.s[scope] ?? undefined,
      }
    }),
  }))
  const variables = collections.reduce((total, item) => total + item.variables.length, 0)
  return {
    schemaVersion: 1,
    summary: { collections: collections.length, variables, aliasValues: 0, skipped: 0 },
    collections,
    skipped: [],
    ...(packed.y ? { styles: packed.y } : {}),
  }
}

/**
 * A file's variables as the read script returns them: small enough to pass
 * through an agent. Ids are left out (diffing does not need them); a variable
 * with no code syntax has token 0.
 */
export interface PackedSnapshot {
  r: 1
  /** This page and how many there are; use_figma cuts a result at 20 KB, so reads come in pages. */
  page?: number
  pages?: number
  c: [
    name: string,
    modes: string[],
    variables: [name: string, token: string | 0, type: string, values: (PackedValue | null)[]][],
  ][]
}

const SNAPSHOT_TYPES: Record<string, string> = { C: 'COLOR', F: 'FLOAT', S: 'STRING', B: 'BOOLEAN' }

export function packSnapshot(snapshot: SnapshotCollection[]): PackedSnapshot {
  return {
    r: 1,
    c: snapshot.map(collection => [
      collection.name,
      collection.modes,
      collection.variables.map(variable => [
        variable.name,
        variable.token ?? 0,
        variable.type[0],
        collection.modes.map(mode => {
          const value = variable.values[mode]
          return value ? packValue(value) : null
        }),
      ]),
    ]),
  }
}

export function unpackSnapshot(packed: PackedSnapshot): SnapshotCollection[] {
  if (packed?.r !== 1 || !Array.isArray(packed.c))
    throw new Error('not a read result: run the read script and save what it returns')
  return packed.c.map(([name, modes, variables], collectionIndex) => ({
    id: `c${collectionIndex}`,
    name,
    modes,
    variables: variables.map(([variableName, token, code, values], index) => {
      const type = SNAPSHOT_TYPES[code] ?? code
      return {
        id: `c${collectionIndex}:${index}`,
        name: variableName,
        token: token === 0 ? null : token,
        type,
        values: Object.fromEntries(
          modes.map((mode, position) => {
            const value = values[position]
            return [mode, value === null ? undefined : unpackValue(value, type as SyncVariableType)]
          })
        ),
      }
    }),
  }))
}

/** Joins every page of a read into one snapshot; throws when a page is missing. */
export function mergeSnapshots(pages: PackedSnapshot[]): PackedSnapshot {
  const count = pages[0]?.pages ?? 1
  for (let page = 1; page <= count; page++)
    if (!pages.some(item => (item.page ?? 1) === page))
      throw new Error(`the read is missing page ${page} of ${count}; run that page's read script`)
  const merged: PackedSnapshot = { r: 1, c: [] }
  for (const page of [...pages].sort((left, right) => (left.page ?? 1) - (right.page ?? 1)))
    for (const [name, modes, variables] of page.c) {
      const found = merged.c.find(item => item[0] === name)
      if (found) found[2].push(...variables)
      else merged.c.push([name, modes, [...variables]])
    }
  return merged
}
