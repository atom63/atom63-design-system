import type { VisualArchetypeId } from '../../visual-archetypes'

export const menubarStates = ['closed', 'open', 'highlighted', 'disabled', 'selected'] as const
export const menubarSlots = [
  'menubar',
  'menubar-menu',
  'menubar-group',
  'menubar-portal',
  'menubar-trigger',
  'menubar-content',
  'menubar-item',
  'menubar-checkbox-item',
  'menubar-radio-group',
  'menubar-radio-item',
  'menubar-item-indicator',
  'menubar-label',
  'menubar-separator',
  'menubar-shortcut',
  'menubar-sub',
  'menubar-sub-trigger',
  'menubar-sub-content',
] as const
export const menubarVisualArchetypes = [
  'surface',
  'trigger',
  'menu',
  'overlay',
] as const satisfies readonly VisualArchetypeId[]

export type MenubarState = (typeof menubarStates)[number]
export type MenubarSlot = (typeof menubarSlots)[number]
export type MenubarVisualArchetype = (typeof menubarVisualArchetypes)[number]

export interface MenubarContract {
  slots: readonly MenubarSlot[]
  states: readonly MenubarState[]
  visualArchetypes: readonly MenubarVisualArchetype[]
}

export const menubarContract = {
  slots: menubarSlots,
  states: menubarStates,
  visualArchetypes: menubarVisualArchetypes,
} satisfies MenubarContract
