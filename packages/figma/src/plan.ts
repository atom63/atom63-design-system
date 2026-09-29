/**
 * Pure diff between a Figma sync model and a snapshot of the document's local
 * variables. The model is Atom63's (@atom63/styles/figma-sync.json) or one built
 * from a project's token CSS (css-model.ts). No Figma API here, so the
 * plan is unit-testable; `apply.ts` turns the plan into document writes.
 *
 * Variables are matched by the token in their web code syntax (`var(--token)`),
 * then by name inside the collection, so a renamed token path updates in place
 * and variables written without plugin data (an agent through MCP) are known.
 *
 * A token whose variable sits in another Atom63 collection than the model's
 * (Figma cannot move a variable between collections) is planned as a create
 * with `moveFrom`: apply.ts creates the new variable, moves bindings and
 * aliases onto it, and retires the old one instead of leaving a stale copy.
 */

export type SyncVariableType = 'COLOR' | 'FLOAT' | 'STRING'

export interface SyncColor {
  r: number
  g: number
  b: number
  a: number
}

/**
 * A literal, an alias to another token's variable, or a composed color: an alias
 * to a color token at an opacity from 0 to 100 (Figma's composed color value).
 */
export type SyncValue =
  | { alias: string }
  | { composed: { alias: string; opacity: number } }
  | { value: SyncColor | number | string }

export interface SyncVariable {
  name: string
  token: string
  type: SyncVariableType
  values: Record<string, SyncValue>
  /** Dev Mode's web code syntax, e.g. `var(--primary)`. Left alone when absent. */
  codeSyntax?: string
  /** Figma variable scopes; `[]` hides the variable from pickers. Left alone when absent. */
  scopes?: string[]
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
  codeSyntax?: string | null
  scopes?: string[]
}

export interface SnapshotCollection {
  id: string
  name: string
  modes: string[]
  variables: SnapshotVariable[]
}

export type VariableChange =
  | {
      kind: 'create'
      collection: string
      variable: SyncVariable
      /** The document variable this token moves from, in another collection. */
      moveFrom?: { id: string; collection: string }
    }
  | {
      kind: 'update'
      collection: string
      variable: SyncVariable
      id: string
      rename: boolean
      modes: string[]
      /** The code syntax or scopes differ from the model. */
      metadata: boolean
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
  totals: {
    /** Tokens moving to another collection (counted in `create` too). */
    move: number
    create: number
    update: number
    unchanged: number
    orphaned: number
    typeConflicts: number
  }
}

const COLOR_EPSILON = 1e-6
const FLOAT_EPSILON = 1e-6

/** Figma stores numbers as 32-bit floats, so the tolerance scales with the value. */
function numbersEqual(left: number, right: number): boolean {
  return Math.abs(left - right) < FLOAT_EPSILON * Math.max(1, Math.abs(left), Math.abs(right))
}

export function valuesEqual(expected: SyncValue, actual: SyncValue | undefined): boolean {
  if (!actual) return false
  if ('alias' in expected || 'alias' in actual) {
    return 'alias' in expected && 'alias' in actual && expected.alias === actual.alias
  }
  if ('composed' in expected || 'composed' in actual) {
    return (
      'composed' in expected &&
      'composed' in actual &&
      expected.composed.alias === actual.composed.alias &&
      numbersEqual(expected.composed.opacity, actual.composed.opacity)
    )
  }
  const left = expected.value
  const right = actual.value
  if (typeof left === 'number' && typeof right === 'number') return numbersEqual(left, right)
  if (typeof left !== 'object' || typeof right !== 'object') return left === right
  return (['r', 'g', 'b', 'a'] as const).every(
    channel => Math.abs(left[channel] - right[channel]) < COLOR_EPSILON
  )
}

/** Whether the document variable's code syntax or scopes differ from what the model sets. */
export function metadataDiffers(
  variable: SyncVariable,
  current: Pick<SnapshotVariable, 'codeSyntax' | 'scopes'>
): boolean {
  if (variable.codeSyntax !== undefined && variable.codeSyntax !== (current.codeSyntax ?? null))
    return true
  if (variable.scopes !== undefined) {
    const actual = new Set(current.scopes ?? [])
    if (actual.size !== variable.scopes.length || variable.scopes.some(scope => !actual.has(scope)))
      return true
  }
  return false
}

export function planSync(model: SyncModel, snapshot: SnapshotCollection[]): SyncPlan {
  const changes: VariableChange[] = []
  const collections: CollectionPlan[] = []

  // Where each token's variable lives now, and where the model puts it.
  const modelCollectionOf = new Map(
    model.collections.flatMap(collection =>
      collection.variables.map(variable => [variable.token, collection.name] as const)
    )
  )
  const documentVariableOf = new Map(
    snapshot.flatMap(collection =>
      collection.variables
        .filter(variable => variable.token)
        .map(
          variable =>
            [variable.token as string, { id: variable.id, collection: collection.name }] as const
        )
    )
  )

  for (const collection of model.collections) {
    const existing = snapshot.find(candidate => candidate.name === collection.name)
    const existingModes = existing?.modes ?? []
    // A collection Figma just created has one mode we can rename; an existing
    // Atom63 collection keeps its modes and only gains the missing ones.
    const renameFirstMode =
      existing && existingModes.length === 1 && !collection.modes.includes(existingModes[0])
        ? collection.modes[0]
        : null
    const knownModes = renameFirstMode ? [renameFirstMode] : existingModes
    const addModes = existing
      ? collection.modes.filter(mode => !knownModes.includes(mode))
      : collection.modes.slice(1)

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

    const byToken = new Map(
      existing?.variables.filter(item => item.token).map(item => [item.token, item]) ?? []
    )
    // The name fallback adopts only variables that stand for no token yet (an
    // older sync's, before code syntax), never one another token already claims.
    const byName = new Map(
      existing?.variables.filter(item => !item.token).map(item => [item.name, item]) ?? []
    )
    const matched = new Set<string>()

    for (const variable of collection.variables) {
      const byNameMatch = byName.get(variable.name)
      const current =
        byToken.get(variable.token) ??
        (byNameMatch && !matched.has(byNameMatch.id) ? byNameMatch : undefined)
      if (!current) {
        plan.create += 1
        const elsewhere = documentVariableOf.get(variable.token)
        changes.push(
          elsewhere && elsewhere.collection !== collection.name
            ? { kind: 'create', collection: collection.name, variable, moveFrom: elsewhere }
            : { kind: 'create', collection: collection.name, variable }
        )
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
      const metadata = metadataDiffers(variable, current)
      if (modes.length === 0 && !rename && !metadata && current.token === variable.token) {
        plan.unchanged += 1
        continue
      }
      plan.update += 1
      changes.push({
        kind: 'update',
        collection: collection.name,
        variable,
        id: current.id,
        rename,
        modes,
        metadata,
      })
    }

    const modelTokens = new Set(collection.variables.map(variable => variable.token))
    plan.orphaned =
      existing?.variables
        .filter(
          item =>
            item.token &&
            !matched.has(item.id) &&
            !modelTokens.has(item.token) &&
            // A token the model moved to another collection is not an orphan.
            !modelCollectionOf.has(item.token)
        )
        .map(item => item.name) ?? []

    collections.push(plan)
  }

  const sum = (key: 'create' | 'update' | 'unchanged') =>
    collections.reduce((total, item) => total + item[key], 0)
  return {
    collections,
    changes,
    totals: {
      move: changes.filter(change => change.kind === 'create' && change.moveFrom).length,
      create: sum('create'),
      update: sum('update'),
      unchanged: sum('unchanged'),
      orphaned: collections.reduce((total, item) => total + item.orphaned.length, 0),
      typeConflicts: collections.reduce((total, item) => total + item.typeConflicts.length, 0),
    },
  }
}
