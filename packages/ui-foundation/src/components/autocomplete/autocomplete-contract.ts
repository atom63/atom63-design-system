export const autocompleteSizes = ['sm', 'default', 'lg'] as const

export const autocompleteSlots = [
  'autocomplete-input-group',
  'autocomplete-start-addon',
  'autocomplete-input',
  'autocomplete-trigger',
  'autocomplete-icon',
  'autocomplete-clear',
  'autocomplete-positioner',
  'autocomplete-surface',
  'autocomplete-popup',
  'autocomplete-list',
  'autocomplete-item',
  'autocomplete-separator',
  'autocomplete-group',
  'autocomplete-group-label',
  'autocomplete-empty',
  'autocomplete-row',
  'autocomplete-value',
  'autocomplete-status',
  'autocomplete-collection',
] as const

export const autocompleteStates = [
  'closed',
  'open',
  'highlighted',
  'disabled',
  'empty',
  'loading',
] as const

export const autocompleteVisualArchetypes = ['field', 'trigger', 'overlay', 'menu'] as const

export type AutocompleteSize = (typeof autocompleteSizes)[number]
export type AutocompleteSlot = (typeof autocompleteSlots)[number]
export type AutocompleteState = (typeof autocompleteStates)[number]
export type AutocompleteVisualArchetype = (typeof autocompleteVisualArchetypes)[number]

export interface AutocompleteContract {
  defaultSize: AutocompleteSize
  sizes: readonly AutocompleteSize[]
  slots: readonly AutocompleteSlot[]
  states: readonly AutocompleteState[]
  visualArchetypes: readonly AutocompleteVisualArchetype[]
}

export const autocompleteContract = {
  defaultSize: 'default',
  sizes: autocompleteSizes,
  slots: autocompleteSlots,
  states: autocompleteStates,
  visualArchetypes: autocompleteVisualArchetypes,
} satisfies AutocompleteContract
