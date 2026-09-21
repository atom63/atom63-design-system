export const checkboxSizes = ['sm', 'md'] as const
export const checkboxStates = [
  'unchecked',
  'checked',
  'indeterminate',
  'disabled',
  'invalid',
] as const
export const checkboxSlots = ['checkbox', 'checkbox-indicator'] as const
export const checkboxVisualArchetypes = ['choice'] as const

export type CheckboxSize = (typeof checkboxSizes)[number]
export type CheckboxState = (typeof checkboxStates)[number]
export type CheckboxSlot = (typeof checkboxSlots)[number]
export type CheckboxVisualArchetype = (typeof checkboxVisualArchetypes)[number]

export interface CheckboxContract {
  defaultSize: CheckboxSize
  sizes: readonly CheckboxSize[]
  states: readonly CheckboxState[]
  slots: readonly CheckboxSlot[]
  visualArchetypes: readonly CheckboxVisualArchetype[]
}

export const checkboxContract = {
  defaultSize: 'md',
  sizes: checkboxSizes,
  states: checkboxStates,
  slots: checkboxSlots,
  visualArchetypes: checkboxVisualArchetypes,
} satisfies CheckboxContract
