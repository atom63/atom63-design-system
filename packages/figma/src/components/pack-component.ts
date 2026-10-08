/**
 * A compact encoding of a `ComponentModel` for use_figma scripts, which are
 * limited to 50,000 characters. Variants repeat the same values and layers
 * many times over, so each distinct value and each distinct layer is written
 * once in a table and variants point at them by index; a variant's name is
 * left out when it is the usual `Variant=…, Size=…, State=…`.
 * Bundled into the runtime IIFE: no Node or DOM imports.
 */
import { DERIVED_COLLECTION, DERIVED_MODE, derivedToken, parseDerived } from '../derived'
import type { SyncVariable } from '../plan'
import type { ComponentModel, ComponentValue, FigmaProperty, LayerSpec, VariantSpec } from './model'

export type PackedLayer = [name: string, kind: 'f' | 't', properties: (FigmaProperty | number)[]]
export type PackedVariant =
  | [variant: number, size: number, state: number, layers: number[]]
  | [variant: number, size: number, state: number, layers: number[], name: string]
export type PackedLiteral = [
  variant: number | string,
  layer: string,
  property: FigmaProperty,
  expression: number,
]

/** A derived variable: its token and opacity rebuild the key, value and code syntax. */
export type PackedDerived = [token: string, opacity: number, name: string, scopes: string[]]

export interface PackedComponentModel {
  /** Format version. */
  k: 2
  /** Component, page and default label. */
  m: [component: string, page: string, label: string]
  a: [Variant: string[], Size: string[], State: string[]]
  /** Default Variant and Size; the default State is always `rest`. */
  d: [variant: string, size: string]
  /** Distinct values. */
  v: ComponentValue[]
  /** Distinct layers; properties alternate name and value index. */
  y: PackedLayer[]
  /** Variants as axis indexes and layer indexes, root first. */
  n: PackedVariant[]
  t: string[]
  /** Derived variables, in the `Component` collection's one mode. */
  x: PackedDerived[]
  /** Literal expressions, by index from `l`. */
  e: string[]
  l: PackedLiteral[]
  s: ComponentModel['skipped']
}

const nameOf = (axes: ComponentModel['axes'], v: number, s: number, t: number) =>
  `Variant=${axes.Variant[v]}, Size=${axes.Size[s]}, State=${axes.State[t]}`

function indexer<T>() {
  const keys = new Map<string, number>()
  const items: T[] = []
  const indexOf = (item: T) => {
    const key = JSON.stringify(item)
    let index = keys.get(key)
    if (index === undefined) {
      index = items.push(item) - 1
      keys.set(key, index)
    }
    return index
  }
  return { items, indexOf }
}

export function packComponentModel(model: ComponentModel): PackedComponentModel {
  const values = indexer<ComponentValue>()
  const layers = indexer<PackedLayer>()
  const expressions = indexer<string>()
  const packLayer = (layer: LayerSpec) =>
    layers.indexOf([
      layer.name,
      layer.kind === 'text' ? 't' : 'f',
      Object.entries(layer.properties).flatMap(([property, value]) => [
        property as FigmaProperty,
        values.indexOf(value),
      ]),
    ])
  const { axes } = model
  const variantIndex = new Map<string, number>()
  const n = model.variants.map((variant, index): PackedVariant => {
    variantIndex.set(variant.name, index)
    const v = axes.Variant.indexOf(variant.coord.variant)
    const s = axes.Size.indexOf(variant.coord.size)
    const t = axes.State.indexOf(variant.coord.state)
    if (v < 0 || s < 0 || t < 0) throw new Error(`${variant.name}: a coordinate is not on an axis`)
    const packed: PackedVariant = [v, s, t, variant.layers.map(packLayer)]
    return variant.name === nameOf(axes, v, s, t) ? packed : [...packed, variant.name]
  })
  const l = model.literals.map((literal): PackedLiteral => [
    variantIndex.get(literal.variant) ?? literal.variant,
    literal.layer,
    literal.property,
    expressions.indexOf(literal.expression),
  ])
  return {
    k: 2,
    m: [model.component, model.page, model.label],
    a: [axes.Variant, axes.Size, axes.State],
    d: [model.defaults.Variant, model.defaults.Size],
    v: values.items,
    y: layers.items,
    n,
    t: model.tokens,
    x: model.derived.variables.map((variable): PackedDerived => {
      const derived = parseDerived(variable.token)
      if (!derived) throw new Error(`${variable.name}: not a derived variable`)
      return [derived.alias, derived.opacity, variable.name, variable.scopes ?? []]
    }),
    e: expressions.items,
    l,
    s: model.skipped,
  }
}

export function unpackComponentModel(packed: PackedComponentModel): ComponentModel {
  if (packed?.k !== 2) throw new Error('not a packed component model')
  const [Variant, Size, State] = packed.a
  const axes = { Variant, Size, State }
  const layers = packed.y.map(([name, kind, flat]): LayerSpec => {
    const properties: LayerSpec['properties'] = {}
    for (let index = 0; index < flat.length; index += 2)
      properties[flat[index] as FigmaProperty] = packed.v[flat[index + 1] as number]
    return { name, kind: kind === 't' ? 'text' : 'frame', properties }
  })
  const variants = packed.n.map(([v, s, t, layerIndexes, name]): VariantSpec => ({
    name: name ?? nameOf(axes, v, s, t),
    coord: { variant: Variant[v], size: Size[s], state: State[t] },
    layers: layerIndexes.map(index => layers[index]),
  }))
  return {
    schemaVersion: 2,
    component: packed.m[0],
    page: packed.m[1],
    axes,
    defaults: { Variant: packed.d[0], Size: packed.d[1], State: 'rest' },
    label: packed.m[2],
    variants,
    tokens: packed.t,
    derived: {
      name: DERIVED_COLLECTION,
      modes: [DERIVED_MODE],
      variables: packed.x.map(([alias, opacity, name, scopes]): SyncVariable => {
        const token = derivedToken(alias, opacity)
        return {
          name,
          token,
          type: 'COLOR',
          values: { [DERIVED_MODE]: { composed: { alias, opacity } } },
          codeSyntax: token,
          scopes,
        }
      }),
    },
    literals: packed.l.map(([variant, layer, property, expression]) => ({
      variant: typeof variant === 'number' ? variants[variant].name : variant,
      layer,
      property,
      expression: packed.e[expression],
    })),
    skipped: packed.s,
  }
}
