import type { VisualArchetypeId } from '../../visual-archetypes'

// FeedbackState is a status pattern hosted by another surface. Its optional
// actions consume the action contract; the status media carries semantic tone.
export const feedbackStateKinds = [
  'empty',
  'error',
  'loading',
  'not-found',
  'no-results',
  'offline',
  'stale',
] as const
export const feedbackStateSizes = ['inline', 'panel', 'page', 'widget'] as const
export const feedbackStateSlots = [
  'feedback-state',
  'feedback-state-header',
  'feedback-state-media',
  'feedback-state-title',
  'feedback-state-description',
  'feedback-state-content',
] as const
export const feedbackStateStates = ['idle', 'busy', 'actionable'] as const
export const feedbackStateVisualArchetypes = [
  'action',
] as const satisfies readonly VisualArchetypeId[]

export type FeedbackStateKind = (typeof feedbackStateKinds)[number]
export type FeedbackStateSize = (typeof feedbackStateSizes)[number]
export type FeedbackStateSlot = (typeof feedbackStateSlots)[number]
export type FeedbackStateState = (typeof feedbackStateStates)[number]
export type FeedbackStateVisualArchetype = (typeof feedbackStateVisualArchetypes)[number]

export interface FeedbackStateContract {
  defaultKind: FeedbackStateKind
  defaultSize: FeedbackStateSize
  kinds: readonly FeedbackStateKind[]
  sizes: readonly FeedbackStateSize[]
  slots: readonly FeedbackStateSlot[]
  states: readonly FeedbackStateState[]
  visualArchetypes: readonly FeedbackStateVisualArchetype[]
}

export const feedbackStateContract = {
  defaultKind: 'empty',
  defaultSize: 'panel',
  kinds: feedbackStateKinds,
  sizes: feedbackStateSizes,
  slots: feedbackStateSlots,
  states: feedbackStateStates,
  visualArchetypes: feedbackStateVisualArchetypes,
} satisfies FeedbackStateContract
