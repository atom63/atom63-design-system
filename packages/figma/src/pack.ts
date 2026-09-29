/**
 * A compact encoding of a token set for use_figma scripts, which are limited
 * to 50,000 characters: colors as 16-bit hex, aliases as `@--token`, shared
 * scope lists by index, and code syntax left out (it is always var(<token>)).
 */
import type { SyncModel, SyncValue, SyncVariable, SyncVariableType } from './plan'

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
}

const TYPE_CODE: Record<SyncVariableType, 'C' | 'F' | 'S'> = { COLOR: 'C', FLOAT: 'F', STRING: 'S' }
const CODE_TYPE = { C: 'COLOR', F: 'FLOAT', S: 'STRING' } as const

const hex16 = (channel: number) =>
  Math.round(Math.min(1, Math.max(0, channel)) * 65535)
    .toString(16)
    .padStart(4, '0')

function packValue(value: SyncValue): PackedValue {
  if ('alias' in value) return `@${value.alias}`
  if ('composed' in value) return `@${value.composed.alias}*${value.composed.opacity}`
  if (typeof value.value === 'object')
    return `#${[value.value.r, value.value.g, value.value.b, value.value.a].map(hex16).join('')}`
  return value.value
}

function unpackValue(packed: PackedValue, type: SyncVariableType): SyncValue {
  if (typeof packed === 'string' && packed.startsWith('@')) {
    const [alias, opacity] = packed.slice(1).split('*')
    return opacity === undefined ? { alias } : { composed: { alias, opacity: Number(opacity) } }
  }
  if (type === 'COLOR' && typeof packed === 'string' && packed.startsWith('#')) {
    const channel = (index: number) =>
      parseInt(packed.slice(1 + index * 4, 5 + index * 4), 16) / 65535
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
  return { s: keys.map(key => JSON.parse(key) as string[] | null), c }
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
  }
}
