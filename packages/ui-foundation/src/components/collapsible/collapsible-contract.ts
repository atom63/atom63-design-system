import type { VisualArchetypeId } from '../../visual-archetypes'

export const collapsibleStates = ['closed', 'open', 'starting', 'ending', 'disabled'] as const
export const collapsibleSlots = [
  'collapsible',
  'collapsible-trigger',
  'collapsible-indicator',
  'collapsible-content',
] as const
export const collapsibleVisualArchetypes = [
  'trigger',
] as const satisfies readonly VisualArchetypeId[]

export type CollapsibleState = (typeof collapsibleStates)[number]
export type CollapsibleSlot = (typeof collapsibleSlots)[number]
export type CollapsibleVisualArchetype = (typeof collapsibleVisualArchetypes)[number]

export interface CollapsibleContract {
  slots: readonly CollapsibleSlot[]
  states: readonly CollapsibleState[]
  visualArchetypes: readonly CollapsibleVisualArchetype[]
}

export const collapsibleContract = {
  slots: collapsibleSlots,
  states: collapsibleStates,
  visualArchetypes: collapsibleVisualArchetypes,
} satisfies CollapsibleContract
