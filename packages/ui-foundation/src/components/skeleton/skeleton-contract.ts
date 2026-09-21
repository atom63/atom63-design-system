import type { VisualArchetypeId } from '../../visual-archetypes'

export const skeletonStates = ['loading', 'reduced-motion'] as const
export const skeletonSlots = ['skeleton'] as const
export const skeletonVisualArchetypes = [] as const satisfies readonly VisualArchetypeId[]
export type SkeletonState = (typeof skeletonStates)[number]
export type SkeletonSlot = (typeof skeletonSlots)[number]
export type SkeletonVisualArchetype = (typeof skeletonVisualArchetypes)[number]
export interface SkeletonContract {
  slots: readonly SkeletonSlot[]
  states: readonly SkeletonState[]
  visualArchetypes: readonly SkeletonVisualArchetype[]
}
export const skeletonContract = {
  slots: skeletonSlots,
  states: skeletonStates,
  visualArchetypes: skeletonVisualArchetypes,
} satisfies SkeletonContract
