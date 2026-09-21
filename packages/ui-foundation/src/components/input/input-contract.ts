import type { VisualArchetypeId } from '../../visual-archetypes'

export const inputSizes = ['sm', 'md', 'lg'] as const
export const inputStates = ['rest', 'hover', 'focus', 'disabled', 'invalid'] as const
/* Two-part anatomy (mirrors Base UI / production @atom63/ui input): a control
   wrapper owns the chrome, the inner input is the transparent text field. */
export const inputSlots = ['input-control', 'input'] as const
export const inputTokenSlots = [
  'field.background',
  'field.border',
  'field.radius',
  'field.shadow',
  'field.focusRing',
  'field.focusBorder',
  'field.height',
  'field.paddingInline',
  'field.fontSize',
] as const
export const inputVisualArchetypes = ['field'] as const satisfies readonly VisualArchetypeId[]

/* Composable group: the group owns the shared field chrome; addons align to
   either inline edge or stack above/below a multiline field. */
export const inputGroupSlots = [
  'input-group',
  'input-group-addon',
  'input-group-button',
  'input-group-text',
] as const
export const inputGroupAligns = ['inline-start', 'inline-end', 'block-start', 'block-end'] as const
export const inputGroupVisualArchetypes = ['field'] as const satisfies readonly VisualArchetypeId[]

export type InputSize = (typeof inputSizes)[number]
export type InputState = (typeof inputStates)[number]
export type InputSlot = (typeof inputSlots)[number]
export type InputTokenSlot = (typeof inputTokenSlots)[number]
export type InputVisualArchetype = (typeof inputVisualArchetypes)[number]
export type InputGroupSlot = (typeof inputGroupSlots)[number]
export type InputGroupAlign = (typeof inputGroupAligns)[number]
export type InputGroupVisualArchetype = (typeof inputGroupVisualArchetypes)[number]

export interface InputContract {
  defaultSize: InputSize
  slots: readonly InputSlot[]
  states: readonly InputState[]
  tokenSlots: readonly InputTokenSlot[]
  sizes: readonly InputSize[]
  visualArchetypes: readonly InputVisualArchetype[]
}

export const inputContract = {
  defaultSize: 'md',
  slots: inputSlots,
  states: inputStates,
  tokenSlots: inputTokenSlots,
  sizes: inputSizes,
  visualArchetypes: inputVisualArchetypes,
} satisfies InputContract

export interface InputGroupContract {
  aligns: readonly InputGroupAlign[]
  slots: readonly InputGroupSlot[]
  visualArchetypes: readonly InputGroupVisualArchetype[]
}

export const inputGroupContract = {
  aligns: inputGroupAligns,
  slots: inputGroupSlots,
  visualArchetypes: inputGroupVisualArchetypes,
} satisfies InputGroupContract
