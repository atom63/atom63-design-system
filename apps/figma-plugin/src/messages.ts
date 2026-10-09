/** Messages between the plugin UI and its main thread. */
import type {
  CheckOutcome,
  DesignSystemBlocked,
  DesignSystemOutcome,
  DesignSystemProgress,
  DesignSystemTable,
  SyncModel,
  SyncOutcome,
  TokenTable,
} from '@atom63/figma'

export type { DesignSystemBlocked, DesignSystemOutcome, DesignSystemProgress, DesignSystemTable }

export interface PluginSettings {
  theme: 'light' | 'dark' | 'system'
}

export type UIToMain =
  | { type: 'scan' }
  | { type: 'plan'; model: SyncModel }
  | { type: 'apply'; model: SyncModel }
  /** What the file holds of the Atom63 design system (and any template table, P5). */
  | { type: 'atom63-scan' }
  /**
   * Builds the bundled Atom63 design system: `progress`* then `atom63-built`.
   * A file that already holds another token set is refused: `atom63-built`
   * with `status: 'blocked'` and its reason, nothing written. One build,
   * check or scan at a time: another meanwhile is an `error`.
   */
  | { type: 'atom63-build' }
  /** Checks it read-only, in a later task so Figma's reconciliation has settled (P3). */
  | { type: 'atom63-check' }
  | { type: 'load-settings' }
  | { type: 'save-settings'; data: Partial<PluginSettings> }

export type MainToUI =
  | { type: 'table'; data: TokenTable }
  | { type: 'planned'; data: CheckOutcome }
  | { type: 'applied'; data: SyncOutcome & { table: TokenTable } }
  | { type: 'atom63-table'; data: DesignSystemTable }
  | { type: 'progress'; data: DesignSystemProgress }
  | {
      type: 'atom63-built'
      data: (DesignSystemOutcome | DesignSystemBlocked) & { table: DesignSystemTable }
    }
  | { type: 'atom63-checked'; data: DesignSystemOutcome }
  | { type: 'settings'; data: PluginSettings }
  | { type: 'error'; data: { message: string } }
