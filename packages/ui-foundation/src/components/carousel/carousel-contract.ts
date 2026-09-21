export const carouselOrientations = ['horizontal', 'vertical'] as const

export const carouselSlots = [
  'carousel',
  'carousel-content',
  'carousel-item',
  'carousel-previous',
  'carousel-next',
  'carousel-cursor',
] as const

export const carouselStates = [
  'rest',
  'hover',
  'focus-visible',
  'disabled',
  'cursor-active',
  'can-scroll',
] as const

export const carouselVisualArchetypes = ['surface', 'overlay', 'action'] as const

export type CarouselOrientation = (typeof carouselOrientations)[number]
export type CarouselSlot = (typeof carouselSlots)[number]
export type CarouselState = (typeof carouselStates)[number]
export type CarouselVisualArchetype = (typeof carouselVisualArchetypes)[number]

export interface CarouselContract {
  defaultOrientation: CarouselOrientation
  orientations: readonly CarouselOrientation[]
  slots: readonly CarouselSlot[]
  states: readonly CarouselState[]
  visualArchetypes: readonly CarouselVisualArchetype[]
}

export const carouselContract = {
  defaultOrientation: 'horizontal',
  orientations: carouselOrientations,
  slots: carouselSlots,
  states: carouselStates,
  visualArchetypes: carouselVisualArchetypes,
} satisfies CarouselContract
