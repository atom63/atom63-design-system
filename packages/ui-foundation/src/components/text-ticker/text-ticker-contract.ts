import type { VisualArchetypeId } from '../../visual-archetypes'
export const textTickerVariants = ['truncate', 'marquee'] as const
export const textTickerStates = [
  'fits',
  'overflowing',
  'hover',
  'focus-within',
  'autoplay',
  'reduced-motion',
] as const
export const textTickerSlots = [
  'text-ticker',
  'text-ticker-content',
  'text-ticker-marquee',
] as const
export const textTickerVisualArchetypes = [] as const satisfies readonly VisualArchetypeId[]
export type TextTickerVariant = (typeof textTickerVariants)[number]
export type TextTickerState = (typeof textTickerStates)[number]
export type TextTickerSlot = (typeof textTickerSlots)[number]
export type TextTickerVisualArchetype = (typeof textTickerVisualArchetypes)[number]
export interface TextTickerContract {
  defaultVariant: TextTickerVariant
  variants: readonly TextTickerVariant[]
  states: readonly TextTickerState[]
  slots: readonly TextTickerSlot[]
  visualArchetypes: readonly TextTickerVisualArchetype[]
}
export const textTickerContract = {
  defaultVariant: 'truncate',
  variants: textTickerVariants,
  states: textTickerStates,
  slots: textTickerSlots,
  visualArchetypes: textTickerVisualArchetypes,
} satisfies TextTickerContract
