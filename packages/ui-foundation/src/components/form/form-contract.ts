import type { VisualArchetypeId } from '../../visual-archetypes'

export const formSlots = [
  'form-item',
  'form-label',
  'form-control',
  'form-description',
  'form-message',
] as const
export const formStates = ['default', 'invalid'] as const
export const formVisualArchetypes = ['field'] as const satisfies readonly VisualArchetypeId[]

export type FormSlot = (typeof formSlots)[number]
export type FormState = (typeof formStates)[number]
export type FormVisualArchetype = (typeof formVisualArchetypes)[number]

export interface FormContract {
  slots: readonly FormSlot[]
  states: readonly FormState[]
  visualArchetypes: readonly FormVisualArchetype[]
}

export const formContract = {
  slots: formSlots,
  states: formStates,
  visualArchetypes: formVisualArchetypes,
} satisfies FormContract
