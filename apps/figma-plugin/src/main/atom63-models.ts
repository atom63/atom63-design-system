/**
 * The Atom63 models the main thread builds (P2): the generated, CI-guarded
 * files, bundled into code.js at build time; no copy lives in the plugin.
 * The token model has no styles; the engine derives them as the CLI does.
 *
 * They arrive as JSON strings (`?raw`: build.js emits each as one minified
 * string literal) and are parsed on the first `atom63-*` message, not when
 * code.js loads (R3): V8 scans a string literal far faster than the object
 * literal it would otherwise build, and the token flows never parse them.
 */
import type { ComponentModel, DesignSystemModels, SyncModel } from '@atom63/figma'
import sync from '@atom63/styles/figma-sync.json?raw'

// The component model is generated inside @atom63/figma, which publishes only dist.
import button from '../../../../packages/figma/generated/atom63.figma-components.json?raw'

let models: DesignSystemModels | null = null

/** The bundled models, parsed once on first use. */
export function atom63Models(): DesignSystemModels {
  models ??= {
    sync: JSON.parse(sync) as SyncModel,
    components: [JSON.parse(button) as ComponentModel],
  }
  return models
}
