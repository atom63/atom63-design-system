export const radioSizes = ['sm', 'md'] as const
export const radioStates = ['unchecked', 'checked', 'focus-visible', 'disabled', 'invalid'] as const
export const radioSlots = ['radio-group', 'radio', 'radio-indicator'] as const
export const radioVisualArchetypes = ['choice'] as const

export type RadioSize = (typeof radioSizes)[number]
export type RadioState = (typeof radioStates)[number]
export type RadioSlot = (typeof radioSlots)[number]
export type RadioVisualArchetype = (typeof radioVisualArchetypes)[number]

export interface RadioContract {
  defaultSize: RadioSize
  sizes: readonly RadioSize[]
  states: readonly RadioState[]
  slots: readonly RadioSlot[]
  visualArchetypes: readonly RadioVisualArchetype[]
}

export const radioContract = {
  defaultSize: 'md',
  sizes: radioSizes,
  states: radioStates,
  slots: radioSlots,
  visualArchetypes: radioVisualArchetypes,
} satisfies RadioContract
