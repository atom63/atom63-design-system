/**
 * Moves every binding in the document from one variable to another, for a token
 * whose variable moved to another collection (Figma cannot move a variable, so
 * the sync creates a new one; see plan.ts). Runs against the real `figma` API
 * only; `apply.ts` calls it through `VariablesApi.rebindBindings`.
 *
 * Covers node properties bound directly (sizes, radii, spacing, opacity…), solid
 * paint colors in fills and strokes, effect fields, paint / effect / text styles,
 * and aliases in every local variable. It then counts what still refers to the
 * old variable (for example a binding inside a text range), and the sync keeps
 * the old variable, retired, so nothing loses its binding.
 */

type Bindable = Record<string, unknown>

function refersTo(value: unknown, id: string): boolean {
  return JSON.stringify(value ?? null).includes(`"${id}"`)
}

function aliasId(value: unknown): string | undefined {
  return typeof value === 'object' && value !== null && 'id' in value ? String(value.id) : undefined
}

function retargetPaints(paints: readonly Paint[], from: Variable, to: Variable) {
  let count = 0
  const next = paints.map(paint => {
    if (paint.type === 'SOLID' && aliasId(paint.boundVariables?.color) === from.id) {
      count += 1
      return figma.variables.setBoundVariableForPaint(paint, 'color', to)
    }
    return paint
  })
  return { next, count }
}

function retargetEffects(effects: readonly Effect[], from: Variable, to: Variable) {
  let count = 0
  const next = effects.map(effect => {
    let result = effect
    const bound = (effect as { boundVariables?: Bindable }).boundVariables ?? {}
    for (const [field, alias] of Object.entries(bound)) {
      if (aliasId(alias) === from.id) {
        count += 1
        result = figma.variables.setBoundVariableForEffect(
          result,
          field as VariableBindableEffectField,
          to
        )
      }
    }
    return result
  })
  return { next, count }
}

/** Rebinds one node or style; returns how many bindings moved. */
function rebindTarget(target: Bindable, from: Variable, to: Variable): number {
  let count = 0
  const bound = (target.boundVariables ?? {}) as Bindable
  for (const [field, alias] of Object.entries(bound)) {
    if (field === 'fills' || field === 'strokes' || field === 'paints') {
      const paints = target[field] as readonly Paint[] | undefined
      if (!Array.isArray(paints)) continue
      const { next, count: moved } = retargetPaints(paints, from, to)
      if (moved) target[field] = next
      count += moved
    } else if (field === 'effects') {
      const effects = target.effects as readonly Effect[] | undefined
      if (!Array.isArray(effects)) continue
      const { next, count: moved } = retargetEffects(effects, from, to)
      if (moved) target.effects = next
      count += moved
    } else if (aliasId(alias) === from.id && typeof target.setBoundVariable === 'function') {
      ;(target.setBoundVariable as (field: string, variable: Variable) => void)(field, to)
      count += 1
    }
  }
  return count
}

export async function rebindBindings(
  from: Variable,
  to: Variable
): Promise<{ rebound: number; remaining: number }> {
  let rebound = 0
  await figma.loadAllPagesAsync()
  const bound = (item: unknown) =>
    refersTo((item as { boundVariables?: unknown }).boundVariables, from.id)

  const nodes = () => figma.root.findAll(node => 'boundVariables' in node && bound(node))
  const styles = async () =>
    [
      ...(await figma.getLocalPaintStylesAsync()),
      ...(await figma.getLocalEffectStylesAsync()),
      ...(await figma.getLocalTextStylesAsync()),
    ].filter(bound)
  const aliasing = async () =>
    (await figma.variables.getLocalVariablesAsync()).filter(
      variable => variable.id !== from.id && refersTo(variable.valuesByMode, from.id)
    )

  for (const node of nodes()) rebound += rebindTarget(node as unknown as Bindable, from, to)
  for (const style of await styles())
    rebound += rebindTarget(style as unknown as Bindable, from, to)
  for (const variable of await aliasing()) {
    for (const [modeId, value] of Object.entries(variable.valuesByMode)) {
      if (aliasId(value) === from.id) {
        variable.setValueForMode(modeId, figma.variables.createVariableAlias(to))
        rebound += 1
      }
    }
  }

  const remaining = nodes().length + (await styles()).length + (await aliasing()).length
  return { rebound, remaining }
}
