import type { VisualArchetypeId } from '../../visual-archetypes'

export const toggleGroupOrientations = ['horizontal', 'vertical'] as const
export const toggleGroupSelectionModes = ['single', 'multiple'] as const
export const toggleGroupStates = ['rest', 'hover', 'focus', 'selected', 'disabled'] as const
export const toggleGroupSlots = [
  'toggle-group',
  'toggle-group-item',
  'toggle-group-separator',
] as const
export const toggleGroupTokenSlots = [
  'segment.gap',
  'segment.radius',
  'segment.background',
  'segment.gloss',
  'segment.trackBorder',
  'segment.seam',
  'segment.selectedBackground',
  'segment.selectedForeground',
  'segment.selectedGloss',
  'segment.selectedShadow',
  'segment.primaryBackground',
  'segment.primaryForeground',
  'segment.primaryShadow',
] as const
export const toggleGroupVisualArchetypes = [
  'toggle',
  'segment',
] as const satisfies readonly VisualArchetypeId[]

export type ToggleGroupOrientation = (typeof toggleGroupOrientations)[number]
export type ToggleGroupSelectionMode = (typeof toggleGroupSelectionModes)[number]
export type ToggleGroupState = (typeof toggleGroupStates)[number]
export type ToggleGroupSlot = (typeof toggleGroupSlots)[number]
export type ToggleGroupTokenSlot = (typeof toggleGroupTokenSlots)[number]
export type ToggleGroupVisualArchetype = (typeof toggleGroupVisualArchetypes)[number]

export interface ToggleGroupContract {
  defaultOrientation: ToggleGroupOrientation
  defaultSelectionMode: ToggleGroupSelectionMode
  orientations: readonly ToggleGroupOrientation[]
  selectionModes: readonly ToggleGroupSelectionMode[]
  slots: readonly ToggleGroupSlot[]
  states: readonly ToggleGroupState[]
  tokenSlots: readonly ToggleGroupTokenSlot[]
  visualArchetypes: readonly ToggleGroupVisualArchetype[]
}

export const toggleGroupContract = {
  defaultOrientation: 'horizontal',
  defaultSelectionMode: 'single',
  orientations: toggleGroupOrientations,
  selectionModes: toggleGroupSelectionModes,
  slots: toggleGroupSlots,
  states: toggleGroupStates,
  tokenSlots: toggleGroupTokenSlots,
  visualArchetypes: toggleGroupVisualArchetypes,
} satisfies ToggleGroupContract
