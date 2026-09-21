import type { VisualArchetypeId } from '../../visual-archetypes'

export const toasterStates = ['visible', 'dismissing', 'reduced-motion'] as const
export const toasterTones = ['default', 'info', 'success', 'warning', 'error', 'loading'] as const
export const toasterSlots = ['toaster', 'toast', 'toast-icon', 'toast-message'] as const
export const toasterVisualArchetypes = ['surface'] as const satisfies readonly VisualArchetypeId[]

export type ToasterState = (typeof toasterStates)[number]
export type ToasterTone = (typeof toasterTones)[number]
export type ToasterSlot = (typeof toasterSlots)[number]
export type ToasterVisualArchetype = (typeof toasterVisualArchetypes)[number]

export interface ToasterContract {
  slots: readonly ToasterSlot[]
  states: readonly ToasterState[]
  tones: readonly ToasterTone[]
  visualArchetypes: readonly ToasterVisualArchetype[]
}

export const toasterContract = {
  slots: toasterSlots,
  states: toasterStates,
  tones: toasterTones,
  visualArchetypes: toasterVisualArchetypes,
} satisfies ToasterContract
