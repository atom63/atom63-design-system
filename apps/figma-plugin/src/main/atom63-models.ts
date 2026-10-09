/**
 * The Atom63 models the main thread builds (P2): the generated, CI-guarded
 * files, bundled into code.js at build time; no copy lives in the plugin.
 * The token model has no styles; the engine derives them as the CLI does.
 */
import type { ComponentModel, DesignSystemModels, SyncModel } from '@atom63/figma'
import sync from '@atom63/styles/figma-sync.json'

// The component model is generated inside @atom63/figma, which publishes only dist.
import button from '../../../../packages/figma/generated/atom63.figma-components.json'

export const atom63Models: DesignSystemModels = {
  sync: sync as unknown as SyncModel,
  components: [button as unknown as ComponentModel],
}
