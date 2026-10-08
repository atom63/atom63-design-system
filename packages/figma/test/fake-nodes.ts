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
type State = Record<string, unknown> & {
  id: string
  type: NodeType
  parent: Container | null
  children: SceneNodeLike[]
  boundVariables: Record<string, { type: 'VARIABLE_ALIAS'; id: string }>
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
  const pageState = new Map<PageLike, { loaded: boolean; children: SceneNodeLike[] }>()
  const stateOf = new WeakMap<object, State>()

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
        state.boundVariables[field] = { type: 'VARIABLE_ALIAS', id: variable.id }
      },
      resize(width: number, height: number) {
        if (!(width >= 0.01 && height >= 0.01)) throw new Error('Size must be at least 0.01')
        writes += 1
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
        if (key === 'fills' || key === 'strokes' || key === 'effects') {
          if (!Array.isArray(value)) throw new TypeError(`${key} must be an array`)
          value = frozenCopy(value)
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
    pages.push(page)
    pageState.set(page, own)
    return page
  }
  createPage()

  const variables = {
    ...base.figma.variables,
    setBoundVariableForPaint(paint: PaintLike, field: 'color', variable: VariableLike) {
      if (field !== 'color' || variable.resolvedType !== 'COLOR')
        throw new Error('A paint binds a color variable to "color"')
      writes += 1
      return frozenCopy({
        ...paint,
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

  const figma: NodesApi = {
    ...base.figma,
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
    createFrame: () => createNode('FRAME'),
    createText: () => createNode('TEXT'),
    createComponent: () => createNode('COMPONENT'),
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
    variableOf(token: string): VariableLike {
      for (const variable of base.variables.values())
        if (variable.codeSyntax?.WEB === `var(${token})`) return variable
      throw new Error(`No variable for ${token}`)
    },
  }
}
