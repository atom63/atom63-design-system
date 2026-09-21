import type { VisualArchetypeId } from '../../visual-archetypes'

export const labelStates = ['rest', 'disabled', 'invalid'] as const
export const labelSlots = ['label'] as const
export const labelVisualArchetypes = ['field'] as const satisfies readonly VisualArchetypeId[]

export type LabelState = (typeof labelStates)[number]
export type LabelSlot = (typeof labelSlots)[number]
export type LabelVisualArchetype = (typeof labelVisualArchetypes)[number]

export interface LabelContract {
  slots: readonly LabelSlot[]
  states: readonly LabelState[]
  visualArchetypes: readonly LabelVisualArchetype[]
}

export const labelContract = {
  slots: labelSlots,
  states: labelStates,
  visualArchetypes: labelVisualArchetypes,
} satisfies LabelContract
