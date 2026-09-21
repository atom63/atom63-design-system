import type { VisualArchetypeId } from '../../visual-archetypes'

export const loadMoreTriggerVariants = ['default', 'minimal', 'prominent'] as const
export const loadMoreTriggerStates = [
  'idle',
  'loading',
  'failed',
  'exhausted',
  'hidden',
  'custom',
] as const
export const loadMoreTriggerSlots = [
  'load-more-trigger',
  'load-more-trigger-message',
  'load-more-trigger-icon',
  'load-more-trigger-spinner',
  'load-more-trigger-action',
] as const
export const loadMoreTriggerVisualArchetypes = [
  'surface',
  'action',
] as const satisfies readonly VisualArchetypeId[]

export type LoadMoreTriggerVariant = (typeof loadMoreTriggerVariants)[number]
export type LoadMoreTriggerState = (typeof loadMoreTriggerStates)[number]
export type LoadMoreTriggerSlot = (typeof loadMoreTriggerSlots)[number]
export type LoadMoreTriggerVisualArchetype = (typeof loadMoreTriggerVisualArchetypes)[number]

export interface LoadMoreTriggerContract {
  defaultVariant: LoadMoreTriggerVariant
  slots: readonly LoadMoreTriggerSlot[]
  states: readonly LoadMoreTriggerState[]
  variants: readonly LoadMoreTriggerVariant[]
  visualArchetypes: readonly LoadMoreTriggerVisualArchetype[]
}

export const loadMoreTriggerContract = {
  defaultVariant: 'default',
  slots: loadMoreTriggerSlots,
  states: loadMoreTriggerStates,
  variants: loadMoreTriggerVariants,
  visualArchetypes: loadMoreTriggerVisualArchetypes,
} satisfies LoadMoreTriggerContract
