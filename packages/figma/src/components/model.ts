import type { SyncCollection, SyncValue } from '../plan'

export type FigmaProperty =
  | 'fill'
  | 'stroke'
  | 'strokeWeight'
  | 'cornerRadius'
  | 'height'
  | 'paddingInline'
  | 'itemSpacing'
  | 'fontSize'
  | 'lineHeight'
  | 'fontFamily'
  | 'fontWeight'
  | 'opacity'
  | 'visible'
  | 'size'
  /** An outline layer's outset from the root, in px (CSS `outline-offset`). */
  | 'outlineOffset'

/**
 * A resolved value, or why it is not written. Booleans come from the anatomy
 * (`visible`). A color-mix value is an alias to its derived variable (derived.ts),
 * never a composed value: Figma cannot give a bound paint an opacity of its own.
 */
export type ComponentValue =
  Exclude<SyncValue, { composed: unknown }> | { value: boolean } | { skipped: string }

/**
 * `outline` is a frame that draws the root's CSS `outline`: absolutely placed
 * over the root, no fill, an outside stroke, outset by `outlineOffset` (C6).
 */
export type LayerKind = 'frame' | 'text' | 'outline'

export interface LayerSpec {
  /** Figma layer name: 'Button', 'Icon', 'Label', 'Spinner', 'Focus ring'. */
  name: string
  kind: LayerKind
  properties: Partial<Record<FigmaProperty, ComponentValue>>
}

export interface VariantSpec {
  /** Figma variant name, `Variant=primary, Size=md, State=rest`. */
  name: string
  coord: { variant: string; size: string; state: string }
  /** Root first. */
  layers: LayerSpec[]
}

export interface ComponentModel {
  schemaVersion: 2
  component: string
  page: string
  axes: { Variant: string[]; Size: string[]; State: string[] }
  defaults: { Variant: string; Size: string; State: 'rest' }
  /** Default `Label` text property. */
  label: string
  variants: VariantSpec[]
  /**
   * Code tokens the model binds, directly or through a derived variable; the
   * script refuses to write if any has no variable (C8).
   */
  tokens: string[]
  /**
   * The derived variables the values alias, one per (token, opacity): the
   * `Component` collection, one `Value` mode. A script syncs the ones its
   * variants bind before it binds them.
   */
  derived: SyncCollection
  literals: { variant: string; layer: string; property: FigmaProperty; expression: string }[]
  skipped: { what: string; reason: string }[]
}
