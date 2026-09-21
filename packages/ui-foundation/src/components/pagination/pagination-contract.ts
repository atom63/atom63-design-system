import { type ButtonSize, buttonSizes } from '../button/button-contract'
import type { VisualArchetypeId } from '../../visual-archetypes'

export const paginationStates = ['rest', 'current'] as const
export const paginationSlots = [
  'pagination',
  'pagination-content',
  'pagination-item',
  'pagination-link',
  'pagination-ellipsis',
] as const
export const paginationVisualArchetypes = ['action'] as const satisfies readonly VisualArchetypeId[]

export type PaginationState = (typeof paginationStates)[number]
export type PaginationSlot = (typeof paginationSlots)[number]
export type PaginationVisualArchetype = (typeof paginationVisualArchetypes)[number]

export interface PaginationContract {
  defaultLinkSize: ButtonSize
  linkSizes: readonly ButtonSize[]
  slots: readonly PaginationSlot[]
  states: readonly PaginationState[]
  visualArchetypes: readonly PaginationVisualArchetype[]
}

export const paginationContract = {
  defaultLinkSize: 'icon',
  linkSizes: buttonSizes,
  slots: paginationSlots,
  states: paginationStates,
  visualArchetypes: paginationVisualArchetypes,
} satisfies PaginationContract
