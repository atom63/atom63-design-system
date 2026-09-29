/**
 * What runs inside Figma, in a use_figma script: `figma.variables` is the
 * VariablesApi, so the engine runs unchanged. Built into an IIFE, A63Figma,
 * and inlined into every script by scripts.ts.
 */
import { applyPlan, readSnapshot, type VariablesApi } from './apply'
import { type PackedModel, unpackModel } from './pack'
import { planSync } from './plan'

interface FigmaLike {
  variables: VariablesApi
}

export async function sync(figma: FigmaLike, packed: PackedModel) {
  const model = unpackModel(packed)
  const plan = planSync(model, await readSnapshot(figma.variables, model))
  const applied = await applyPlan(figma.variables, model, plan)
  const after = planSync(model, await readSnapshot(figma.variables, model))
  return { planned: plan.totals, applied, verification: after.totals }
}

export async function check(figma: FigmaLike, packed: PackedModel) {
  const model = unpackModel(packed)
  const plan = planSync(model, await readSnapshot(figma.variables, model))
  return { planned: plan.totals, verification: plan.totals }
}
