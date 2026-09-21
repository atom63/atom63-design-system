import type { VisualArchetypeId } from '../../visual-archetypes'

export const scrollableListLayouts = ['scroll', 'wrap'] as const
export const scrollableListOptions = ['mask', 'chevrons', 'draggable', 'column-aligned'] as const
export const scrollableListStates = [
  'idle',
  'can-scroll-start',
  'can-scroll-end',
  'dragging',
  'disabled',
] as const
export const scrollableListSlots = [
  'scrollable-list',
  'scrollable-list-frame',
  'scrollable-list-content',
  'scrollable-list-control',
] as const
export const scrollableListVisualArchetypes = [
  'action',
  'range',
] as const satisfies readonly VisualArchetypeId[]

export type ScrollableListLayout = (typeof scrollableListLayouts)[number]
export type ScrollableListOption = (typeof scrollableListOptions)[number]
export type ScrollableListState = (typeof scrollableListStates)[number]
export type ScrollableListSlot = (typeof scrollableListSlots)[number]
export type ScrollableListVisualArchetype = (typeof scrollableListVisualArchetypes)[number]

export interface ScrollableListContract {
  defaultLayout: ScrollableListLayout
  layouts: readonly ScrollableListLayout[]
  options: readonly ScrollableListOption[]
  states: readonly ScrollableListState[]
  slots: readonly ScrollableListSlot[]
  visualArchetypes: readonly ScrollableListVisualArchetype[]
}

export const scrollableListContract = {
  defaultLayout: 'scroll',
  layouts: scrollableListLayouts,
  options: scrollableListOptions,
  states: scrollableListStates,
  slots: scrollableListSlots,
  visualArchetypes: scrollableListVisualArchetypes,
} satisfies ScrollableListContract
