// Faithful to prod @atom63/ui item: the Item container has variant
// (default/outline/muted) + size (default/sm/xs); ItemMedia has its own variant
// (default/icon/image). The DS recipe reads these off data-variant / data-size.
export const itemVariants = ['default', 'outline', 'muted'] as const
export const itemSizes = ['default', 'sm', 'xs'] as const
export const itemMediaVariants = ['default', 'icon', 'image'] as const
export const itemSlots = [
  'item-group',
  'item',
  'item-media',
  'item-content',
  'item-title',
  'item-description',
  'item-actions',
  'item-header',
  'item-footer',
  'item-separator',
] as const
export const itemStates = ['rest', 'hover', 'focus'] as const
export const itemVisualArchetypes = ['surface'] as const satisfies readonly VisualArchetypeId[]

export type ItemVariant = (typeof itemVariants)[number]
export type ItemSize = (typeof itemSizes)[number]
export type ItemMediaVariant = (typeof itemMediaVariants)[number]
export type ItemSlot = (typeof itemSlots)[number]
export type ItemState = (typeof itemStates)[number]
export type ItemVisualArchetype = (typeof itemVisualArchetypes)[number]

export interface ItemContract {
  defaultVariant: ItemVariant
  defaultSize: ItemSize
  defaultMediaVariant: ItemMediaVariant
  variants: readonly ItemVariant[]
  sizes: readonly ItemSize[]
  mediaVariants: readonly ItemMediaVariant[]
  slots: readonly ItemSlot[]
  states: readonly ItemState[]
  visualArchetypes: readonly ItemVisualArchetype[]
}

export const itemContract = {
  defaultVariant: 'default',
  defaultSize: 'default',
  defaultMediaVariant: 'default',
  variants: itemVariants,
  sizes: itemSizes,
  mediaVariants: itemMediaVariants,
  slots: itemSlots,
  states: itemStates,
  visualArchetypes: itemVisualArchetypes,
} satisfies ItemContract
import type { VisualArchetypeId } from '../../visual-archetypes'
