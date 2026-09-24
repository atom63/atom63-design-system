/**
 * Reads the document into a plan snapshot and applies a sync plan. Written
 * against the small slice of `figma.variables` it needs, so tests can run it
 * on an in-memory fake and prove a second sync plans zero changes.
 */
import type {
  SnapshotCollection,
  SnapshotVariable,
  SyncModel,
  SyncPlan,
  SyncValue,
  SyncVariableType,
} from './plan'

export const TOKEN_KEY = 'a63.token'

export interface ModeLike {
  modeId: string
  name: string
}

export interface CollectionLike {
  id: string
  name: string
  modes: readonly ModeLike[]
  variableIds: readonly string[]
  addMode(name: string): string
  renameMode(modeId: string, name: string): void
}

export type RawValue =
  | { type: 'VARIABLE_ALIAS'; id: string }
  | { r: number; g: number; b: number; a?: number }
  | number
  | string
  | boolean

export interface VariableLike {
  id: string
  name: string
  resolvedType: string
  /** Figma also stores values the sync never writes (booleans, easing curves). */
  valuesByMode: Record<string, unknown>
  setValueForMode(modeId: string, value: RawValue): void
  getPluginData(key: string): string
  setPluginData(key: string, value: string): void
  /** Hides a retired variable from library publishing (Figma `Variable`). */
  hiddenFromPublishing?: boolean
}

export interface VariablesApi {
  getLocalVariableCollectionsAsync(): Promise<CollectionLike[]>
  getVariableByIdAsync(id: string): Promise<VariableLike | null>
  createVariableCollection(name: string): CollectionLike
  createVariable(name: string, collection: CollectionLike, type: SyncVariableType): VariableLike
  createVariableAlias(variable: VariableLike): RawValue
  /**
   * Moves every binding in the document (nodes, styles, other variables' aliases)
   * from one variable to another, and counts the bindings it could not move.
   * Optional so tests can run without a document.
   */
  rebindBindings?(
    from: VariableLike,
    to: VariableLike
  ): Promise<{ rebound: number; remaining: number }>
}

export interface ApplyResult {
  createdCollections: number
  addedModes: number
  created: number
  updated: number
  /** Tokens moved to another collection; their old variables are retired, not deleted. */
  moved: number
  bindingsRebound: number
  /** Bindings still on a retired variable; the plugin reports them. */
  bindingsRemaining: number
}

/** Prefix of a retired variable's name: kept, so no design loses a binding. */
export const MOVED_PREFIX = '(moved)'

function isAlias(value: unknown): value is { type: 'VARIABLE_ALIAS'; id: string } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'type' in value &&
    value.type === 'VARIABLE_ALIAS' &&
    'id' in value
  )
}

function isColor(value: unknown): value is { r: number; g: number; b: number; a?: number } {
  return typeof value === 'object' && value !== null && 'r' in value && 'g' in value && 'b' in value
}

/** The snapshot form of a stored value; values the sync never writes read as absent. */
async function snapshotValue(
  raw: unknown,
  tokenOf: (id: string) => Promise<string>
): Promise<SyncValue | undefined> {
  if (isAlias(raw)) return { alias: await tokenOf(raw.id) }
  if (isColor(raw)) return { value: { r: raw.r, g: raw.g, b: raw.b, a: raw.a ?? 1 } }
  if (typeof raw === 'number' || typeof raw === 'string') return { value: raw }
  return undefined
}

async function loadCollections(api: VariablesApi, model: SyncModel) {
  const names = new Set(model.collections.map(collection => collection.name))
  const collections = (await api.getLocalVariableCollectionsAsync()).filter(collection =>
    names.has(collection.name)
  )
  const variables = new Map<string, VariableLike>()
  for (const collection of collections) {
    for (const id of collection.variableIds) {
      const variable = await api.getVariableByIdAsync(id)
      if (variable) variables.set(id, variable)
    }
  }
  return { collections, variables }
}

export async function readSnapshot(
  api: VariablesApi,
  model: SyncModel
): Promise<SnapshotCollection[]> {
  const { collections, variables } = await loadCollections(api, model)

  const tokenOf = async (id: string) => {
    const target = variables.get(id) ?? (await api.getVariableByIdAsync(id))
    return target?.getPluginData(TOKEN_KEY) || `id:${id}`
  }

  const snapshot: SnapshotCollection[] = []
  for (const collection of collections) {
    const items: SnapshotVariable[] = []
    for (const id of collection.variableIds) {
      const variable = variables.get(id)
      if (!variable) continue
      const values: Record<string, SyncValue | undefined> = {}
      for (const mode of collection.modes) {
        values[mode.name] = await snapshotValue(variable.valuesByMode[mode.modeId], tokenOf)
      }
      items.push({
        id,
        name: variable.name,
        token: variable.getPluginData(TOKEN_KEY) || null,
        type: variable.resolvedType,
        values,
      })
    }
    snapshot.push({
      id: collection.id,
      name: collection.name,
      modes: collection.modes.map(mode => mode.name),
      variables: items,
    })
  }
  return snapshot
}

export async function applyPlan(
  api: VariablesApi,
  model: SyncModel,
  plan: SyncPlan
): Promise<ApplyResult> {
  const result: ApplyResult = {
    createdCollections: 0,
    addedModes: 0,
    created: 0,
    updated: 0,
    moved: 0,
    bindingsRebound: 0,
    bindingsRemaining: 0,
  }
  const { collections, variables } = await loadCollections(api, model)
  const collectionByName = new Map(collections.map(collection => [collection.name, collection]))

  for (const collectionPlan of plan.collections) {
    let collection = collectionByName.get(collectionPlan.name)
    const modelCollection = model.collections.find(item => item.name === collectionPlan.name)
    if (!modelCollection) continue
    if (!collection) {
      collection = api.createVariableCollection(collectionPlan.name)
      collectionByName.set(collection.name, collection)
      result.createdCollections += 1
      collection.renameMode(collection.modes[0].modeId, modelCollection.modes[0])
    } else if (collectionPlan.renameFirstMode) {
      collection.renameMode(collection.modes[0].modeId, collectionPlan.renameFirstMode)
    }
    for (const mode of collectionPlan.addModes) {
      try {
        collection.addMode(mode)
      } catch (error) {
        throw new Error(
          `Could not add mode "${mode}" to ${collection.name}. Atom63 axes need up to 6 modes per collection, which needs a Figma Professional plan or higher.`,
          { cause: error }
        )
      }
      result.addedModes += 1
    }
  }

  const byToken = new Map<string, VariableLike>()
  for (const variable of variables.values()) {
    const token = variable.getPluginData(TOKEN_KEY)
    if (token) byToken.set(token, variable)
  }

  // Create every new variable before writing values so aliases can point at
  // variables created in the same run.
  const targets: { change: SyncPlan['changes'][number]; variable: VariableLike }[] = []
  for (const change of plan.changes) {
    const collection = collectionByName.get(change.collection)
    if (!collection) continue
    if (change.kind === 'create') {
      const variable = api.createVariable(change.variable.name, collection, change.variable.type)
      variable.setPluginData(TOKEN_KEY, change.variable.token)
      byToken.set(change.variable.token, variable)
      targets.push({ change, variable })
      result.created += 1
    } else {
      const variable = variables.get(change.id) ?? (await api.getVariableByIdAsync(change.id))
      if (!variable) continue
      if (change.rename) variable.name = change.variable.name
      variable.setPluginData(TOKEN_KEY, change.variable.token)
      byToken.set(change.variable.token, variable)
      targets.push({ change, variable })
      result.updated += 1
    }
  }

  for (const { change, variable } of targets) {
    const collection = collectionByName.get(change.collection)
    if (!collection) continue
    const modeIds = new Map(collection.modes.map(mode => [mode.name, mode.modeId]))
    const modes = change.kind === 'create' ? Object.keys(change.variable.values) : change.modes
    for (const mode of modes) {
      const modeId = modeIds.get(mode)
      const value = change.variable.values[mode]
      if (!modeId || !value) continue
      if ('alias' in value) {
        const target = byToken.get(value.alias)
        if (!target)
          throw new Error(
            `${change.variable.name}: alias target ${value.alias} is not in the document`
          )
        variable.setValueForMode(modeId, api.createVariableAlias(target))
      } else {
        variable.setValueForMode(modeId, value.value)
      }
    }
  }

  // Moved tokens: point everything at the new variable, then retire the old one.
  for (const { change, variable } of targets) {
    if (change.kind !== 'create' || !change.moveFrom) continue
    const old =
      variables.get(change.moveFrom.id) ?? (await api.getVariableByIdAsync(change.moveFrom.id))
    if (!old) continue
    for (const other of variables.values()) {
      for (const [modeId, raw] of Object.entries(other.valuesByMode)) {
        if (isAlias(raw) && raw.id === old.id) {
          other.setValueForMode(modeId, api.createVariableAlias(variable))
        }
      }
    }
    if (api.rebindBindings) {
      const { rebound, remaining } = await api.rebindBindings(old, variable)
      result.bindingsRebound += rebound
      result.bindingsRemaining += remaining
    }
    old.name = `${MOVED_PREFIX}/${old.name}`
    old.setPluginData(TOKEN_KEY, '')
    old.hiddenFromPublishing = true
    result.moved += 1
  }

  return result
}
