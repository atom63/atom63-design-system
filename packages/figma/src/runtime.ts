/**
 * What runs inside Figma, in a use_figma script: `figma.variables` is the
 * VariablesApi, so the engine runs unchanged. Built into an IIFE, A63Figma,
 * and inlined into every script by scripts.ts.
 */
import { applyPlan, readDocument, readSnapshot, type VariablesApi } from './apply'
import { type PackedModel, packSnapshot, unpackModel } from './pack'
import { planSync, type SyncPlan } from './plan'

interface FigmaLike {
  variables: VariablesApi
}

/**
 * A script carries one part of the token set, so it cannot tell which variables
 * the code dropped; `diff`, which has the whole set, reports those.
 */
function partTotals({ orphaned: _orphaned, ...totals }: SyncPlan['totals']) {
  return totals
}

export async function sync(figma: FigmaLike, packed: PackedModel) {
  const model = unpackModel(packed)
  const plan = planSync(model, await readSnapshot(figma.variables, model))
  const applied = await applyPlan(figma.variables, model, plan)
  const after = planSync(model, await readSnapshot(figma.variables, model))
  return { planned: partTotals(plan.totals), applied, verification: partTotals(after.totals) }
}

export async function check(figma: FigmaLike, packed: PackedModel) {
  const model = unpackModel(packed)
  const plan = planSync(model, await readSnapshot(figma.variables, model))
  return { planned: partTotals(plan.totals), verification: partTotals(plan.totals) }
}

/** Every variable in the file, with tokens from code syntax, for diffing against code. */
export async function read(figma: FigmaLike) {
  return packSnapshot(await readDocument(figma.variables))
}
