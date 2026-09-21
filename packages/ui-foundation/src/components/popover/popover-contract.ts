import type { VisualArchetypeId } from '../../visual-archetypes'

export const popoverStates = ['closed', 'open', 'starting', 'ending'] as const
export const popoverSlots = [
  'popover',
  'popover-trigger',
  'popover-anchor',
  'popover-portal',
  'popover-positioner',
  'popover-content',
  'popover-close',
  'popover-header',
  'popover-title',
  'popover-description',
] as const
export const popoverVisualArchetypes = [
  'trigger',
  'overlay',
  'surface',
  'action',
] as const satisfies readonly VisualArchetypeId[]

export type PopoverState = (typeof popoverStates)[number]
export type PopoverSlot = (typeof popoverSlots)[number]
export type PopoverVisualArchetype = (typeof popoverVisualArchetypes)[number]

export interface PopoverContract {
  slots: readonly PopoverSlot[]
  states: readonly PopoverState[]
  visualArchetypes: readonly PopoverVisualArchetype[]
}

export const popoverContract = {
  slots: popoverSlots,
  states: popoverStates,
  visualArchetypes: popoverVisualArchetypes,
} satisfies PopoverContract
