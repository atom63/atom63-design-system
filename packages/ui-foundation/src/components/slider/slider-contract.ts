import type { VisualArchetypeId } from '../../visual-archetypes'

export const sliderOrientations = ['horizontal', 'vertical'] as const
export const sliderModes = ['single', 'range'] as const
export const sliderStates = ['rest', 'focus-visible', 'dragging', 'disabled'] as const
export const sliderSlots = [
  'slider',
  'slider-value',
  'slider-control',
  'slider-track',
  'slider-indicator',
  'slider-thumb',
] as const
export const sliderVisualArchetypes = ['range'] as const satisfies readonly VisualArchetypeId[]
export type SliderOrientation = (typeof sliderOrientations)[number]
export type SliderMode = (typeof sliderModes)[number]
export type SliderState = (typeof sliderStates)[number]
export type SliderSlot = (typeof sliderSlots)[number]
export type SliderVisualArchetype = (typeof sliderVisualArchetypes)[number]
export interface SliderContract {
  defaultOrientation: SliderOrientation
  orientations: readonly SliderOrientation[]
  modes: readonly SliderMode[]
  states: readonly SliderState[]
  slots: readonly SliderSlot[]
  visualArchetypes: readonly SliderVisualArchetype[]
}
export const sliderContract = {
  defaultOrientation: 'horizontal',
  orientations: sliderOrientations,
  modes: sliderModes,
  states: sliderStates,
  slots: sliderSlots,
  visualArchetypes: sliderVisualArchetypes,
} satisfies SliderContract
