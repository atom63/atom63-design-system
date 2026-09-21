export type ContainerMaxWidth =
  'fluid' | 'widest' | 'wider' | 'wide' | 'default' | 'narrow' | 'narrower' | 'narrowest'

/** Shared max-width class map for Container and GridChrome. */
export const containerMaxWidthStyles: Record<ContainerMaxWidth, string> = {
  fluid: 'max-w-full',
  widest: 'max-w-8xl',
  wider: 'max-w-7xl',
  wide: 'max-w-6xl',
  default: 'max-w-5xl',
  narrow: 'max-w-4xl',
  narrower: 'max-w-2xl',
  narrowest: 'max-w-xl',
}

/**
 * Centered max-width frame (no Tailwind `container` padding).
 * Used for fixed rails / guides so edges align with content chrome.
 */
export function containerFrameClassName(maxWidth: ContainerMaxWidth = 'default'): string {
  return `mx-auto w-full min-w-0 ${containerMaxWidthStyles[maxWidth]}`
}
