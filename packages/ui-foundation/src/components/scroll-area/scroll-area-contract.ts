import type { VisualArchetypeId } from '../../visual-archetypes'

export const scrollAreaOrientations = ['vertical', 'horizontal', 'both'] as const
export const scrollAreaOptions = ['scroll-fade', 'scrollbar-gutter', 'show-on-hover'] as const
export const scrollAreaStates = ['idle', 'hovering', 'scrolling', 'focus-visible'] as const
export const scrollAreaSlots = [
  'scroll-area',
  'scroll-area-viewport',
  'scroll-area-scrollbar',
  'scroll-area-thumb',
  'scroll-area-corner',
] as const
export const scrollAreaVisualArchetypes = ['range'] as const satisfies readonly VisualArchetypeId[]

export type ScrollAreaOrientation = (typeof scrollAreaOrientations)[number]
export type ScrollAreaOption = (typeof scrollAreaOptions)[number]
export type ScrollAreaState = (typeof scrollAreaStates)[number]
export type ScrollAreaSlot = (typeof scrollAreaSlots)[number]
export type ScrollAreaVisualArchetype = (typeof scrollAreaVisualArchetypes)[number]

export interface ScrollAreaContract {
  defaultOrientation: ScrollAreaOrientation
  orientations: readonly ScrollAreaOrientation[]
  options: readonly ScrollAreaOption[]
  states: readonly ScrollAreaState[]
  slots: readonly ScrollAreaSlot[]
  visualArchetypes: readonly ScrollAreaVisualArchetype[]
}

export const scrollAreaContract = {
  defaultOrientation: 'both',
  orientations: scrollAreaOrientations,
  options: scrollAreaOptions,
  states: scrollAreaStates,
  slots: scrollAreaSlots,
  visualArchetypes: scrollAreaVisualArchetypes,
} satisfies ScrollAreaContract
