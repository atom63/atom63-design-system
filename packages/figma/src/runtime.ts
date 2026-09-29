/**
 * What runs inside Figma, in a use_figma script: `figma.variables` is the
 * VariablesApi, so the engine runs unchanged. Built into an IIFE, A63Figma,
 * and inlined into every script by scripts.ts.
 */
import { applyPlan, readDocument, readSnapshot, type VariablesApi } from './apply'
import { type PackedModel, type PackedSnapshot, packSnapshot, unpackModel } from './pack'
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
