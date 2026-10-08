import type { SyncValue } from '../plan'

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
  | 'focusRing'
  | 'focusRingWidth'

/** A resolved value, or why it is not written. Booleans come from the anatomy (`visible`). */
export type ComponentValue = SyncValue | { value: boolean } | { skipped: string }

export interface LayerSpec {
  /** Figma layer name: 'Button', 'Icon', 'Label', 'Spinner'. */
  name: string
  kind: 'frame' | 'text'
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
  schemaVersion: 1
  component: string
  page: string
  axes: { Variant: string[]; Size: string[]; State: string[] }
  defaults: { Variant: string; Size: string; State: 'rest' }
  /** Default `Label` text property. */
  label: string
  variants: VariantSpec[]
  /** Tokens the model binds; the script refuses to write if any has no variable. */
  tokens: string[]
  literals: { variant: string; layer: string; property: FigmaProperty; expression: string }[]
  skipped: { what: string; reason: string }[]
}
