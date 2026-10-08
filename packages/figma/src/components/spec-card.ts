/**
 * The spec card around a component set (S5–S7): a vertical auto-layout frame
 * on the component page that documents the set with the doc block's words —
 * the group and slug, rows Summary, When to use, Variant, Size, State, Related
 * and Docs — and a `Grid` frame holding the set with a header label over each
 * State column and a `variant · size` label beside each grid row, both placed
 * from where the set's variants actually are. Every part is found by layer
 * name and checked like a variant's layers (`Check`); layers a designer adds
 * are never touched. The chrome binds atom63 variables, so the card re-themes.
 * Bundled into the runtime IIFE: no Node or DOM imports.
 */
import { type Check, fontTarget, layerChecks, loads, type ValueContext } from './component-values'
import type { ComponentModel, ComponentValue, FigmaProperty, LayerSpec } from './model'
import type { PageLike, SceneNodeLike } from './nodes-api'

/** The atom63 variables the card binds, by code syntax token. */
export const CARD_TOKENS = {
  /** The card: the raised panel surface the docs site puts previews on. */
  surface: '--a63-surface-panel',
  /** Card border and row dividers. */
  border: '--a63-border-subtle',
  borderWidth: '--a63-surface-border-width',
  radius: '--radius-md',
  textPrimary: '--a63-text-primary',
  textSecondary: '--a63-text-secondary',
  /** A CSS stack: its first family is used, as the Label's is (`fontFallbacks`). */
  fontFamily: '--font-family-sans',
  bodySize: '--typography-xs-font-size',
  bodyLine: '--typography-xs-line-height',
  titleSize: '--typography-lg-font-size',
  titleLine: '--typography-lg-line-height',
} as const

const PADDING = 24
const SPACING = 12
const ROW_SPACING = 16
const LABEL_WIDTH = 128
/** Where the set sits in the Grid: right of the row labels, under the header labels. */
export const GRID_LEFT = 176
export const GRID_TOP = 24
/** The name fontFallbacks report card texts under. */
const FONT_LAYER = 'Spec card'

export interface CardContext extends ValueContext {
  model: ComponentModel
  page: PageLike | undefined
  card: SceneNodeLike | undefined
  set: SceneNodeLike | undefined
}
export interface CardPlan {
  create: string[]
  update: string[]
  unchanged: number
}
export interface CardDifference {
  variant: string
  check: Check
}

type Parent = NodeSpec | 'page'
interface NodeSpec {
  name: string
  type: 'FRAME' | 'TEXT'
  parent: Parent
  /** The sibling it is created after; first when there is none. */
  after?: string
  /** A node the card does not create (the set): found, never made. */
  find?: () => SceneNodeLike | undefined
  checks(node: SceneNodeLike): Checks | Promise<Checks>
}
interface Checks {
  checks: Check[]
  fallbacks?: string[]
}
/** What the plan counts as one: a node and the nodes inside it. */
interface Item {
  name: string
  nodes: NodeSpec[]
}

const isText = (node: SceneNodeLike) => node.type === 'TEXT'
const near = (left: number, right: number) => Math.abs(left - right) < 0.01

function prop<K extends keyof SceneNodeLike>(
  node: SceneNodeLike,
  key: K,
  value: SceneNodeLike[K]
): Check {
  return {
    what: `${node.name}.${String(key)}`,
    same: () => node[key] === value,
    write: () => {
      node[key] = value
    },
    describe: () => ({ actual: node[key], expected: value }),
  }
}
function position(node: SceneNodeLike, axis: 'x' | 'y', value: () => number): Check {
  return {
    what: `${node.name}.${axis}`,
    same: () => near(node[axis], value()),
    write: () => {
      node[axis] = value()
    },
    describe: () => ({ actual: node[axis], expected: value() }),
  }
}
const noFills = (node: SceneNodeLike): Check => ({
  what: `${node.name}.fills`,
  same: () => node.fills.length === 0,
  write: () => {
    node.fills = []
  },
  describe: () => ({ actual: node.fills.length, expected: 0 }),
})
function size(node: SceneNodeLike, width?: () => number, height?: () => number): Check {
  const wanted = () => ({ width: width?.() ?? node.width, height: height?.() ?? node.height })
  return {
    what: `${node.name}.size`,
    same: () => near(node.width, wanted().width) && near(node.height, wanted().height),
    write: () => node.resize(wanted().width, wanted().height),
    describe: () => ({ actual: { width: node.width, height: node.height }, expected: wanted() }),
  }
}

const alias = (token: string): ComponentValue => ({ alias: token })
const value = (literal: number): ComponentValue => ({ value: literal })
type Style = Partial<Record<FigmaProperty, ComponentValue>>
const text = (size: ComponentValue, line: ComponentValue, weight: number, fill: string): Style => ({
  fontFamily: alias(CARD_TOKENS.fontFamily),
  fontWeight: value(weight),
  fontSize: size,
  lineHeight: line,
  fill: alias(fill),
})
const STYLES = {
  title: text(
    alias(CARD_TOKENS.titleSize),
    alias(CARD_TOKENS.titleLine),
    700,
    CARD_TOKENS.textPrimary
  ),
  caption: text(value(11), alias(CARD_TOKENS.bodyLine), 700, CARD_TOKENS.textSecondary),
  body: text(
    alias(CARD_TOKENS.bodySize),
    alias(CARD_TOKENS.bodyLine),
    400,
    CARD_TOKENS.textPrimary
  ),
  grid: text(value(11), alias(CARD_TOKENS.bodyLine), 500, CARD_TOKENS.textSecondary),
}

/** A text layer's checks: font as text styles resolve it, the bound style, then its text. */
async function textChecks(
  context: ValueContext,
  node: SceneNodeLike,
  style: Style,
  characters: string,
  extra: Check[] = []
) {
  const layer: LayerSpec = { name: FONT_LAYER, kind: 'text', properties: style }
  const font = await fontTarget(context, node, layer)
  const checks = [...layerChecks(context, node, layer, font), prop(node, 'characters', characters)]
  return { checks: [...checks, ...extra], fallbacks: font?.fallbacks }
}
const frameChecks = (context: ValueContext, node: SceneNodeLike, style: Style) =>
  layerChecks(context, node, { name: node.name, kind: 'frame', properties: style }, null)

/** `Variant=primary, Size=md, State=rest` → its axis values. */
function coordOf(name: string): Record<string, string> {
  const coord: Record<string, string> = {}
  for (const pair of name.split(', ')) {
    const [axis, item] = pair.split('=')
    if (axis && item) coord[axis] = item
  }
  return coord
}

/**
 * Where the set's variants are: each State column's left edge and each
 * `variant · size` row's top and height, in set coordinates, from the
 * variants it holds now (so labels follow a designer's arrangement).
 */
function gridOf(set: SceneNodeLike | undefined) {
  const columns = new Map<string, number>()
  const rows = new Map<string, { y: number; height: number }>()
  for (const child of set?.children ?? []) {
    if (child.type !== 'COMPONENT') continue
    const { Variant, Size, State } = coordOf(child.name)
    if (State) columns.set(State, Math.min(columns.get(State) ?? Infinity, child.x))
    if (!Variant || !Size) continue
    const key = rowName(Variant, Size)
    const row = rows.get(key)
    rows.set(
      key,
      row
        ? {
            y: Math.min(row.y, child.y),
            height: Math.max(row.y + row.height, child.y + child.height) - Math.min(row.y, child.y),
          }
        : { y: child.y, height: child.height }
    )
  }
  return { columns, rows }
}
const rowName = (variant: string, size: string) => `${variant} · ${size}`

/** The doc rows, label and text, in card order. */
function rowsOf(model: ComponentModel): [string, string][] {
  const doc = model.doc!
  const lines = (values: string[], guidance: Record<string, string>) =>
    values.map(item => `${item} — ${guidance[item]}`).join('\n')
  return [
    ['Summary', doc.summary],
    ['When to use', doc.usage],
    ['Variant', lines(model.axes.Variant, doc.axisGuidance.variant)],
    ['Size', lines(model.axes.Size, doc.axisGuidance.size)],
    ['State', lines(model.axes.State, doc.axisGuidance.state)],
    ['Related', doc.related.map(item => item.label).join(', ')],
    ['Docs', doc.docsPath],
  ]
}

/** The set's native description (S7): the summary, then the docs page. */
export const descriptionOf = (model: ComponentModel) =>
  `${model.doc!.summary}\n${model.doc!.docsPath}`

/** Every card part, in write order: a parent before what it holds. */
function cardItems(context: CardContext): Item[] {
  const { model } = context
  const doc = model.doc!
  const card: NodeSpec = {
    name: model.component,
    type: 'FRAME',
    parent: 'page',
    checks: node => ({
      checks: [
        prop(node, 'layoutMode', 'VERTICAL'),
        prop(node, 'counterAxisAlignItems', 'MIN'),
        ...frameChecks(context, node, {
          fill: alias(CARD_TOKENS.surface),
          stroke: alias(CARD_TOKENS.border),
          strokeWeight: alias(CARD_TOKENS.borderWidth),
          cornerRadius: alias(CARD_TOKENS.radius),
          paddingInline: value(PADDING),
          itemSpacing: value(SPACING),
        }),
        prop(node, 'paddingTop', PADDING),
        prop(node, 'paddingBottom', PADDING),
        // Hugs both ways: as tall as its rows, as wide as the Grid (rows stretch to it).
        prop(node, 'primaryAxisSizingMode', 'AUTO'),
        prop(node, 'counterAxisSizingMode', 'AUTO'),
      ],
    }),
  }
  const items: Item[] = [{ name: card.name, nodes: [card] }]
  let previous: string | undefined
  const child = (spec: Omit<NodeSpec, 'parent' | 'after'>) => {
    const made: NodeSpec = { ...spec, parent: card, ...(previous ? { after: previous } : {}) }
    previous = spec.name
    return made
  }
  const stretch = (node: SceneNodeLike) => prop(node, 'layoutAlign', 'STRETCH')
  const hug = (node: SceneNodeLike) => prop(node, 'textAutoResize', 'WIDTH_AND_HEIGHT')
  items.push({
    name: 'Group',
    nodes: [
      child({
        name: 'Group',
        type: 'TEXT',
        checks: node => textChecks(context, node, STYLES.caption, doc.group.title, [hug(node)]),
      }),
    ],
  })
  items.push({
    name: 'Title',
    nodes: [
      child({
        name: 'Title',
        type: 'TEXT',
        checks: node => textChecks(context, node, STYLES.title, doc.slug, [hug(node)]),
      }),
    ],
  })
  const divider = (name: string) =>
    child({
      name,
      type: 'FRAME',
      checks: node => ({
        checks: [
          ...frameChecks(context, node, { fill: alias(CARD_TOKENS.border) }),
          stretch(node),
          size(node, undefined, () => 1),
        ],
      }),
    })
  for (const [label, body] of rowsOf(model)) {
    items.push({ name: `Divider/${label}`, nodes: [divider(`Divider/${label}`)] })
    const row = child({
      name: label,
      type: 'FRAME',
      checks: node => ({
        checks: [
          noFills(node),
          prop(node, 'layoutMode', 'HORIZONTAL'),
          prop(node, 'counterAxisAlignItems', 'MIN'),
          ...frameChecks(context, node, { itemSpacing: value(ROW_SPACING) }),
          stretch(node),
          // Stretched across the card, as tall as its texts.
          prop(node, 'primaryAxisSizingMode', 'FIXED'),
          prop(node, 'counterAxisSizingMode', 'AUTO'),
        ],
      }),
    })
    items.push({
      name: label,
      nodes: [
        row,
        {
          name: 'Label',
          type: 'TEXT',
          parent: row,
          checks: node =>
            textChecks(context, node, STYLES.caption, label, [
              // Fixed width first: a resize turns a text's auto-resize off.
              size(node, () => LABEL_WIDTH),
              prop(node, 'textAutoResize', 'HEIGHT'),
            ]),
        },
        {
          name: 'Value',
          type: 'TEXT',
          parent: row,
          after: 'Label',
          checks: node =>
            textChecks(context, node, STYLES.body, body, [
              prop(node, 'layoutGrow', 1),
              prop(node, 'textAutoResize', 'HEIGHT'),
            ]),
        },
      ],
    })
  }
  items.push({ name: 'Divider/end', nodes: [divider('Divider/end')] })

  const grid = child({
    name: 'Grid',
    type: 'FRAME',
    checks: node => ({
      checks: [
        noFills(node),
        prop(node, 'layoutMode', 'NONE'),
        prop(node, 'clipsContent', false),
        ...(context.set
          ? [
              size(
                node,
                () => GRID_LEFT + context.set!.width,
                () => GRID_TOP + context.set!.height
              ),
            ]
          : []),
      ],
    }),
  })
  items.push({ name: 'Grid', nodes: [grid] })
  items.push({
    name: 'Set',
    nodes: [
      {
        name: model.component,
        type: 'FRAME',
        parent: grid,
        find: () => context.set,
        checks: set => {
          const inGrid: Check = {
            what: `${set.name}.parent`,
            same: () => !!set.parent && set.parent === nodeOf(context, grid),
            write: () => nodeOf(context, grid)?.appendChild(set),
            describe: () => ({ actual: set.parent?.name ?? null, expected: grid.name }),
          }
          return {
            checks: [
              inGrid,
              position(set, 'x', () => GRID_LEFT),
              position(set, 'y', () => GRID_TOP),
              prop(set, 'description', descriptionOf(model)),
            ],
          }
        },
      },
    ],
  })

  // Header labels over the State columns, row labels beside the grid rows.
  const rows = new Set<string>()
  const states = new Set<string>()
  const coords = [
    ...(context.set?.children ?? []).map(node => coordOf(node.name)),
    ...model.variants.map(variant => ({
      Variant: variant.coord.variant,
      Size: variant.coord.size,
      State: variant.coord.state,
    })),
  ]
  for (const variant of model.axes.Variant)
    for (const size of model.axes.Size)
      if (coords.some(coord => coord.Variant === variant && coord.Size === size))
        rows.add(rowName(variant, size))
  for (const state of model.axes.State)
    if (coords.some(coord => coord.State === state)) states.add(state)
  const setAt = () => ({ x: context.set?.x ?? GRID_LEFT, y: context.set?.y ?? GRID_TOP })
  for (const state of states) {
    const name = `Header/${state}`
    items.push({
      name,
      nodes: [
        {
          name,
          type: 'TEXT',
          parent: grid,
          checks: node => {
            const column = gridOf(context.set).columns.get(state)
            return textChecks(context, node, STYLES.grid, state, [
              hug(node),
              ...(column === undefined
                ? []
                : [position(node, 'x', () => setAt().x + column), position(node, 'y', () => 0)]),
            ])
          },
        },
      ],
    })
  }
  for (const row of rows) {
    const name = `Row/${row}`
    items.push({
      name,
      nodes: [
        {
          name,
          type: 'TEXT',
          parent: grid,
          checks: node => {
            const at = gridOf(context.set).rows.get(row)
            return textChecks(context, node, STYLES.grid, row, [
              hug(node),
              ...(at
                ? [
                    position(node, 'x', () => 0),
                    position(node, 'y', () => setAt().y + at.y + (at.height - node.height) / 2),
                  ]
                : []),
            ])
          },
        },
      ],
    })
  }
  return items
}

/** The card part's node: the card on the page, a layer by name and type in its parent. */
function nodeOf(context: CardContext, spec: NodeSpec): SceneNodeLike | undefined {
  if (spec.find) return spec.find()
  const parent = spec.parent === 'page' ? context.page : nodeOf(context, spec.parent)
  return parent?.children?.find(node => node.name === spec.name && node.type === spec.type)
}

/** The card frame on the page: a frame named as the component (S6). */
export const findCard = (page: PageLike | undefined, model: ComponentModel) =>
  page?.children.find(node => node.type === 'FRAME' && node.name === model.component)

/** The component set inside the card, at any depth outside other sets. */
export function findSetIn(
  node: SceneNodeLike | undefined,
  name: string
): SceneNodeLike | undefined {
  for (const child of node?.children ?? []) {
    if (child.type === 'COMPONENT_SET') {
      if (child.name === name) return child
    } else if (child.type === 'FRAME') {
      const found = findSetIn(child, name)
      if (found) return found
    }
  }
  return undefined
}

/** The card's plan: each part new, differing or as the model says, and what differs first. */
export async function planCard(context: CardContext) {
  const plan: CardPlan = { create: [], update: [], unchanged: 0 }
  const differences: CardDifference[] = []
  for (const item of cardItems(context)) {
    let status: 'create' | 'update' | 'unchanged' = 'unchanged'
    for (const [index, spec] of item.nodes.entries()) {
      const node = nodeOf(context, spec)
      if (!node) {
        // The set is made by the variants, never by the card.
        status = index === 0 ? 'create' : 'update'
        if (status === 'update')
          differences.push({ variant: `card ${item.name}`, check: missing(spec) })
        break
      }
      const differing = (await spec.checks(node)).checks.find(check => !check.same())
      if (differing) {
        status = 'update'
        differences.push({ variant: `card ${item.name}`, check: differing })
        break
      }
    }
    if (status === 'unchanged') plan.unchanged += 1
    else plan[status].push(item.name)
  }
  return { plan, differences }
}
const missing = (spec: NodeSpec): Check => ({
  what: `${spec.name} missing`,
  same: () => false,
  write: () => undefined,
})

function create(context: CardContext, spec: NodeSpec): SceneNodeLike | undefined {
  const node = spec.type === 'TEXT' ? context.figma.createText() : context.figma.createFrame()
  node.name = spec.name
  if (spec.parent === 'page') {
    context.page!.appendChild(node)
    // In place of the set it will hold, when a file already has one on the page.
    if (context.set && context.set.parent === context.page) {
      node.x = context.set.x
      node.y = context.set.y
    }
    context.card = node
    return node
  }
  const parent = nodeOf(context, spec.parent)
  if (!parent) return undefined
  const siblings = parent.children ?? []
  const after = spec.after ? siblings.findIndex(item => item.name === spec.after) : -1
  parent.insertChild(after + 1, node)
  return node
}

/**
 * Writes what differs, part by part, creating missing ones (a set is only
 * moved). `named` names the part and the check if a write throws. Returns the
 * parts created and updated, and the font fallbacks.
 */
export async function applyCard(
  context: CardContext,
  named: <T>(variant: string, what: string, write: () => T) => T
) {
  const result = { created: 0, updated: 0, fallbacks: [] as string[] }
  const items = cardItems(context)
  const writeNode = async (item: Item, spec: NodeSpec, node: SceneNodeLike) => {
    const { checks, fallbacks } = await spec.checks(node)
    result.fallbacks.push(...(fallbacks ?? []))
    const pending = checks.filter(check => !check.same())
    // Figma changes a text layer only once its current font is loaded.
    if (pending.length > 0 && isText(node) && node.fontName) await loads(context, node.fontName)
    for (const check of pending)
      if (!check.same()) named(`card ${item.name}`, check.what, () => check.write())
    return pending.length > 0
  }
  for (const item of items) {
    let made = false
    let changed = false
    for (const [index, spec] of item.nodes.entries()) {
      let node = nodeOf(context, spec)
      if (!node && !spec.find) {
        node = named(`card ${item.name}`, `add ${spec.name}`, () => create(context, spec))
        if (index === 0) made = true
        else changed = true
      }
      if (node && (await writeNode(item, spec, node))) changed = true
    }
    if (made) result.created += 1
    else if (changed) result.updated += 1
  }
  // Last, once every row and the Grid are in: the card's own sizing, which a stretch can change.
  const card = nodeOf(context, items[0].nodes[0])
  if (card) await writeNode(items[0], items[0].nodes[0], card)
  return result
}
