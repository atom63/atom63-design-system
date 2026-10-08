import type { VariableLike } from '../src/apply'
import type {
  ComponentPropertyDefinition,
  EffectLike,
  FontNameLike,
  NodesApi,
  PageLike,
  PaintLike,
  SceneNodeLike,
} from '../src/components/nodes-api'
import { createFakeFigma } from './fake-figma'

type Script = (figma: unknown) => Promise<unknown>
const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor as new (
  ...args: string[]
) => Script

type NodeType = SceneNodeLike['type']
type Alias = { type: 'VARIABLE_ALIAS'; id: string }
type State = Record<string, unknown> & {
  id: string
  type: NodeType
  parent: Container | null
  children: SceneNodeLike[]
  boundVariables: Record<string, Alias | Alias[]>
  properties: Record<string, ComponentPropertyDefinition>
  removed: boolean
}
type Container = { node: SceneNodeLike | PageLike; children: SceneNodeLike[] }

const containers = new Set<NodeType>(['FRAME', 'COMPONENT', 'COMPONENT_SET'])
const common = [
  'name',
  'visible',
  'opacity',
  'x',
  'y',
  'fills',
  'strokes',
  'effects',
  'strokeWeight',
  'componentPropertyReferences',
  'layoutPositioning',
  'constraints',
  'strokeAlign',
]
const frameKeys = [
  'layoutMode',
  'primaryAxisAlignItems',
  'counterAxisAlignItems',
  'primaryAxisSizingMode',
  'counterAxisSizingMode',
  'paddingLeft',
  'paddingRight',
  'paddingTop',
  'paddingBottom',
  'itemSpacing',
  'topLeftRadius',
  'topRightRadius',
  'bottomLeftRadius',
  'bottomRightRadius',
  'clipsContent',
]
/** Text properties Figma refuses to change until the node's font is loaded. */
const fontKeys = ['characters', 'fontName', 'fontSize', 'lineHeight', 'textAutoResize']
const writable: Record<NodeType, Set<string>> = {
  FRAME: new Set([...common, ...frameKeys]),
  COMPONENT: new Set([...common, ...frameKeys]),
  COMPONENT_SET: new Set([...common, ...frameKeys]),
  TEXT: new Set([...common, ...fontKeys]),
}
/** `setBoundVariable` fields per node kind, and the variable type each takes. */
const frameFields = [
  'width',
  'height',
  'paddingLeft',
  'paddingRight',
  'paddingTop',
  'paddingBottom',
  'itemSpacing',
  'topLeftRadius',
  'topRightRadius',
  'bottomLeftRadius',
  'bottomRightRadius',
  'strokeWeight',
  'opacity',
  'visible',
]
const textFields = [
  'width',
  'height',
  'opacity',
  'visible',
  'fontSize',
  'lineHeight',
  'fontFamily',
  'fontWeight',
]
/**
 * Figma's `VariableBindableTextField`: a text node reports these as an array of
 * aliases, one per styled range. A whole-node bind gives a one-range array.
 */
const textRangeFields = new Set([
  'fontFamily',
  'fontSize',
  'fontStyle',
  'fontWeight',
  'letterSpacing',
  'lineHeight',
  'paragraphSpacing',
  'paragraphIndent',
])
const strokeAligns = new Set(['CENTER', 'INSIDE', 'OUTSIDE'])
const constraintTypes = new Set(['MIN', 'CENTER', 'MAX', 'STRETCH', 'SCALE'])
const fieldType = (field: string) =>
  field === 'fontFamily' ? 'STRING' : field === 'visible' ? 'BOOLEAN' : 'FLOAT'
const fontStyle = (weight: number) =>
  ({ 400: 'Regular', 500: 'Medium', 600: 'Semi Bold', 700: 'Bold' })[weight] ?? 'Regular'

function deepFreeze<T>(value: T): T {
  if (value && typeof value === 'object') {
    for (const item of Object.values(value)) deepFreeze(item)
    Object.freeze(value)
  }
  return value
}
const frozenCopy = <T>(value: T): T => deepFreeze(structuredClone(value))

const white: PaintLike = { type: 'SOLID', color: { r: 1, g: 1, b: 1 } }
const black: PaintLike = { type: 'SOLID', color: { r: 0, g: 0, b: 0 } }

/**
 * The fake figma API plus an in-memory node tree that behaves like Figma where a
 * wrong call would fail there: frozen paint arrays, read-only sizes, fonts that
 * must be loaded, component property references checked against the set.
 * `writes` counts every mutation of the tree so a test can prove a run idle.
 */
export function createFakeNodes(options: { fonts?: string[] } = {}) {
  const base = createFakeFigma(options)
  let next = 1
  let writes = 0
  const loadedFonts = new Set<string>()
  const pages: PageLike[] = []
  const pageContainers = new Map<PageLike, Container>()
  const pageState = new Map<PageLike, { loaded: boolean; children: SceneNodeLike[] }>()
  const stateOf = new WeakMap<object, State>()
  /** Bindings still to store black, as Figma did on a first run (see `staleNextBinds`). */
  let staleBinds = 0

  /** A color variable's value, resolved as Figma resolves it for `consumer`. */
  const resolvedColor = (variable: VariableLike, consumer: object) => {
    const value = variable.resolveForConsumer?.(consumer).value as
      { r: number; g: number; b: number; a?: number } | undefined
    return value && { color: { r: value.r, g: value.g, b: value.b }, opacity: value.a ?? 1 }
  }

  /**
   * What Figma stores for a paint assigned at `index`. A bound paint holds the
   * variable's resolved color and alpha (a paint opacity of its own is
   * overwritten), except that rebinding the variable the paint at that index
   * already holds keeps the stored color, stale or not.
   */
  const storedPaint = (paint: PaintLike, previous: PaintLike | undefined, consumer: object) => {
    const id = paint.boundVariables?.color?.id
    if (!id) return paint
    if (previous?.boundVariables?.color?.id === id)
      return { ...paint, color: previous.color, opacity: previous.opacity }
    if (staleBinds > 0) {
      staleBinds -= 1
      return { ...paint, color: { r: 0, g: 0, b: 0 }, opacity: 1 }
    }
    const variable = base.variables.get(id)
    const resolved = variable && resolvedColor(variable, consumer)
    return resolved ? { ...paint, ...resolved } : paint
  }

  const firstModeValue = (variable: VariableLike): unknown => {
    const collection = base.collections.find(item => item.variableIds.includes(variable.id))
    const value = collection ? variable.valuesByMode[collection.modes[0].modeId] : undefined
    const alias = value as { type?: string; id?: string } | undefined
    if (alias && typeof alias === 'object' && alias.type === 'VARIABLE_ALIAS') {
      const target = base.variables.get(alias.id ?? '')
      return target ? firstModeValue(target) : undefined
    }
    return value
  }
  const fontKey = (font: FontNameLike) => `${font.family}|${font.style}`
  const requireFont = (font: FontNameLike) => {
    if (!loadedFonts.has(fontKey(font)))
      throw new Error(`Cannot write to node with unloaded font "${font.family} ${font.style}"`)
  }

  /**
   * Figma: "`spread` values are only accepted on rectangles and ellipses, or on
   * frames, components, and instances with visible fill paints and
   * `clipsContent` enabled."
   */
  const requireSpreadAccepted = (state: State, effects: EffectLike[]) => {
    if (!effects.some(effect => effect.spread || effect.boundVariables?.spread)) return
    const fills = state.fills as PaintLike[]
    if (
      state.type === 'TEXT' ||
      state.clipsContent !== true ||
      !fills.some(paint => paint.visible !== false)
    )
      throw new Error(
        'A shadow spread needs a frame or component with a visible fill and clipsContent on'
      )
  }

  /**
   * Like Figma's `resize`: a child the parent does not lay out (any child of a
   * frame without auto layout, an `ABSOLUTE` child of one with it) follows its
   * constraints. `resizeWithoutConstraints` is not modeled.
   */
  const applyConstraints = (parent: State, dw: number, dh: number) => {
    const free = !parent.layoutMode || parent.layoutMode === 'NONE'
    for (const child of parent.children) {
      const state = stateOf.get(child)!
      if (!free && state.layoutPositioning !== 'ABSOLUTE') continue
      const { horizontal, vertical } = state.constraints as { horizontal: string; vertical: string }
      const axis = (rule: string, at: 'x' | 'y', size: 'width' | 'height', delta: number) => {
        const extent = parent[size] as number
        if (rule === 'MAX') state[at] = (state[at] as number) + delta
        else if (rule === 'CENTER') state[at] = (state[at] as number) + delta / 2
        else if (rule === 'STRETCH') state[size] = (state[size] as number) + delta
        else if (rule === 'SCALE' && extent > 0) {
          const scale = (extent + delta) / extent
          state[at] = (state[at] as number) * scale
          state[size] = (state[size] as number) * scale
        }
      }
      axis(horizontal, 'x', 'width', dw)
      axis(vertical, 'y', 'height', dh)
    }
  }

  const detach = (child: SceneNodeLike) => {
    const state = stateOf.get(child)!
    if (!state.parent) return
    const siblings = state.parent.children
    siblings.splice(siblings.indexOf(child), 1)
    state.parent = null
  }
  const attach = (container: Container, child: SceneNodeLike, index?: number) => {
    const childState = stateOf.get(child)
    if (!childState || childState.removed) throw new Error('Cannot append a removed node')
    for (let cursor: Container | null = container; cursor;) {
      if (cursor.node === child) throw new Error('Cannot append a node into itself')
      const state = stateOf.get(cursor.node)
      cursor = state ? state.parent : null
    }
    const own = stateOf.get(container.node)
    if (own?.type === 'COMPONENT_SET' && childState.type !== 'COMPONENT')
      throw new Error('A component set can only contain components')
    detach(child)
    container.children.splice(index ?? container.children.length, 0, child)
    childState.parent = container
    writes += 1
  }

  /** The component or set whose properties a layer's references point at. */
  const owner = (state: State): State | null => {
    for (let cursor = state.parent; cursor;) {
      const parent = stateOf.get(cursor.node)
      if (!parent) return null
      if (parent.type === 'COMPONENT_SET') return parent
      if (parent.type === 'COMPONENT') {
        const set = parent.parent && stateOf.get(parent.parent.node)
        return set?.type === 'COMPONENT_SET' ? set : parent
      }
      cursor = parent.parent
    }
    return null
  }

  const definitions = (state: State) => {
    const result: Record<string, ComponentPropertyDefinition> = { ...state.properties }
    if (state.type === 'COMPONENT_SET')
      for (const child of state.children)
        for (const pair of child.name.split(', ')) {
          const [name, value] = pair.split('=')
          if (name && value && !result[name])
            result[name] = { type: 'VARIANT', defaultValue: value }
        }
    return deepFreeze(result)
  }

  function createNode(type: NodeType): SceneNodeLike {
    const state: State = {
      id: `${next++}:0`,
      type,
      parent: null,
      children: [],
      boundVariables: {},
      properties: {},
      removed: false,
      name: type === 'TEXT' ? 'Text' : type === 'COMPONENT' ? 'Component' : 'Frame',
      visible: true,
      opacity: 1,
      x: 0,
      y: 0,
      width: 100,
      height: type === 'TEXT' ? 14 : 100,
      fills: frozenCopy(type === 'TEXT' ? [black] : type === 'COMPONENT_SET' ? [] : [white]),
      strokes: frozenCopy([]),
      effects: frozenCopy([]),
      strokeWeight: 1,
      componentPropertyReferences: null,
      layoutPositioning: 'AUTO',
      constraints: frozenCopy({ horizontal: 'MIN', vertical: 'MIN' }),
      // Figma's defaults: a frame's stroke sits inside it, a text node's outside.
      strokeAlign: type === 'TEXT' ? 'OUTSIDE' : 'INSIDE',
      ...(type === 'TEXT'
        ? {
            characters: '',
            fontName: frozenCopy({ family: 'Inter', style: 'Regular' }),
            fontSize: 12,
            lineHeight: frozenCopy({ unit: 'AUTO' }),
            textAutoResize: 'NONE',
          }
        : {
            layoutMode: 'NONE',
            primaryAxisAlignItems: 'MIN',
            counterAxisAlignItems: 'MIN',
            primaryAxisSizingMode: 'AUTO',
            counterAxisSizingMode: 'AUTO',
            paddingLeft: 0,
            paddingRight: 0,
            paddingTop: 0,
            paddingBottom: 0,
            itemSpacing: 0,
            topLeftRadius: 0,
            topRightRadius: 0,
            bottomLeftRadius: 0,
            bottomRightRadius: 0,
            // Unknown for a new component in Figma; off here so the sync must turn it on.
            clipsContent: false,
          }),
    }
    const container: Container = { node: undefined as never, children: state.children }

    const methods: Record<string, unknown> = {
      setBoundVariable(field: string, variable: VariableLike | null) {
        const fields = type === 'TEXT' ? textFields : frameFields
        if (!fields.includes(field)) throw new Error(`Cannot bind "${field}" on a ${type} node`)
        if (type === 'TEXT' && field !== 'opacity' && field !== 'visible')
          requireFont(state.fontName as FontNameLike)
        writes += 1
        if (!variable) {
          delete state.boundVariables[field]
          return
        }
        if (variable.resolvedType !== fieldType(field))
          throw new Error(`Cannot bind a ${variable.resolvedType} variable to "${field}"`)
        const font = state.fontName as FontNameLike | undefined
        if (field === 'fontFamily') base.requireFamilies(variable)
        if (field === 'fontFamily' && font) {
          const wanted = { family: String(firstModeValue(variable)), style: font.style }
          requireFont(wanted)
          state.fontName = frozenCopy(wanted)
        }
        if (field === 'fontWeight' && font) {
          const wanted = { family: font.family, style: fontStyle(Number(firstModeValue(variable))) }
          requireFont(wanted)
          state.fontName = frozenCopy(wanted)
        }
        const alias: Alias = { type: 'VARIABLE_ALIAS', id: variable.id }
        state.boundVariables[field] =
          type === 'TEXT' && textRangeFields.has(field) ? [alias] : alias
      },
      resize(width: number, height: number) {
        if (!(width >= 0.01 && height >= 0.01)) throw new Error('Size must be at least 0.01')
        writes += 1
        applyConstraints(state, width - (state.width as number), height - (state.height as number))
        state.width = width
        state.height = height
        // Like Figma: resizing an auto-layout frame fixes both axes.
        if (state.layoutMode && state.layoutMode !== 'NONE') {
          state.primaryAxisSizingMode = 'FIXED'
          state.counterAxisSizingMode = 'FIXED'
        }
      },
      appendChild(child: SceneNodeLike) {
        if (!containers.has(type)) throw new Error(`A ${type} node has no children`)
        attach(container, child)
      },
      insertChild(index: number, child: SceneNodeLike) {
        if (!containers.has(type)) throw new Error(`A ${type} node has no children`)
        attach(container, child, index)
      },
      remove() {
        writes += 1
        detach(proxy)
        state.removed = true
      },
      ...(type === 'COMPONENT_SET' || type === 'COMPONENT'
        ? {
            addComponentProperty(name: string, kind: 'TEXT' | 'BOOLEAN', defaultValue: unknown) {
              if (
                type === 'COMPONENT' &&
                state.parent &&
                stateOf.get(state.parent.node)?.type === 'COMPONENT_SET'
              )
                throw new Error('Add properties to the component set, not a variant')
              if (typeof defaultValue !== (kind === 'TEXT' ? 'string' : 'boolean'))
                throw new Error(`Default value does not match a ${kind} property`)
              writes += 1
              const key = `${name}#${next++}:0`
              state.properties[key] = { type: kind, defaultValue: defaultValue as string | boolean }
              return key
            },
          }
        : {}),
    }

    const proxy = new Proxy(state, {
      get(target, key) {
        if (typeof key !== 'string') return undefined
        if (key in methods) return methods[key]
        if (key === 'children')
          return containers.has(type) ? Object.freeze([...state.children]) : undefined
        if (key === 'parent') return state.parent?.node ?? null
        if (key === 'boundVariables') return deepFreeze({ ...state.boundVariables })
        if (key === 'componentPropertyDefinitions')
          return type === 'COMPONENT_SET' || type === 'COMPONENT' ? definitions(state) : undefined
        if (key === 'removed' || key === 'properties') return undefined
        return target[key]
      },
      set(target, key, value) {
        if (typeof key !== 'string' || !writable[type].has(key))
          throw new TypeError(`Cannot set "${String(key)}" on a ${type} node`)
        if (state.removed) throw new Error('The node has been removed')
        if (type === 'TEXT' && fontKeys.includes(key)) {
          requireFont(state.fontName as FontNameLike)
          if (key === 'fontName') requireFont(value as FontNameLike)
        }
        if (key === 'opacity' && !((value as number) >= 0 && (value as number) <= 1))
          throw new RangeError('opacity must be between 0 and 1')
        if (key === 'fills' || key === 'strokes' || key === 'effects') {
          if (!Array.isArray(value)) throw new TypeError(`${key} must be an array`)
          for (const paint of value as { opacity?: number }[])
            if (paint.opacity !== undefined && !(paint.opacity >= 0 && paint.opacity <= 1))
              throw new RangeError(`${key}: paint opacity must be between 0 and 1`)
          if (key === 'effects') requireSpreadAccepted(state, value as EffectLike[])
          else {
            const previous = target[key] as PaintLike[]
            value = (value as PaintLike[]).map((paint, index) =>
              storedPaint(paint, previous[index], proxy)
            )
          }
          value = frozenCopy(value)
        } else if (key === 'strokeAlign' && !strokeAligns.has(value as string)) {
          throw new Error(`Invalid strokeAlign "${String(value)}"`)
        } else if (key === 'constraints') {
          const { horizontal, vertical } = (value ?? {}) as Record<string, string>
          if (!constraintTypes.has(horizontal) || !constraintTypes.has(vertical))
            throw new Error('constraints needs a horizontal and a vertical ConstraintType')
          value = frozenCopy({ horizontal, vertical })
        } else if (key === 'layoutPositioning' && value === 'ABSOLUTE') {
          const parent = state.parent && stateOf.get(state.parent.node)
          if (!parent || !parent.layoutMode || parent.layoutMode === 'NONE')
            throw new Error('layoutPositioning applies only to children of auto-layout frames')
        } else if (key === 'componentPropertyReferences' && value) {
          const set = owner(state)
          if (!set) throw new Error('Only a layer inside a component can reference its properties')
          const available = definitions(set)
          for (const [field, ref] of Object.entries(value as Record<string, string>)) {
            const wanted = field === 'characters' ? 'TEXT' : field === 'visible' ? 'BOOLEAN' : null
            if (!wanted || available[ref]?.type !== wanted)
              throw new Error(`Cannot reference "${ref}" from ${field}`)
          }
          value = frozenCopy(value)
        } else if (value && typeof value === 'object') {
          value = frozenCopy(value)
        }
        writes += 1
        target[key] = value
        return true
      },
    }) as unknown as SceneNodeLike
    container.node = proxy
    stateOf.set(proxy, state)
    return proxy
  }

  function createPage(): PageLike {
    const children: SceneNodeLike[] = []
    // A page created in this session is loaded, like Figma's current page.
    const own = { loaded: true, children }
    let name = `Page ${pages.length + 1}`
    const page: PageLike = {
      id: `${next++}:0`,
      type: 'PAGE',
      get name() {
        return name
      },
      set name(value) {
        writes += 1
        name = value
      },
      get children() {
        if (!own.loaded) throw new Error('Call page.loadAsync() before reading its children')
        return Object.freeze([...children])
      },
      appendChild: child => attach(container, child),
      async loadAsync() {
        own.loaded = true
      },
    }
    const container: Container = { node: page, children }
    pageContainers.set(page, container)
    pages.push(page)
    pageState.set(page, own)
    return page
  }
  /** Figma's current page: the first page, where `create*` puts a new node. */
  const currentPage = createPage()
  /** Like Figma, a new node starts on the current page. */
  const onCurrentPage = (node: SceneNodeLike) => {
    attach(pageContainers.get(currentPage)!, node)
    return node
  }

  const variables = {
    ...base.figma.variables,
    setBoundVariableForPaint(paint: PaintLike, field: 'color', variable: VariableLike) {
      if (field !== 'color' || variable.resolvedType !== 'COLOR')
        throw new Error('A paint binds a color variable to "color"')
      writes += 1
      // Figma overwrites the paint's color and opacity with the variable's resolved value.
      return frozenCopy({
        ...paint,
        ...resolvedColor(variable, {}),
        boundVariables: {
          ...paint.boundVariables,
          color: { type: 'VARIABLE_ALIAS', id: variable.id },
        },
      }) as PaintLike
    },
    setBoundVariableForEffect(
      effect: EffectLike,
      field: 'color' | 'spread',
      variable: VariableLike
    ) {
      if (variable.resolvedType !== (field === 'color' ? 'COLOR' : 'FLOAT'))
        throw new Error(`Cannot bind a ${variable.resolvedType} variable to effect ${field}`)
      writes += 1
      return frozenCopy({
        ...effect,
        boundVariables: {
          ...effect.boundVariables,
          [field]: { type: 'VARIABLE_ALIAS', id: variable.id },
        },
      }) as EffectLike
    },
  }

  /** Figma's API; effect binding stays so a test can build what an earlier version wrote. */
  const figma: NodesApi & { readonly currentPage: PageLike; variables: typeof variables } = {
    ...base.figma,
    currentPage,
    variables,
    async loadFontAsync(font) {
      await base.figma.loadFontAsync(font)
      loadedFonts.add(fontKey(font))
    },
    root: {
      get children() {
        return Object.freeze([...pages])
      },
    },
    createPage,
    createFrame: () => onCurrentPage(createNode('FRAME')),
    createText: () => onCurrentPage(createNode('TEXT')),
    createComponent: () => onCurrentPage(createNode('COMPONENT')),
    combineAsVariants(nodes, parent) {
      if (nodes.length === 0) throw new Error('combineAsVariants needs at least one component')
      for (const node of nodes)
        if (node.type !== 'COMPONENT') throw new Error('combineAsVariants takes components only')
      const set = createNode('COMPONENT_SET')
      for (const node of nodes) set.appendChild(node)
      parent.appendChild(set)
      writes += 1
      return set
    },
  }

  const run = (script: string) => new AsyncFunction('figma', script)(figma)

  return {
    ...base,
    figma,
    run,
    pages,
    get writes() {
      return writes
    },
    /** Unloads every page but the first, as when a file is reopened. */
    unloadPages() {
      for (const [page, own] of pageState) if (page !== pages[0]) own.loaded = false
    },
    findVariant(setName: string, variantName: string): SceneNodeLike {
      for (const page of pages)
        for (const node of pageState.get(page)!.children) {
          if (node.type !== 'COMPONENT_SET' || node.name !== setName) continue
          const variant = node.children?.find(child => child.name === variantName)
          if (variant) return variant
        }
      throw new Error(`No variant "${variantName}" in a set "${setName}"`)
    },
    /**
     * Makes a node's stored paint stale, as Figma left some bindings after a first
     * run: the binding is kept, the stored color is not the variable's.
     */
    staleBinding(
      node: SceneNodeLike,
      key: 'fills' | 'strokes' = 'fills',
      stale: { color: { r: number; g: number; b: number }; opacity: number } = {
        color: { r: 0, g: 0, b: 0 },
        opacity: 1,
      }
    ) {
      const state = stateOf.get(node)!
      state[key] = frozenCopy((state[key] as PaintLike[]).map(paint => ({ ...paint, ...stale })))
    },
    /**
     * Whether `variant` shows a focus ring as Figma renders it: a visible `Focus
     * ring` frame whose bound stroke reaches outside the root on every side and
     * that the root does not clip, or a spread drop shadow on the root. Figma
     * casts a shadow from the node's visible content, so a shadow on a root whose
     * fills are fully transparent and that has no visible stroke draws nothing
     * (the real file's ghost and link variants).
     */
    visibleFocusRing(variant: SceneNodeLike): boolean {
      const shows = (paint: PaintLike) => paint.visible !== false && (paint.opacity ?? 1) > 0
      if (!variant.visible) return false
      const layer = variant.children?.find(c => c.name === 'Focus ring' && c.type === 'FRAME')
      if (layer?.visible && layer.opacity > 0) {
        const bound = layer.boundVariables?.strokeWeight
        const variable = bound && base.variables.get(bound.id)
        const weight = Number(variable ? firstModeValue(variable) : layer.strokeWeight)
        const align = (layer as { strokeAlign?: string }).strokeAlign
        const outset = align === 'OUTSIDE' ? weight : align === 'CENTER' ? weight / 2 : 0
        const placed = !variant.layoutMode || variant.layoutMode === 'NONE'
        const free = placed || layer.layoutPositioning === 'ABSOLUTE'
        const outside =
          layer.x - outset < 0 &&
          layer.y - outset < 0 &&
          layer.x + layer.width + outset > variant.width &&
          layer.y + layer.height + outset > variant.height
        const stroked = layer.strokes.some(paint => shows(paint) && !!paint.boundVariables?.color)
        if (free && outside && stroked && weight > 0 && variant.clipsContent !== true) return true
      }
      const content =
        variant.fills.some(shows) ||
        (variant.strokes.some(shows) && (variant.strokeWeight ?? 0) > 0)
      return (
        content &&
        variant.effects.some(
          effect =>
            effect.type === 'DROP_SHADOW' &&
            effect.visible &&
            (effect.spread > 0 || !!effect.boundVariables?.spread) &&
            effect.color.a > 0
        )
      )
    },
    /** The next `count` new bindings store black, as on Figma's first run. */
    staleNextBinds(count: number) {
      staleBinds = count
    },
    variableOf(token: string): VariableLike {
      for (const variable of base.variables.values())
        if (variable.codeSyntax?.WEB === `var(${token})`) return variable
      throw new Error(`No variable for ${token}`)
    },
  }
}
