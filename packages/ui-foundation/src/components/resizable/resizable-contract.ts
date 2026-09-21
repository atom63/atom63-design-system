import type { VisualArchetypeId } from '../../visual-archetypes'

export const resizableOrientations = ['horizontal', 'vertical'] as const
export const resizableVariants = ['line', 'grip'] as const
export const resizableStates = ['idle', 'hover', 'focus-visible', 'dragging', 'disabled'] as const
export const resizableSlots = [
  'resizable-panel-group',
  'resizable-panel',
  'resizable-handle',
  'resizable-handle-grip',
] as const
export const resizableVisualArchetypes = [] as const satisfies readonly VisualArchetypeId[]

export type ResizableOrientation = (typeof resizableOrientations)[number]
export type ResizableVariant = (typeof resizableVariants)[number]
export type ResizableState = (typeof resizableStates)[number]
export type ResizableSlot = (typeof resizableSlots)[number]
export type ResizableVisualArchetype = (typeof resizableVisualArchetypes)[number]

export interface ResizableContract {
  defaultOrientation: ResizableOrientation
  orientations: readonly ResizableOrientation[]
  variants: readonly ResizableVariant[]
  states: readonly ResizableState[]
  slots: readonly ResizableSlot[]
  visualArchetypes: readonly ResizableVisualArchetype[]
}

export const resizableContract = {
  defaultOrientation: 'horizontal',
  orientations: resizableOrientations,
  variants: resizableVariants,
  states: resizableStates,
  slots: resizableSlots,
  visualArchetypes: resizableVisualArchetypes,
} satisfies ResizableContract
