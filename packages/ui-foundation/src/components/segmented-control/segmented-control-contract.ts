export const segmentedControlSizes = ['sm', 'md', 'lg'] as const
export const segmentedControlVariants = ['icon', 'label'] as const
export const segmentedControlTones = ['neutral', 'accent'] as const
export const segmentedControlStates = [
  'rest',
  'hover',
  'selected',
  'disabled',
  'focus-visible',
] as const
export const segmentedControlSlots = [
  'segmented-control',
  'segmented-control-track',
  'segmented-control-item',
  'segmented-control-icon',
  'segmented-control-label',
  'segmented-control-indicator',
] as const
export const segmentedControlVisualArchetypes = [
  'segment',
] as const satisfies readonly VisualArchetypeId[]

export type SegmentedControlSize = (typeof segmentedControlSizes)[number]
export type SegmentedControlVariant = (typeof segmentedControlVariants)[number]
export type SegmentedControlTone = (typeof segmentedControlTones)[number]
export type SegmentedControlState = (typeof segmentedControlStates)[number]
export type SegmentedControlSlot = (typeof segmentedControlSlots)[number]
export type SegmentedControlVisualArchetype = (typeof segmentedControlVisualArchetypes)[number]

export interface SegmentedControlContract {
  defaultSize: SegmentedControlSize
  defaultTone: SegmentedControlTone
  defaultVariant: SegmentedControlVariant
  sizes: readonly SegmentedControlSize[]
  slots: readonly SegmentedControlSlot[]
  states: readonly SegmentedControlState[]
  tones: readonly SegmentedControlTone[]
  variants: readonly SegmentedControlVariant[]
  visualArchetypes: readonly SegmentedControlVisualArchetype[]
}

export const segmentedControlContract = {
  defaultSize: 'md',
  defaultTone: 'neutral',
  defaultVariant: 'label',
  sizes: segmentedControlSizes,
  slots: segmentedControlSlots,
  states: segmentedControlStates,
  tones: segmentedControlTones,
  variants: segmentedControlVariants,
  visualArchetypes: segmentedControlVisualArchetypes,
} satisfies SegmentedControlContract
import type { VisualArchetypeId } from '../../visual-archetypes'
