/**
 * What Import shows: the plan of the CSS on screen, or the result of applying
 * it, never one left over from earlier CSS or an earlier step.
 */
import type { CheckOutcome, SyncOutcome } from '@atom63/figma'

export interface ImportResults {
  planned?: CheckOutcome
  applied?: SyncOutcome
}

export type ImportEvent =
  | { type: 'source-changed' }
  | { type: 'plan-sent' }
  | { type: 'planned'; data: CheckOutcome }
  | { type: 'applied'; data: SyncOutcome }

export function nextResults(state: ImportResults, event: ImportEvent): ImportResults {
  switch (event.type) {
    case 'source-changed':
      return {}
    case 'plan-sent':
      return state.planned ? { planned: state.planned } : {}
    case 'planned':
      return { planned: event.data }
    case 'applied':
      return { applied: event.data }
  }
}
