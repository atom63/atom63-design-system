import type { VisualArchetypeId } from '../../visual-archetypes'

export const dropdownMenuItemVariants = ['default', 'destructive'] as const
export const dropdownMenuStates = [
  'closed',
  'open',
  'highlighted',
  'disabled',
  'checked',
  'unchecked',
  'submenu-open',
  'destructive',
] as const
export const dropdownMenuSlots = [
  'dropdown-menu',
  'dropdown-menu-trigger',
  'dropdown-menu-group',
  'dropdown-menu-portal',
  'dropdown-menu-positioner',
  'dropdown-menu-content',
  'dropdown-menu-item',
  'dropdown-menu-checkbox-item',
  'dropdown-menu-radio-group',
  'dropdown-menu-radio-item',
  'dropdown-menu-item-indicator',
  'dropdown-menu-label',
  'dropdown-menu-separator',
  'dropdown-menu-shortcut',
  'dropdown-menu-sub',
  'dropdown-menu-sub-trigger',
  'dropdown-menu-sub-positioner',
  'dropdown-menu-sub-content',
] as const
export const dropdownMenuVisualArchetypes = [
  'menu',
  'overlay',
  'trigger',
  'action',
  'choice',
] as const satisfies readonly VisualArchetypeId[]

export type DropdownMenuItemVariant = (typeof dropdownMenuItemVariants)[number]
export type DropdownMenuState = (typeof dropdownMenuStates)[number]
export type DropdownMenuSlot = (typeof dropdownMenuSlots)[number]
export type DropdownMenuVisualArchetype = (typeof dropdownMenuVisualArchetypes)[number]

export interface DropdownMenuContract {
  defaultItemVariant: DropdownMenuItemVariant
  itemVariants: readonly DropdownMenuItemVariant[]
  slots: readonly DropdownMenuSlot[]
  states: readonly DropdownMenuState[]
  visualArchetypes: readonly DropdownMenuVisualArchetype[]
}

export const dropdownMenuContract = {
  defaultItemVariant: 'default',
  itemVariants: dropdownMenuItemVariants,
  slots: dropdownMenuSlots,
  states: dropdownMenuStates,
  visualArchetypes: dropdownMenuVisualArchetypes,
} satisfies DropdownMenuContract
