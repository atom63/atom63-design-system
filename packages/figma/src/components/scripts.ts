/**
 * Turns a component model into use_figma scripts: the runtime plus a packed
 * slice of the variants, each under Figma MCP's 50,000-character limit.
 * Variants are taken in model order and cut greedily, so the first script
 * makes the page and the set and later ones add to it. A slice carries only
 * the tokens its variants bind; the reporting lists (`literals`, `skipped`)
 * stay with the CLI summary.
 */
import { RUNTIME_SOURCE } from '../runtime-source.generated'
import { tokensOf } from './component-values'
import type { ComponentModel, VariantSpec } from './model'
import { type PackedComponentModel, packComponentModel } from './pack-component'

/** Figma MCP accepts 50,000 characters; keep a margin for how the host passes the code. */
const LIMIT = 49_000

const ACTIONS = { sync: 'syncComponentPart', check: 'checkComponentPart' } as const

function sliceOf(model: ComponentModel, variants: VariantSpec[]): ComponentModel {
  const tokens = [...new Set(variants.flatMap(variant => variant.layers.flatMap(tokensOf)))]
  return { ...model, variants, tokens, literals: [], skipped: [] }
}

function wrap(packed: PackedComponentModel, action: 'sync' | 'check', part: number, parts: number) {
  return `${RUNTIME_SOURCE}\nconst result = await A63Figma.${ACTIONS[action]}(figma, ${JSON.stringify(packed)});\nreturn { part: ${part}, parts: ${parts}, ...result };`
}

export function buildComponentScripts(
  model: ComponentModel,
  action: 'sync' | 'check',
  { maxLength = LIMIT }: { maxLength?: number } = {}
): string[] {
  // Measured with the widest part numbers, so numbering cannot push a script over.
  const lengthOf = (variants: VariantSpec[]) =>
    wrap(packComponentModel(sliceOf(model, variants)), action, 999, 999).length
  const groups: VariantSpec[][] = []
  let current: VariantSpec[] = []
  for (const variant of model.variants) {
    const next = [...current, variant]
    if (current.length > 0 && lengthOf(next) >= maxLength) {
      groups.push(current)
      current = [variant]
    } else current = next
  }
  if (current.length > 0) groups.push(current)
  const scripts = groups.map((group, index) =>
    wrap(packComponentModel(sliceOf(model, group)), action, index + 1, groups.length)
  )
  for (const script of scripts)
    if (script.length >= maxLength)
      throw new Error(`A component script is ${script.length} characters, over ${maxLength}`)
  return scripts
}
