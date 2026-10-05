/** Messages between the plugin UI and its main thread. */
import type { CheckOutcome, SyncModel, SyncOutcome, TokenTable } from '@atom63/figma'

export interface PluginSettings {
  theme: 'light' | 'dark' | 'system'
}

export type UIToMain =
  | { type: 'scan' }
  | { type: 'plan'; model: SyncModel }
  | { type: 'apply'; model: SyncModel }
  | { type: 'load-settings' }
  | { type: 'save-settings'; data: Partial<PluginSettings> }

export type MainToUI =
  | { type: 'table'; data: TokenTable }
  | { type: 'planned'; data: CheckOutcome }
  | { type: 'applied'; data: SyncOutcome & { table: TokenTable } }
  | { type: 'settings'; data: PluginSettings }
  | { type: 'error'; data: { message: string } }
