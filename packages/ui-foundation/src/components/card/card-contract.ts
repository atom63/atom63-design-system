export const cardVariants = ['default', 'ghost', 'interactive', 'overlay'] as const
export const cardPaddings = ['none', 'sm', 'md', 'lg'] as const
export const cardContentPaddings = ['none', 'xs', 'sm', 'md', 'lg'] as const
export const cardLineClamps = [1, 2, 3] as const

export const cardSlots = [
  'card',
  'card-header',
  'card-label',
  'card-media',
  'card-media-overlay',
  'card-media-overlay-image',
  'card-media-overlay-scrim',
  'card-media-overlay-top-right',
  'card-media-overlay-bottom',
  'card-media-overlay-icon-button',
  'card-content',
  'card-title',
  'card-description',
  'card-tags',
  'card-footer',
  'card-action',
  'card-cursor-label',
] as const
export const cardStates = [
  'rest',
  'hover',
  'focus-visible',
  'interactive',
  'cursor-active',
] as const
export const cardVisualArchetypes = ['surface'] as const

export type CardVariant = (typeof cardVariants)[number]
export type CardPadding = (typeof cardPaddings)[number]
export type CardContentPadding = (typeof cardContentPaddings)[number]
export type CardLineClamp = (typeof cardLineClamps)[number]
export type CardSlot = (typeof cardSlots)[number]
export type CardState = (typeof cardStates)[number]
export type CardVisualArchetype = (typeof cardVisualArchetypes)[number]

export interface CardContract {
  defaultVariant: CardVariant
  variants: readonly CardVariant[]
  paddings: readonly CardPadding[]
  contentPaddings: readonly CardContentPadding[]
  lineClamps: readonly CardLineClamp[]
  slots: readonly CardSlot[]
  states: readonly CardState[]
  visualArchetypes: readonly CardVisualArchetype[]
}

export const cardContract = {
  defaultVariant: 'default',
  variants: cardVariants,
  paddings: cardPaddings,
  contentPaddings: cardContentPaddings,
  lineClamps: cardLineClamps,
  slots: cardSlots,
  states: cardStates,
  visualArchetypes: cardVisualArchetypes,
} satisfies CardContract
