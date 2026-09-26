import type { CSSProperties } from 'react'

/**
 * Fills the host box. Passed as `style`, which lands on the surface's outer
 * shell: the runtime shells size the widget itself, not its face.
 */
export const WIDGET_FILL_STYLE: CSSProperties = { blockSize: '100%', inlineSize: '100%' }
