import type { VisualArchetypeId } from '../../visual-archetypes'

export const hoverCardStates = ['closed', 'open', 'starting', 'ending'] as const
export const hoverCardSlots = [
  'hover-card',
  'hover-card-trigger',
  'hover-card-portal',
  'hover-card-positioner',
  'hover-card-content',
] as const
export const hoverCardVisualArchetypes = [
  'overlay',
  'surface',
  'trigger',
] as const satisfies readonly VisualArchetypeId[]

export type HoverCardState = (typeof hoverCardStates)[number]
export type HoverCardSlot = (typeof hoverCardSlots)[number]
export type HoverCardVisualArchetype = (typeof hoverCardVisualArchetypes)[number]

export interface HoverCardContract {
  slots: readonly HoverCardSlot[]
  states: readonly HoverCardState[]
  visualArchetypes: readonly HoverCardVisualArchetype[]
}

export const hoverCardContract = {
  slots: hoverCardSlots,
  states: hoverCardStates,
  visualArchetypes: hoverCardVisualArchetypes,
} satisfies HoverCardContract
