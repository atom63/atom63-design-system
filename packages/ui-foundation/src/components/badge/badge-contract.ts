// Solid/surface + semantic sets are faithful to prod @atom63/ui badge.tsx.
// Palette hues back category/tag colors via the `--a63-badge-*` contract in
// @atom63/styles (which references foundation --color-* primitives).
export const badgeSolidVariants = [
  'default',
  'primary',
  'secondary',
  'destructive',
  'outline',
  'glass',
  'muted',
  'accent',
] as const
export const badgeSemanticVariants = ['error', 'info', 'success', 'warning'] as const
export const badgePaletteVariants = [
  'red',
  'orange',
  'amber',
  'yellow',
  'lime',
  'green',
  'emerald',
  'teal',
  'cyan',
  'sky',
  'blue',
  'indigo',
  'violet',
  'purple',
  'fuchsia',
  'pink',
  'rose',
  'neutral',
] as const
export const badgeVariants = [
  ...badgeSolidVariants,
  ...badgeSemanticVariants,
  ...badgePaletteVariants,
] as const
export const badgeSizes = ['sm', 'md', 'lg'] as const
export const badgeSlots = ['badge'] as const
export const badgeStates = ['resting', 'interactive', 'disabled', 'focus-visible'] as const
export const badgeVisualArchetypes = ['marker'] as const satisfies readonly VisualArchetypeId[]

export type BadgeVariant = (typeof badgeVariants)[number]
export type BadgeSize = (typeof badgeSizes)[number]
export type BadgeSlot = (typeof badgeSlots)[number]
export type BadgeState = (typeof badgeStates)[number]
export type BadgeVisualArchetype = (typeof badgeVisualArchetypes)[number]

export interface BadgeContract {
  defaultVariant: BadgeVariant
  defaultSize: BadgeSize
  variants: readonly BadgeVariant[]
  sizes: readonly BadgeSize[]
  slots: readonly BadgeSlot[]
  states: readonly BadgeState[]
  visualArchetypes: readonly BadgeVisualArchetype[]
}

export const badgeContract = {
  defaultVariant: 'default',
  defaultSize: 'md',
  variants: badgeVariants,
  sizes: badgeSizes,
  slots: badgeSlots,
  states: badgeStates,
  visualArchetypes: badgeVisualArchetypes,
} satisfies BadgeContract
import type { VisualArchetypeId } from '../../visual-archetypes'
