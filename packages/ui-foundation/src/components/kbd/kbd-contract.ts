import type { VisualArchetypeId } from '../../visual-archetypes'

export const kbdSizes = ['sm', 'md'] as const
export const kbdSlots = ['kbd', 'kbd-group'] as const
export const kbdStates = ['rest'] as const
export const kbdVisualArchetypes = ['marker'] as const satisfies readonly VisualArchetypeId[]

export type KbdSize = (typeof kbdSizes)[number]
export type KbdSlot = (typeof kbdSlots)[number]
export type KbdState = (typeof kbdStates)[number]
export type KbdVisualArchetype = (typeof kbdVisualArchetypes)[number]

export interface KbdContract {
  defaultSize: KbdSize
  sizes: readonly KbdSize[]
  slots: readonly KbdSlot[]
  states: readonly KbdState[]
  visualArchetypes: readonly KbdVisualArchetype[]
}

export const kbdContract = {
  defaultSize: 'md',
  sizes: kbdSizes,
  slots: kbdSlots,
  states: kbdStates,
  visualArchetypes: kbdVisualArchetypes,
} satisfies KbdContract
