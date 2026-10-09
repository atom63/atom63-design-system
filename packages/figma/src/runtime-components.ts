/**
 * What runs inside Figma in a component script: the component sync and the
 * spec card. Built into its own IIFE, A63Figma, and inlined into every
 * component script by components/scripts.ts, so token scripts stay small.
 */
import type { NodesApi } from './components/nodes-api'
import { type PackedComponentModel, unpackComponentModel } from './components/pack-component'
import { countsOf } from './components/counts'
import { planComponent, syncComponent } from './components/sync-component'

export type { ComponentCounts } from './components/counts'

/**
 * Syncs the variants a component script carries: plan, apply, plan again, and
 * re-apply once the variants that verification still lists (`retried`,
 * with `retryErrors` for any the retry could not write). A variant with a
 * component property reference on the default variant (Label or Icon) Figma
 * is still reconciling is listed in `pendingReferences`.
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
