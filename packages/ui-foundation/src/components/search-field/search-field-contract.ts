import type { VisualArchetypeId } from '../../visual-archetypes'

export const searchFieldStates = ['empty', 'query', 'focus', 'disabled'] as const
export const searchFieldSlots = [
  'search-field',
  'search-field-icon',
  'search-field-input',
  'search-field-clear',
] as const
export const searchFieldVisualArchetypes = [
  'field',
  'action',
] as const satisfies readonly VisualArchetypeId[]

export type SearchFieldState = (typeof searchFieldStates)[number]
export type SearchFieldSlot = (typeof searchFieldSlots)[number]
export type SearchFieldVisualArchetype = (typeof searchFieldVisualArchetypes)[number]

export interface SearchFieldContract {
  slots: readonly SearchFieldSlot[]
  states: readonly SearchFieldState[]
  visualArchetypes: readonly SearchFieldVisualArchetype[]
}

export const searchFieldContract = {
  slots: searchFieldSlots,
  states: searchFieldStates,
  visualArchetypes: searchFieldVisualArchetypes,
} satisfies SearchFieldContract
