/**
 * What runs inside Figma in a component script: the component sync and the
 * spec card. Built into its own IIFE, A63Figma, and inlined into every
 * component script by components/scripts.ts, so token scripts stay small.
 */
import type { NodesApi } from './components/nodes-api'
import { type PackedComponentModel, unpackComponentModel } from './components/pack-component'
import {
  type ComponentPlan,
  type Difference,
  planComponent,
  syncComponent,
} from './components/sync-component'

/** A component plan as counts, so a script's result stays well under use_figma's 20 KB. */
export interface ComponentCounts {
  missingVariables: string[]
  /** Derived variables to create or update. */
  variables: number
  create: number
  update: number
  unchanged: number
  /** The first differing check of up to 12 differing variants; only when any. */
  differences?: Difference[]
  /** Up to 12 variants whose Label reference Figma is still reconciling; only when any. */
  pendingReferences?: string[]
}
const countsOf = (plan: ComponentPlan): ComponentCounts => ({
  missingVariables: plan.missingVariables,
  variables: plan.variables.length,
  create: plan.create.length,
  update: plan.update.length,
  unchanged: plan.unchanged,
  ...(plan.differences ? { differences: plan.differences } : {}),
  ...(plan.pendingReferences ? { pendingReferences: plan.pendingReferences } : {}),
})

/**
 * Syncs the variants a component script carries: plan, apply, plan again, and
 * re-apply once the variants that verification still lists (`retried`,
 * with `retryErrors` for any the retry could not write). A Label reference
 * Figma is still reconciling is listed in `pendingReferences`.
 */
export async function syncComponentPart(figma: NodesApi, packed: PackedComponentModel) {
  const model = unpackComponentModel(packed)
  const { planned, applied, verification, retried, retryErrors } = await syncComponent(figma, model)
  return {
    variants: model.variants.length,
    planned: countsOf(planned),
    applied: { ...applied, fontFallbacks: [...new Set(applied.fontFallbacks)] },
    ...(retried ? { retried } : {}),
    ...(retryErrors ? { retryErrors } : {}),
    verification: countsOf(verification),
  }
}

/** Plans the variants a component script carries; only reads. */
export async function checkComponentPart(figma: NodesApi, packed: PackedComponentModel) {
  const model = unpackComponentModel(packed)
  return { variants: model.variants.length, planned: countsOf(await planComponent(figma, model)) }
}
