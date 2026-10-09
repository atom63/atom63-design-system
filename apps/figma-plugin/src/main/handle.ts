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

/** What the Atom63 messages need beyond the token flows' StylesApi. */
export interface Atom63Context {
  /** The figma global as the engine's NodesApi: components and cards need the node API. */
  nodes: () => NodesApi
  /** Posts each step of a build to the UI. */
  progress?: (progress: DesignSystemProgress) => void
  /** The bundled models unless a test passes others. */
  models?: DesignSystemModels
}

function atom63Of(context: Atom63Context | undefined) {
  if (!context) throw new Error('The Atom63 design system needs the node API')
  return { figma: context.nodes(), models: context.models ?? atom63Models }
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
      return { type: 'atom63-table', data: await readDesignSystemTable(nodes, models) }
    }
    case 'atom63-build': {
      const { figma: nodes, models } = atom63Of(context)
      const outcome = await buildDesignSystem(nodes, models, context?.progress)
      return {
        type: 'atom63-built',
        data: { ...outcome, table: await readDesignSystemTable(nodes, models) },
      }
    }
    case 'atom63-check': {
      const { figma: nodes, models } = atom63Of(context)
      return { type: 'atom63-checked', data: await checkDesignSystem(nodes, models) }
    }
    default:
      return null
  }
}
