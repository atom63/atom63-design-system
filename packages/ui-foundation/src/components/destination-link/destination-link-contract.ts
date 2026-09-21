import type { VisualArchetypeId } from '../../visual-archetypes'

export const destinationKinds = ['internal', 'external'] as const
export const destinationLinkStates = ['rest', 'focus-visible'] as const
export const destinationLinkSlots = ['destination-link', 'destination-indicator'] as const
export const destinationLinkVisualArchetypes = [
  'action',
] as const satisfies readonly VisualArchetypeId[]

export type DestinationKind = (typeof destinationKinds)[number]
export type DestinationLinkState = (typeof destinationLinkStates)[number]
export type DestinationLinkSlot = (typeof destinationLinkSlots)[number]
export type DestinationLinkVisualArchetype = (typeof destinationLinkVisualArchetypes)[number]

export interface DestinationLinkContract {
  kinds: readonly DestinationKind[]
  slots: readonly DestinationLinkSlot[]
  states: readonly DestinationLinkState[]
  visualArchetypes: readonly DestinationLinkVisualArchetype[]
}

export const destinationLinkContract = {
  kinds: destinationKinds,
  slots: destinationLinkSlots,
  states: destinationLinkStates,
  visualArchetypes: destinationLinkVisualArchetypes,
} satisfies DestinationLinkContract
