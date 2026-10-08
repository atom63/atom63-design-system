/**
 * The slice of Figma's node API that `syncComponent` uses, so tests can run it
 * on an in-memory fake. Bundled into the runtime IIFE: no Node or DOM imports.
 */
import type { VariableLike, VariablesApi } from '../apply'
import type { StylesApi } from '../style-sync'

export interface VariableAlias {
  type: 'VARIABLE_ALIAS'
  id: string
}
export interface RgbLike {
  r: number
  g: number
  b: number
}

export interface PaintLike {
  type: 'SOLID'
  color: RgbLike
  opacity?: number
  visible?: boolean
  boundVariables?: { color?: VariableAlias }
}

export interface EffectLike {
  type: 'DROP_SHADOW'
  color: RgbLike & { a: number }
  offset: { x: number; y: number }
  radius: number
  spread: number
  visible: boolean
  blendMode: 'NORMAL'
  showShadowBehindNode?: boolean
  boundVariables?: Partial<
    Record<'color' | 'radius' | 'spread' | 'offsetX' | 'offsetY', VariableAlias>
  >
}

export type ComponentPropertyType = 'TEXT' | 'BOOLEAN' | 'VARIANT'
export interface ComponentPropertyDefinition {
  type: ComponentPropertyType
  defaultValue: string | boolean
}

export type LineHeightLike =
  { unit: 'PIXELS'; value: number } | { unit: 'PERCENT'; value: number } | { unit: 'AUTO' }

export interface FontNameLike {
  family: string
  style: string
}

export type SizingMode = 'FIXED' | 'AUTO'

export interface SceneNodeLike {
  readonly id: string
  name: string
  readonly type: 'FRAME' | 'TEXT' | 'COMPONENT' | 'COMPONENT_SET'
  readonly parent: SceneNodeLike | PageLike | null
  /** Containers only (frames, components, sets). */
  readonly children?: readonly SceneNodeLike[]
  visible: boolean
  opacity: number
  x: number
  y: number
  readonly width: number
  readonly height: number
  /** Figma returns frozen arrays: write by assigning a new array. */
  fills: readonly PaintLike[]
  strokes: readonly PaintLike[]
  effects: readonly EffectLike[]
  strokeWeight?: number
  readonly boundVariables?: Readonly<Record<string, VariableAlias | undefined>>
  setBoundVariable(field: string, variable: VariableLike | null): void
  resize(width: number, height: number): void
  /** Containers only; Figma reparents a node that already has a parent. */
  appendChild(child: SceneNodeLike): void
  insertChild?(index: number, child: SceneNodeLike): void
  remove(): void

  // Frames and components
  layoutMode?: 'NONE' | 'HORIZONTAL' | 'VERTICAL'
  primaryAxisAlignItems?: 'MIN' | 'CENTER' | 'MAX' | 'SPACE_BETWEEN'
  counterAxisAlignItems?: 'MIN' | 'CENTER' | 'MAX' | 'BASELINE'
  primaryAxisSizingMode?: SizingMode
  counterAxisSizingMode?: SizingMode
  paddingLeft?: number
  paddingRight?: number
  itemSpacing?: number
  topLeftRadius?: number
  topRightRadius?: number
  bottomLeftRadius?: number
  bottomRightRadius?: number

  // Text
  characters?: string
  fontName?: FontNameLike
  fontSize?: number
  lineHeight?: LineHeightLike
  textAutoResize?: 'NONE' | 'WIDTH_AND_HEIGHT' | 'HEIGHT' | 'TRUNCATE'

  // Component properties: definitions on a set, references on its layers
  readonly componentPropertyDefinitions?: Readonly<Record<string, ComponentPropertyDefinition>>
  addComponentProperty?(
    name: string,
    type: Exclude<ComponentPropertyType, 'VARIANT'>,
    defaultValue: string | boolean
  ): string
  componentPropertyReferences?: Partial<Record<'characters' | 'visible', string>> | null
}

export interface PageLike {
  readonly id: string
  name: string
  readonly type: 'PAGE'
  /** Throws until `loadAsync` resolves, as in a dynamic-page file. */
  readonly children: readonly SceneNodeLike[]
  appendChild(child: SceneNodeLike): void
  loadAsync(): Promise<void>
}

export interface NodesApi extends StylesApi {
  root: { readonly children: readonly PageLike[] }
  createPage(): PageLike
  createFrame(): SceneNodeLike
  createText(): SceneNodeLike
  createComponent(): SceneNodeLike
  combineAsVariants(nodes: readonly SceneNodeLike[], parent: PageLike): SceneNodeLike
  variables: VariablesApi & {
    setBoundVariableForPaint(paint: PaintLike, field: 'color', variable: VariableLike): PaintLike
    setBoundVariableForEffect(
      effect: EffectLike,
      field: 'color' | 'spread',
      variable: VariableLike
    ): EffectLike
  }
}
