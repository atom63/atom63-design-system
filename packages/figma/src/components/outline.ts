/**
 * The focus ring as its own layer (C6). CSS draws it as an `outline`: outside
 * the border box, following its radius, painting nothing inside. Figma gets the
 * same as a frame laid over the root: out of the auto-layout flow, stretched
 * with the root, no fill, an outside stroke. A drop shadow cannot stand in for
 * it: Figma casts a shadow from the node's visible content, so a transparent
 * ghost or link variant would show no ring.
 * Bundled into the runtime IIFE: no Node or DOM imports.
 */
import { near } from '../style-sync'
import { type Check, firstValue, type ValueContext } from './component-values'
import type { ComponentModel, LayerSpec } from './model'
import type { EffectLike, SceneNodeLike } from './nodes-api'

const property = <K extends keyof SceneNodeLike>(
  node: SceneNodeLike,
  key: K,
  same: (value: SceneNodeLike[K]) => boolean,
  value: () => SceneNodeLike[K]
): Check => ({
  what: `${node.name}.${String(key)}`,
  same: () => same(node[key]),
  write: () => {
    node[key] = value()
  },
  describe: () => ({ actual: node[key], expected: value() }),
})

/**
 * Places an outline layer over `root`: absolute, stretched with it, outset by
 * the layer's `outlineOffset` (0 when it has none). A skipped offset leaves the
 * geometry alone. Runs after the root has its final size.
 */
export function outlineChecks(root: SceneNodeLike, node: SceneNodeLike, layer: LayerSpec): Check[] {
  const checks = [
    property(
      node,
      'layoutPositioning',
      value => value === 'ABSOLUTE',
      () => 'ABSOLUTE'
    ),
    property(
      node,
      'constraints',
      value => value?.horizontal === 'STRETCH' && value.vertical === 'STRETCH',
      () => ({ horizontal: 'STRETCH', vertical: 'STRETCH' })
    ),
    property(
      node,
      'strokeAlign',
      value => value === 'OUTSIDE',
      () => 'OUTSIDE'
    ),
    property(
      node,
      'fills',
      value => value.length === 0,
      () => []
    ),
  ]
  const offsetValue = layer.properties.outlineOffset
  if (offsetValue && !('value' in offsetValue && typeof offsetValue.value === 'number'))
    return checks
  const offset = offsetValue ? (offsetValue as { value: number }).value : 0
  return [
    ...checks,
    property(
      node,
      'x',
      value => near(value, -offset),
      () => -offset
    ),
    property(
      node,
      'y',
      value => near(value, -offset),
      () => -offset
    ),
    {
      what: `${node.name}.size`,
      same: () =>
        near(node.width, root.width + 2 * offset) && near(node.height, root.height + 2 * offset),
      write: () => node.resize(root.width + 2 * offset, root.height + 2 * offset),
      describe: () => ({
        actual: [node.width, node.height],
        expected: [root.width + 2 * offset, root.height + 2 * offset],
      }),
    },
  ]
}

/** What identifies the drop-shadow ring an earlier version wrote: its bound color and width. */
interface LegacyRing {
  colors: Set<string>
  widths: Set<string>
  spreads: number[]
}

const signatures = new WeakMap<object, WeakMap<ComponentModel, LegacyRing>>()

function legacyRing(model: ComponentModel, context: ValueContext): LegacyRing {
  const { byToken } = context
  let byModel = signatures.get(byToken)
  if (!byModel) signatures.set(byToken, (byModel = new WeakMap()))
  let ring = byModel.get(model)
  if (ring) return ring
  ring = { colors: new Set(), widths: new Set(), spreads: [] }
  for (const variant of model.variants)
    for (const layer of variant.layers) {
      if (layer.kind !== 'outline') continue
      const { stroke, strokeWeight } = layer.properties
      const color = stroke && 'alias' in stroke ? byToken.get(stroke.alias) : undefined
      if (color) ring.colors.add(color.id)
      if (strokeWeight && 'alias' in strokeWeight) {
        const width = byToken.get(strokeWeight.alias)
        if (!width) continue
        ring.widths.add(width.id)
        // A spread written as the width's number rather than bound to it.
        const spread = firstValue(context, width)
        if (typeof spread === 'number') ring.spreads.push(spread)
      } else if (strokeWeight && 'value' in strokeWeight && typeof strokeWeight.value === 'number')
        ring.spreads.push(strokeWeight.value)
    }
  byModel.set(model, ring)
  return ring
}

/**
 * The earlier ring (C6 before 2026-10-08): a drop shadow at offset 0, blur 0,
 * its color bound to the ring's color variable and its spread the ring width.
 * Only a bound color identifies it; a literal-colored ring is not recognized.
 */
function isLegacyRing(effect: EffectLike, ring: LegacyRing): boolean {
  const bound = effect.boundVariables ?? {}
  return (
    effect.type === 'DROP_SHADOW' &&
    near(effect.offset.x, 0) &&
    near(effect.offset.y, 0) &&
    near(effect.radius, 0) &&
    !!bound.color &&
    ring.colors.has(bound.color.id) &&
    (bound.spread
      ? ring.widths.has(bound.spread.id)
      : ring.spreads.some(spread => near(effect.spread, spread)))
  )
}

/** Removes exactly the earlier version's ring effect from a root; a designer's effects stay. */
export function legacyRingCheck(
  root: SceneNodeLike,
  model: ComponentModel,
  context: ValueContext
): Check {
  const ring = () => legacyRing(model, context)
  return {
    what: `${root.name}.effects`,
    same: () => !root.effects.some(effect => isLegacyRing(effect, ring())),
    write: () => {
      root.effects = root.effects.filter(effect => !isLegacyRing(effect, ring()))
    },
    describe: () => ({
      actual: { legacyRings: root.effects.filter(effect => isLegacyRing(effect, ring())).length },
      expected: { legacyRings: 0 },
    }),
  }
}
