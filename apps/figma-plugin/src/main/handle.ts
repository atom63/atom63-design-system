/** The main thread's work: read the token table, plan and apply token sets. */
import { checkModel, readTokenTable, type StylesApi, syncModel } from '@atom63/figma'

import type { MainToUI, UIToMain } from '../messages'

export async function handle(figma: StylesApi, message: UIToMain): Promise<MainToUI | null> {
  switch (message.type) {
    case 'scan':
      return { type: 'table', data: await readTokenTable(figma) }
    case 'plan':
      return { type: 'planned', data: await checkModel(figma, message.model) }
    case 'apply': {
      const outcome = await syncModel(figma, message.model)
      return { type: 'applied', data: { ...outcome, table: await readTokenTable(figma) } }
    }
    default:
      return null
  }
}
