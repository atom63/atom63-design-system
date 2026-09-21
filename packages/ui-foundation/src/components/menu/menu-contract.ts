import type { VisualArchetypeId } from '../../visual-archetypes'

export const menuTones = ['neutral', 'primary'] as const
export const menuItemVariants = ['default', 'destructive'] as const
export const menuStates = ['rest', 'highlighted', 'disabled', 'selected', 'submenu-open'] as const
export const menuSlots = [
  'menu-positioner',
  'menu-popup',
  'menu-item',
  'menu-item-indicator',
  'menu-sub-trigger',
  'menu-label',
  'menu-separator',
  'menu-shortcut',
] as const
export const menuVisualArchetypes = [
  'menu',
  'overlay',
] as const satisfies readonly VisualArchetypeId[]

export type MenuTone = (typeof menuTones)[number]
export type MenuItemVariant = (typeof menuItemVariants)[number]
export type MenuState = (typeof menuStates)[number]
export type MenuSlot = (typeof menuSlots)[number]
export type MenuVisualArchetype = (typeof menuVisualArchetypes)[number]

export interface MenuContract {
  defaultItemVariant: MenuItemVariant
  defaultTone: MenuTone
  itemVariants: readonly MenuItemVariant[]
  slots: readonly MenuSlot[]
  states: readonly MenuState[]
  tones: readonly MenuTone[]
  visualArchetypes: readonly MenuVisualArchetype[]
}

export const menuContract = {
  defaultItemVariant: 'default',
  defaultTone: 'neutral',
  itemVariants: menuItemVariants,
  slots: menuSlots,
  states: menuStates,
  tones: menuTones,
  visualArchetypes: menuVisualArchetypes,
} satisfies MenuContract
