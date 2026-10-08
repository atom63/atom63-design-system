/**
 * Turns a component model into use_figma scripts: the component runtime plus a packed
 * slice of the variants, each under Figma MCP's 50,000-character limit.
 * Variants are taken in model order and cut greedily, so the first script
 * makes the page and the set and later ones add to it. A slice carries only
 * the tokens and derived variables its variants bind, so each script can run on
 * its own: it makes its derived variables before it binds them. The reporting
 * lists (`literals`, `skipped`) stay with the CLI summary. The doc block travels
 * in the last part only, the one that draws the spec card once every variant
 * exists; that part is measured with it, and gives variants to a new last part
 * if the doc would push it over the limit.
 */
import { parseDerived } from '../derived'
import { COMPONENT_RUNTIME_SOURCE } from '../runtime-source.generated'
import { tokensOf } from './component-values'
import type { ComponentModel, VariantSpec } from './model'
import { type PackedComponentModel, packComponentModel } from './pack-component'

/** Figma MCP accepts 50,000 characters; keep a margin for how the host passes the code. */
const LIMIT = 49_000

const ACTIONS = { sync: 'syncComponentPart', check: 'checkComponentPart' } as const

function sliceOf(model: ComponentModel, variants: VariantSpec[], last: boolean): ComponentModel {
  const bound = new Set(variants.flatMap(variant => variant.layers.flatMap(tokensOf)))
  const variables = model.derived.variables.filter(variable => bound.has(variable.token))
  const tokens = [...new Set([...bound].map(token => parseDerived(token)?.alias ?? token))].sort()
  const { doc, ...rest } = model
  return {
    ...rest,
    variants,
    tokens,
    derived: { ...model.derived, variables },
    literals: [],
    skipped: [],
    ...(last && doc ? { doc } : {}),
  }
}

function wrap(packed: PackedComponentModel, action: 'sync' | 'check', part: number, parts: number) {
  return `${COMPONENT_RUNTIME_SOURCE}\nconst result = await A63Figma.${ACTIONS[action]}(figma, ${JSON.stringify(packed)});\nreturn { part: ${part}, parts: ${parts}, ...result };`
}

export function buildComponentScripts(
  model: ComponentModel,
  action: 'sync' | 'check',
  { maxLength = LIMIT }: { maxLength?: number } = {}
): string[] {
  // Measured with the widest part numbers, so numbering cannot push a script over.
  const lengthOf = (variants: VariantSpec[], last = false) =>
    wrap(packComponentModel(sliceOf(model, variants, last)), action, 999, 999).length
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
  // The last part also carries the doc block: move its trailing variants to a new last part until it fits.
  for (let last = groups.at(-1); last;) {
    const tail: VariantSpec[] = []
    while (last.length > 1 && lengthOf(last, true) >= maxLength) tail.unshift(last.pop()!)
    if (tail.length > 0) groups.push(tail)
    last = tail.length > 0 ? tail : undefined
  }
  const scripts = groups.map((group, index) =>
    wrap(
      packComponentModel(sliceOf(model, group, index === groups.length - 1)),
      action,
      index + 1,
      groups.length
    )
  )
  for (const script of scripts)
    if (script.length >= maxLength)
      throw new Error(`A component script is ${script.length} characters, over ${maxLength}`)
  return scripts
}
