import type { VisualArchetypeId } from '../../visual-archetypes'

export const textareaSizes = ['sm', 'md', 'lg'] as const
export const textareaStates = ['rest', 'hover', 'focus', 'disabled', 'invalid'] as const
export const textareaSlots = ['textarea-control', 'textarea'] as const
export const textareaTokenSlots = [
  'field.background',
  'field.border',
  'field.radius',
  'field.shadow',
  'field.focusRing',
  'field.focusBorder',
  'field.paddingInline',
  'field.paddingBlock',
  'field.fontSize',
  'field.minHeight',
] as const
export const textareaVisualArchetypes = ['field'] as const satisfies readonly VisualArchetypeId[]

export type TextareaSize = (typeof textareaSizes)[number]
export type TextareaState = (typeof textareaStates)[number]
export type TextareaSlot = (typeof textareaSlots)[number]
export type TextareaTokenSlot = (typeof textareaTokenSlots)[number]
export type TextareaVisualArchetype = (typeof textareaVisualArchetypes)[number]

export interface TextareaContract {
  defaultSize: TextareaSize
  sizes: readonly TextareaSize[]
  states: readonly TextareaState[]
  slots: readonly TextareaSlot[]
  tokenSlots: readonly TextareaTokenSlot[]
  visualArchetypes: readonly TextareaVisualArchetype[]
}

export const textareaContract = {
  defaultSize: 'md',
  sizes: textareaSizes,
  states: textareaStates,
  slots: textareaSlots,
  tokenSlots: textareaTokenSlots,
  visualArchetypes: textareaVisualArchetypes,
} satisfies TextareaContract
