import type { VisualArchetypeId } from '../../visual-archetypes'

// Empty is a composed low-emphasis state surface. EmptyMedia carries its only
// variant axis; EmptyErrorDetail adds a disclosure action inside that surface.
export const emptyMediaVariants = ['default', 'icon'] as const
export const emptySlots = [
  'empty',
  'empty-header',
  'empty-icon',
  'empty-title',
  'empty-description',
  'empty-content',
  'empty-error-detail',
  'empty-error-toggle',
  'empty-error-box',
  'empty-error-text',
  'empty-error-copy',
] as const
export const emptyStates = ['empty', 'error', 'collapsed', 'expanded'] as const
export const emptyVisualArchetypes = [
  'surface',
  'action',
] as const satisfies readonly VisualArchetypeId[]

export type EmptyMediaVariant = (typeof emptyMediaVariants)[number]
export type EmptySlot = (typeof emptySlots)[number]
export type EmptyState = (typeof emptyStates)[number]
export type EmptyVisualArchetype = (typeof emptyVisualArchetypes)[number]

export interface EmptyContract {
  defaultMediaVariant: EmptyMediaVariant
  mediaVariants: readonly EmptyMediaVariant[]
  slots: readonly EmptySlot[]
  states: readonly EmptyState[]
  visualArchetypes: readonly EmptyVisualArchetype[]
}

export const emptyContract = {
  defaultMediaVariant: 'default',
  mediaVariants: emptyMediaVariants,
  slots: emptySlots,
  states: emptyStates,
  visualArchetypes: emptyVisualArchetypes,
} satisfies EmptyContract
