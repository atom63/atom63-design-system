import type { VisualArchetypeId } from '../../visual-archetypes'

export const previewCardStates = ['closed', 'open', 'starting', 'ending'] as const
export const previewCardSlots = [
  'preview-card',
  'preview-card-trigger',
  'preview-card-portal',
  'preview-card-positioner',
  'preview-card-content',
] as const
export const previewCardVisualArchetypes = [
  'trigger',
  'overlay',
  'surface',
] as const satisfies readonly VisualArchetypeId[]

export type PreviewCardState = (typeof previewCardStates)[number]
export type PreviewCardSlot = (typeof previewCardSlots)[number]
export type PreviewCardVisualArchetype = (typeof previewCardVisualArchetypes)[number]

export interface PreviewCardContract {
  slots: readonly PreviewCardSlot[]
  states: readonly PreviewCardState[]
  visualArchetypes: readonly PreviewCardVisualArchetype[]
}

export const previewCardContract = {
  slots: previewCardSlots,
  states: previewCardStates,
  visualArchetypes: previewCardVisualArchetypes,
} satisfies PreviewCardContract
