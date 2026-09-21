import type { VisualArchetypeId } from '../../visual-archetypes'

export const progressStates = ['indeterminate', 'progressing', 'complete'] as const
export const progressSlots = [
  'progress',
  'progress-label',
  'progress-track',
  'progress-indicator',
  'progress-value',
] as const
export const progressVisualArchetypes = ['range'] as const satisfies readonly VisualArchetypeId[]

export type ProgressState = (typeof progressStates)[number]
export type ProgressSlot = (typeof progressSlots)[number]
export type ProgressVisualArchetype = (typeof progressVisualArchetypes)[number]

export interface ProgressContract {
  slots: readonly ProgressSlot[]
  states: readonly ProgressState[]
  visualArchetypes: readonly ProgressVisualArchetype[]
}

export const progressContract = {
  slots: progressSlots,
  states: progressStates,
  visualArchetypes: progressVisualArchetypes,
} satisfies ProgressContract
