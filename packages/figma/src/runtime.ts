/**
 * What runs inside Figma, in a use_figma script: `figma.variables` is the
 * VariablesApi, so the engine runs unchanged. Built into an IIFE, A63Figma,
 * and inlined into every script by scripts.ts.
 */
import { applyPlan, type ApplyResult, readDocument, readSnapshot } from './apply'
import type { NodesApi } from './components/nodes-api'
import { type PackedComponentModel, unpackComponentModel } from './components/pack-component'
import { type ComponentPlan, planComponent, syncComponent } from './components/sync-component'
import { type PackedModel, type PackedSnapshot, packSnapshot, unpackModel } from './pack'
import { planSync, type SyncModel, type SyncPlan } from './plan'
import {
  applyStyles,
  planStyles,
  type StylePlan,
  type StyleResult,
  type StylesApi,
} from './style-sync'

type FigmaLike = StylesApi

/**
 * A script carries one part of the token set, so it cannot tell which variables
 * the code dropped; `diff`, which has the whole set, reports those.
 */
function partTotals({ orphaned: _orphaned, ...totals }: SyncPlan['totals']) {
  return totals
}

export type PartTotals = Omit<SyncPlan['totals'], 'orphaned'>
export interface CheckOutcome {
  planned: PartTotals
  verification: PartTotals
  styles?: StylePlan
}
export interface SyncOutcome {
  planned: PartTotals
  applied: ApplyResult
  verification: PartTotals
  styles?: { planned: StylePlan; applied: StyleResult; verification: StylePlan }
}

export async function syncModel(figma: FigmaLike, model: SyncModel): Promise<SyncOutcome> {
  const plan = planSync(model, await readSnapshot(figma.variables, model))
  const applied = await applyPlan(figma.variables, model, plan)
  const after = planSync(model, await readSnapshot(figma.variables, model))
  const result = {
    planned: partTotals(plan.totals),
    applied,
    verification: partTotals(after.totals),
  }
  if (!model.styles) return result
  const stylePlan = await planStyles(figma, model.styles)
  const styleApplied = await applyStyles(figma, model.styles, stylePlan)
  return {
    ...result,
    styles: {
      planned: stylePlan,
      applied: styleApplied,
      verification: await planStyles(figma, model.styles),
    },
  }
}

export async function checkModel(figma: FigmaLike, model: SyncModel): Promise<CheckOutcome> {
  const plan = planSync(model, await readSnapshot(figma.variables, model))
  const result = { planned: partTotals(plan.totals), verification: partTotals(plan.totals) }
  if (!model.styles) return result
  const coming = new Map(
    plan.changes.flatMap(change =>
      change.kind === 'create' ? [[change.variable.token, change.variable.type] as const] : []
    )
  )
  return { ...result, styles: await planStyles(figma, model.styles, coming) }
}

export const sync = (figma: FigmaLike, packed: PackedModel) => syncModel(figma, unpackModel(packed))
export const check = (figma: FigmaLike, packed: PackedModel) =>
  checkModel(figma, unpackModel(packed))

/** A component plan as counts, so a script's result stays well under use_figma's 20 KB. */
export interface ComponentCounts {
  missingVariables: string[]
  /** Derived variables to create or update. */
  variables: number
  create: number
  update: number
  unchanged: number
}
const countsOf = (plan: ComponentPlan): ComponentCounts => ({
  missingVariables: plan.missingVariables,
  variables: plan.variables.length,
  create: plan.create.length,
  update: plan.update.length,
  unchanged: plan.unchanged,
})

/** Syncs the variants a component script carries: plan, apply, plan again. */
export async function syncComponentPart(figma: NodesApi, packed: PackedComponentModel) {
  const model = unpackComponentModel(packed)
  const { planned, applied, verification } = await syncComponent(figma, model)
  return {
    variants: model.variants.length,
    planned: countsOf(planned),
    applied: { ...applied, fontFallbacks: [...new Set(applied.fontFallbacks)] },
    verification: countsOf(verification),
  }
}

/** Plans the variants a component script carries; only reads. */
export async function checkComponentPart(figma: NodesApi, packed: PackedComponentModel) {
  const model = unpackComponentModel(packed)
  return { variants: model.variants.length, planned: countsOf(await planComponent(figma, model)) }
}

/** Largest page a read returns, with room to spare; use_figma cuts a result at 20 KB. */
const PAGE_LIMIT = 14_000

/**
 * One page of the file's variables, with tokens from code syntax, for diffing
 * against code. Pages cut the variables in document order by packed size, so
 * the same file always pages the same way.
 */
export async function read(figma: FigmaLike, page = 1) {
  const whole = packSnapshot(await readDocument(figma.variables))
  const pages: PackedSnapshot['c'][] = [[]]
  let size = 0
  for (const [name, modes, variables] of whole.c) {
    for (const variable of variables) {
      const current = pages[pages.length - 1]
      const last = current[current.length - 1]
      const header = last && last[0] === name ? 0 : JSON.stringify([name, modes, []]).length + 1
      const length = JSON.stringify(variable).length + 1 + header
      if (size + length > PAGE_LIMIT && size > 0) {
        pages.push([[name, modes, [variable]]])
        size = JSON.stringify([name, modes, []]).length + JSON.stringify(variable).length + 2
        continue
      }
      if (header) current.push([name, modes, [variable]])
      else last[2].push(variable)
      size += length
    }
  }
  const index = Math.min(Math.max(1, page), pages.length)
  return { r: 1 as const, page: index, pages: pages.length, c: pages[index - 1] }
}
