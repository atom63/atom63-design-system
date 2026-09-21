import type { VisualArchetypeId } from '../../visual-archetypes'

export const tooltipSides = ['top', 'right', 'bottom', 'left'] as const
export const tooltipAlignments = ['start', 'center', 'end'] as const
export const tooltipStates = ['closed', 'open', 'starting', 'ending', 'instant'] as const
export const tooltipSlots = [
  'tooltip-trigger',
  'tooltip-positioner',
  'tooltip-popup',
  'tooltip-viewport',
] as const
export const tooltipTokenSlots = [
  'overlay.background',
  'overlay.border',
  'overlay.radius',
  'overlay.gloss',
  'overlay.texture',
  'overlay.backdrop',
  'overlay.shadow',
  'overlay.innerShadow',
] as const
export const tooltipVisualArchetypes = ['overlay'] as const satisfies readonly VisualArchetypeId[]

export type TooltipSide = (typeof tooltipSides)[number]
export type TooltipAlignment = (typeof tooltipAlignments)[number]
export type TooltipState = (typeof tooltipStates)[number]
export type TooltipSlot = (typeof tooltipSlots)[number]
export type TooltipTokenSlot = (typeof tooltipTokenSlots)[number]
export type TooltipVisualArchetype = (typeof tooltipVisualArchetypes)[number]

export interface TooltipContract {
  alignments: readonly TooltipAlignment[]
  defaultAlignment: TooltipAlignment
  defaultSide: TooltipSide
  sides: readonly TooltipSide[]
  slots: readonly TooltipSlot[]
  states: readonly TooltipState[]
  tokenSlots: readonly TooltipTokenSlot[]
  visualArchetypes: readonly TooltipVisualArchetype[]
}

export const tooltipContract = {
  alignments: tooltipAlignments,
  defaultAlignment: 'center',
  defaultSide: 'top',
  sides: tooltipSides,
  slots: tooltipSlots,
  states: tooltipStates,
  tokenSlots: tooltipTokenSlots,
  visualArchetypes: tooltipVisualArchetypes,
} satisfies TooltipContract
