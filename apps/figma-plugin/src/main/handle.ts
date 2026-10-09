/**
 * The main thread's work: read the token table, plan and apply token sets, and
 * build or check the bundled Atom63 design system. Every write goes through
 * @atom63/figma; the plugin adds no Figma writing of its own.
 */
import {
  buildDesignSystem,
  checkDesignSystem,
  checkModel,
  type DesignSystemModels,
  type DesignSystemProgress,
  type NodesApi,
  readDesignSystemTable,
  readTokenTable,
  type StylesApi,
  syncModel,
} from '@atom63/figma'

import type { MainToUI, UIToMain } from '../messages'
import { atom63Models } from './atom63-models'

/** A node as `select-node` walks it: up its parents to its page. */
export interface SelectableNode {
  readonly id: string
  readonly type: string
  readonly parent: SelectableNode | null
}
export interface SelectablePage extends SelectableNode {
  readonly type: 'PAGE'
  loadAsync(): Promise<void>
}
/** The figma global's selection and viewport, for `select-node`. */
export interface SelectionApi {
  getNodeByIdAsync(id: string): Promise<SelectableNode | null>
  setCurrentPageAsync(page: SelectablePage): Promise<void>
  readonly currentPage: { selection: readonly SelectableNode[] }
  viewport: { scrollAndZoomIntoView(nodes: readonly SelectableNode[]): void }
}

/** What the Atom63 messages need beyond the token flows' StylesApi. */
export interface Atom63Context {
  /** The figma global as the engine's NodesApi: components and cards need the node API. */
  nodes: () => NodesApi
  /** Posts each step of a build to the UI. */
  progress?: (progress: DesignSystemProgress) => void
  /** The bundled models unless a test passes others. */
  models?: DesignSystemModels
  /** The figma global's selection and viewport, for `select-node`. */
  selection?: () => SelectionApi
}

function atom63Of(context: Atom63Context | undefined) {
  if (!context) throw new Error('The Atom63 design system needs the node API')
  return { figma: context.nodes(), models: context.models ?? atom63Models }
}

/** A build, check or scan in flight: they yield to Figma, so the UI could start another. */
let busy = false

const BUSY = 'A build or check is already running'

async function exclusive<T>(run: () => Promise<T>): Promise<T> {
  if (busy) throw new Error(BUSY)
  busy = true
  try {
    return await run()
  } finally {
    busy = false
  }
}

const GONE = 'That layer is no longer in the file.'

function pageOf(node: SelectableNode): SelectablePage | null {
  for (let cursor = node.parent; cursor; cursor = cursor.parent)
    if (cursor.type === 'PAGE') return cursor as SelectablePage
  return null
}

/**
 * Selects a node and brings it into view. It writes no node, so it does not
 * take the busy lock, but it waits for no build either: switching the current
 * page mid-build would move where Figma creates nodes, so it is refused.
 */
async function selectNode(api: SelectionApi, id: string): Promise<MainToUI> {
  if (busy) throw new Error(BUSY)
  const node = await api.getNodeByIdAsync(id)
  const page = node && pageOf(node)
  if (!node || !page) return { type: 'error', data: { message: GONE, for: 'select-node' } }
  await page.loadAsync()
  await api.setCurrentPageAsync(page)
  api.currentPage.selection = [node]
  api.viewport.scrollAndZoomIntoView([node])
  return { type: 'selected', data: { id } }
}

export async function handle(
  figma: StylesApi,
  message: UIToMain,
  context?: Atom63Context
): Promise<MainToUI | null> {
  switch (message.type) {
    case 'scan':
      return { type: 'table', data: await readTokenTable(figma) }
    case 'plan':
      return { type: 'planned', data: await checkModel(figma, message.model) }
    case 'apply': {
      const outcome = await syncModel(figma, message.model)
      return { type: 'applied', data: { ...outcome, table: await readTokenTable(figma) } }
    }
    case 'atom63-scan': {
      const { figma: nodes, models } = atom63Of(context)
      return exclusive(async () => ({
        type: 'atom63-table',
        data: await readDesignSystemTable(nodes, models),
      }))
    }
    case 'atom63-build': {
      const { figma: nodes, models } = atom63Of(context)
      return exclusive(async () => {
        const outcome = await buildDesignSystem(nodes, models, context?.progress)
        return {
          type: 'atom63-built',
          data: { ...outcome, table: await readDesignSystemTable(nodes, models) },
        }
      })
    }
    case 'atom63-check': {
      const { figma: nodes, models } = atom63Of(context)
      return exclusive(async () => ({
        type: 'atom63-checked',
        data: await checkDesignSystem(nodes, models),
      }))
    }
    case 'select-node': {
      if (!context?.selection) throw new Error('Selecting a layer needs the node API')
      return selectNode(context.selection(), message.id)
    }
    default:
      return null
  }
}
