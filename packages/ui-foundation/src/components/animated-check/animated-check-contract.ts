export const animatedCheckVariants = ['animated', 'static'] as const
export const animatedCheckStates = ['mounting', 'drawn', 'reduced-motion'] as const
export const animatedCheckSlots = ['animated-check', 'animated-check-path'] as const
export const animatedCheckVisualArchetypes = [] as const

export type AnimatedCheckVariant = (typeof animatedCheckVariants)[number]
export type AnimatedCheckState = (typeof animatedCheckStates)[number]
export type AnimatedCheckSlot = (typeof animatedCheckSlots)[number]
export type AnimatedCheckVisualArchetype = (typeof animatedCheckVisualArchetypes)[number]

export interface AnimatedCheckContract {
  defaultVariant: AnimatedCheckVariant
  slots: readonly AnimatedCheckSlot[]
  states: readonly AnimatedCheckState[]
  variants: readonly AnimatedCheckVariant[]
  visualArchetypes: readonly AnimatedCheckVisualArchetype[]
}

export const animatedCheckContract = {
  defaultVariant: 'animated',
  slots: animatedCheckSlots,
  states: animatedCheckStates,
  variants: animatedCheckVariants,
  visualArchetypes: animatedCheckVisualArchetypes,
} satisfies AnimatedCheckContract
