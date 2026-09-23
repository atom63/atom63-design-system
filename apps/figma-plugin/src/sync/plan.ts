/**
 * Pure diff between the Atom63 Figma sync model (@atom63/styles/figma-sync.json)
 * and a snapshot of the document's local variables. No Figma API here, so the
 * plan is unit-testable; `apply.ts` turns the plan into document writes.
 *
 * Variables are matched by the `token` plugin data the sync writes, then by
 * name inside the collection, so a renamed token path updates in place.
 */

export type SyncVariableType = 'COLOR' | 'FLOAT' | 'STRING'

export interface SyncColor {
  r: number
  g: number
  b: number
  a: number
}

export type SyncValue = { alias: string } | { value: SyncColor | number | string }

export interface SyncVariable {
  name: string
  token: string
  type: SyncVariableType
  values: Record<string, SyncValue>
}

export interface SyncCollection {
  name: string
  modes: string[]
  variables: SyncVariable[]
}

export interface SyncModel {
  schemaVersion: number
  summary: { collections: number; variables: number; aliasValues: number; skipped: number }
  collections: SyncCollection[]
  skipped: { token: string; reason: string }[]
}

/** Document state, reduced to what the plan compares. */
export interface SnapshotVariable {
  id: string
  name: string
  token: string | null
  type: string
  /** Keyed by mode name. Aliases are resolved to the target variable's token. */
  values: Record<string, SyncValue | undefined>
}

export interface SnapshotCollection {
  id: string
  name: string
  modes: string[]
  variables: SnapshotVariable[]
}

export type VariableChange =
  | { kind: 'create'; collection: string; variable: SyncVariable }
  | {
      kind: 'update'
      collection: string
      variable: SyncVariable
      id: string
      rename: boolean
      modes: string[]
    }

export interface CollectionPlan {
  name: string
  exists: boolean
  /** Modes to add, in model order. */
  addModes: string[]
  /** Existing mode renamed to the model's first mode (a new collection's "Mode 1"). */
  renameFirstMode: string | null
  create: number
  update: number
  unchanged: number
  /** Variables carrying an Atom63 token that the model no longer has. */
  orphaned: string[]
  /** Same name, different Figma type: Figma cannot change a variable's type. */
  typeConflicts: string[]
}

export interface SyncPlan {
  collections: CollectionPlan[]
  changes: VariableChange[]
  totals: { create: number; update: number; unchanged: number; orphaned: number; typeConflicts: number }
}

const COLOR_EPSILON = 1e-6
const FLOAT_EPSILON = 1e-6

export function valuesEqual(expected: SyncValue, actual: SyncValue | undefined): boolean {
  if (!actual) return false
  if ('alias' in expected || 'alias' in actual) {
    return 'alias' in expected && 'alias' in actual && expected.alias === actual.alias
  }
  const left = expected.value
  const right = actual.value
  if (typeof left === 'number' && typeof right === 'number') return Math.abs(left - right) < FLOAT_EPSILON
  if (typeof left !== 'object' || typeof right !== 'object') return left === right
  return (['r', 'g', 'b', 'a'] as const).every(channel => Math.abs(left[channel] - right[channel]) < COLOR_EPSILON)
}

export function planSync(model: SyncModel, snapshot: SnapshotCollection[]): SyncPlan {
  const changes: VariableChange[] = []
  const collections: CollectionPlan[] = []

  for (const collection of model.collections) {
    const existing = snapshot.find(candidate => candidate.name === collection.name)
    const existingModes = existing?.modes ?? []
    // A collection Figma just created has one mode we can rename; an existing
    // Atom63 collection keeps its modes and only gains the missing ones.
    const renameFirstMode =
      existing && existingModes.length === 1 && !collection.modes.includes(existingModes[0]) ? collection.modes[0] : null
    const knownModes = renameFirstMode ? [renameFirstMode] : existingModes
    const addModes = existing ? collection.modes.filter(mode => !knownModes.includes(mode)) : collection.modes.slice(1)

    const plan: CollectionPlan = {
      name: collection.name,
      exists: Boolean(existing),
      addModes,
      renameFirstMode,
      create: 0,
      update: 0,
      unchanged: 0,
      orphaned: [],
      typeConflicts: [],
    }

    const byToken = new Map(existing?.variables.filter(item => item.token).map(item => [item.token, item]) ?? [])
    const byName = new Map(existing?.variables.map(item => [item.name, item]) ?? [])
    const matched = new Set<string>()

    for (const variable of collection.variables) {
      const current = byToken.get(variable.token) ?? byName.get(variable.name)
      if (!current) {
        plan.create += 1
        changes.push({ kind: 'create', collection: collection.name, variable })
        continue
      }
      matched.add(current.id)
      if (current.type !== variable.type) {
        plan.typeConflicts.push(variable.name)
        continue
      }
      const modes = collection.modes.filter(mode => {
        const currentMode = renameFirstMode && mode === renameFirstMode ? existingModes[0] : mode
        return !valuesEqual(variable.values[mode], current.values[currentMode])
      })
      const rename = current.name !== variable.name
      if (modes.length === 0 && !rename && current.token === variable.token) {
        plan.unchanged += 1
        continue
      }
      plan.update += 1
      changes.push({ kind: 'update', collection: collection.name, variable, id: current.id, rename, modes })
    }

    const modelTokens = new Set(collection.variables.map(variable => variable.token))
    plan.orphaned =
      existing?.variables
        .filter(item => item.token && !matched.has(item.id) && !modelTokens.has(item.token))
        .map(item => item.name) ?? []

    collections.push(plan)
  }

  const sum = (key: 'create' | 'update' | 'unchanged') => collections.reduce((total, item) => total + item[key], 0)
  return {
    collections,
    changes,
    totals: {
      create: sum('create'),
      update: sum('update'),
      unchanged: sum('unchanged'),
      orphaned: collections.reduce((total, item) => total + item.orphaned.length, 0),
      typeConflicts: collections.reduce((total, item) => total + item.typeConflicts.length, 0),
    },
  }
}
