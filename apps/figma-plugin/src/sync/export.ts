/**
 * Figma → code: finds the variables whose value in the document differs from the
 * Atom63 sync model and turns them into a token patch. Pure, like `plan.ts`; the
 * repository applies the patch with `pnpm --filter @atom63/styles tokens:apply`.
 *
 * Only literal values in single-mode collections are exported: those map one to
 * one onto a `:root` custom property. Everything else is reported as skipped with
 * a reason instead of being dropped silently.
 */
import type { SnapshotCollection, SyncColor, SyncModel, SyncValue, SyncVariableType } from './plan'
import { valuesEqual } from './plan'

export interface ExportChange {
  /** CSS custom property, e.g. `--color-b1-500`. */
  token: string
  /** Figma variable name, e.g. `color/b1/500`. */
  name: string
  type: SyncVariableType
  from: SyncColor | number | string
  to: SyncColor | number | string
}

export interface ExportSkip {
  name: string
  reason: string
}

export interface ExportPlan {
  changes: ExportChange[]
  skipped: ExportSkip[]
}

export interface TokenPatch {
  format: 'atom63-token-patch'
  version: 1
  /** Keyed by CSS custom property. Colors are sRGB channels in 0..1. */
  tokens: Record<string, { type: SyncVariableType; value: SyncColor | number | string }>
}

function literal(value: SyncValue | undefined) {
  return value && 'value' in value ? value.value : undefined
}

export function planExport(model: SyncModel, snapshot: SnapshotCollection[]): ExportPlan {
  const changes: ExportChange[] = []
  const skipped: ExportSkip[] = []

  for (const collection of model.collections) {
    const current = snapshot.find(item => item.name === collection.name)
    if (!current) continue
    const byToken = new Map(
      current.variables.filter(item => item.token).map(item => [item.token, item])
    )

    for (const variable of collection.variables) {
      const actual = byToken.get(variable.token)
      if (!actual) continue
      const changedModes = collection.modes.filter(
        mode => !valuesEqual(variable.values[mode], actual.values[mode])
      )
      if (changedModes.length === 0) continue

      if (collection.modes.length !== 1) {
        skipped.push({ name: variable.name, reason: `${collection.name} has several modes` })
        continue
      }
      const [mode] = collection.modes
      const from = literal(variable.values[mode])
      const to = literal(actual.values[mode])
      if (from === undefined) {
        skipped.push({ name: variable.name, reason: 'an alias in code' })
        continue
      }
      if (to === undefined) {
        skipped.push({ name: variable.name, reason: 'an alias or unset value in Figma' })
        continue
      }
      if (variable.type === 'STRING') {
        skipped.push({ name: variable.name, reason: 'string tokens are not exported yet' })
        continue
      }
      changes.push({ token: variable.token, name: variable.name, type: variable.type, from, to })
    }
  }

  return { changes, skipped }
}

export function toTokenPatch(plan: ExportPlan): TokenPatch {
  return {
    format: 'atom63-token-patch',
    version: 1,
    tokens: Object.fromEntries(
      plan.changes.map(change => [change.token, { type: change.type, value: change.to }])
    ),
  }
}
