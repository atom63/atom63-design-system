export interface OcclusionResult {
  /** Text and focusable elements under an opaque foreground pixel. */
  occluded: string[]
  /** Foreground pictures that could not be read (cross-origin without CORS). */
  unreadable: string[]
  /** How many elements were checked. */
  checked: number
}

export function findOccludedElements(
  scene: Element,
  options?: { alpha?: number; step?: number }
): Promise<OcclusionResult>
