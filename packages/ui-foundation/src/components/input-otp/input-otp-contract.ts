import type { VisualArchetypeId } from '../../visual-archetypes'

export const inputOTPStates = ['rest', 'active', 'disabled', 'invalid'] as const
export const inputOTPSlots = [
  'input-otp',
  'input-otp-group',
  'input-otp-slot',
  'input-otp-separator',
] as const
export const inputOTPVisualArchetypes = ['field'] as const satisfies readonly VisualArchetypeId[]

export type InputOTPState = (typeof inputOTPStates)[number]
export type InputOTPSlot = (typeof inputOTPSlots)[number]
export type InputOTPVisualArchetype = (typeof inputOTPVisualArchetypes)[number]

export interface InputOTPContract {
  slots: readonly InputOTPSlot[]
  states: readonly InputOTPState[]
  visualArchetypes: readonly InputOTPVisualArchetype[]
}

export const inputOTPContract = {
  slots: inputOTPSlots,
  states: inputOTPStates,
  visualArchetypes: inputOTPVisualArchetypes,
} satisfies InputOTPContract
