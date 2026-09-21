import type { VisualArchetypeId } from '../../visual-archetypes'
export const spinnerStates = ['loading', 'reduced-motion'] as const
export const spinnerSlots = ['spinner'] as const
export const spinnerVisualArchetypes = [] as const satisfies readonly VisualArchetypeId[]
export type SpinnerState = (typeof spinnerStates)[number]
export type SpinnerSlot = (typeof spinnerSlots)[number]
export type SpinnerVisualArchetype = (typeof spinnerVisualArchetypes)[number]
export interface SpinnerContract {
  states: readonly SpinnerState[]
  slots: readonly SpinnerSlot[]
  visualArchetypes: readonly SpinnerVisualArchetype[]
}
export const spinnerContract = {
  states: spinnerStates,
  slots: spinnerSlots,
  visualArchetypes: spinnerVisualArchetypes,
} satisfies SpinnerContract
