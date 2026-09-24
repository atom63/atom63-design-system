/**
 * Figma → code: finds the variables whose value in the document differs from the
 * Atom63 sync model and turns them into a token patch. Pure, like `plan.ts`; the
 * repository applies the patch with `pnpm --filter @atom63/styles tokens:apply`.
 *
 * Each changed mode of each variable becomes one change: a literal value, or an
 * alias to another Atom63 token variable. The repository writes a change in a
 * multi-mode collection (Mode, Brand, Surface…) into the DTCG resolver context
 * of that mode. What a patch cannot express is reported as skipped with a
 * reason instead of being dropped silently.
 */
import type { SnapshotCollection, SyncColor, SyncModel, SyncValue, SyncVariableType } from './plan'
import { valuesEqual } from './plan'

type Literal = SyncColor | number | string

export interface ExportChange {
  /** CSS custom property, e.g. `--color-b1-500`. */
  token: string
  /** Figma variable name, e.g. `color/b1/500`. */
  name: string
  collection: string
  /** The Figma mode that changed, e.g. `dark`, or `Value` in a single-mode collection. */
  mode: string
  type: SyncVariableType
  from: SyncValue | undefined
  to: { value: Literal } | { alias: string }
}

export interface ExportSkip {
  name: string
  reason: string
}

export interface ExportPlan {
  changes: ExportChange[]
  skipped: ExportSkip[]
}

export type TokenPatchChange = {
  token: string
  collection: string
  mode: string
  type: SyncVariableType
} & ({ value: Literal } | { alias: string })

export interface TokenPatch {
  format: 'atom63-token-patch'
  version: 2
  /** Colors are sRGB channels in 0..1; an alias names another token's CSS custom property. */
  changes: TokenPatchChange[]
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
      for (const mode of collection.modes) {
        const from = variable.values[mode]
        const to = actual.values[mode]
        if (valuesEqual(from, to)) continue
        const label = collection.modes.length === 1 ? variable.name : `${variable.name} (${mode})`
        if (!to) {
          skipped.push({ name: label, reason: 'an unset value in Figma' })
          continue
        }
        if (variable.type === 'STRING') {
          skipped.push({ name: label, reason: 'string tokens are not exported yet' })
          continue
        }
        if (from && 'alias' in from && 'value' in to) {
          skipped.push({
            name: label,
            reason: 'an alias in code; point it at another variable instead of a raw value',
          })
          continue
        }
        changes.push({
          token: variable.token,
          name: variable.name,
          collection: collection.name,
          mode,
          type: variable.type,
          from,
          to,
        })
      }
    }
  }

  return { changes, skipped }
}

export function toTokenPatch(plan: ExportPlan): TokenPatch {
  return {
    format: 'atom63-token-patch',
    version: 2,
    changes: plan.changes.map(({ token, collection, mode, type, to }) => ({
      token,
      collection,
      mode,
      type,
      ...to,
    })),
  }
}
