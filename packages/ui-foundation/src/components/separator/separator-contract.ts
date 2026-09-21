// Faithful to prod @atom63/ui separator.tsx: a solid hairline (default) or a
// soft edge-to-edge gradient fade, in either orientation.
export const separatorVariants = ['default', 'gradient'] as const
export const separatorOrientations = ['horizontal', 'vertical'] as const
export const separatorModes = ['decorative', 'semantic'] as const
export const separatorSlots = ['separator'] as const
export const separatorVisualArchetypes = [] as const satisfies readonly VisualArchetypeId[]

export type SeparatorVariant = (typeof separatorVariants)[number]
export type SeparatorOrientation = (typeof separatorOrientations)[number]
export type SeparatorMode = (typeof separatorModes)[number]
export type SeparatorSlot = (typeof separatorSlots)[number]
export type SeparatorVisualArchetype = (typeof separatorVisualArchetypes)[number]

export interface SeparatorContract {
  defaultMode: SeparatorMode
  defaultVariant: SeparatorVariant
  defaultOrientation: SeparatorOrientation
  variants: readonly SeparatorVariant[]
  orientations: readonly SeparatorOrientation[]
  modes: readonly SeparatorMode[]
  slots: readonly SeparatorSlot[]
  visualArchetypes: readonly SeparatorVisualArchetype[]
}

export const separatorContract = {
  defaultMode: 'semantic',
  defaultVariant: 'default',
  defaultOrientation: 'horizontal',
  variants: separatorVariants,
  orientations: separatorOrientations,
  modes: separatorModes,
  slots: separatorSlots,
  visualArchetypes: separatorVisualArchetypes,
} satisfies SeparatorContract
import type { VisualArchetypeId } from '../../visual-archetypes'
