import type { VisualArchetypeId } from '../../visual-archetypes'

export const navigationMenuStates = [
  'closed',
  'open',
  'active',
  'disabled',
  'starting',
  'ending',
] as const
export const navigationMenuSlots = [
  'navigation-menu',
  'navigation-menu-list',
  'navigation-menu-item',
  'navigation-menu-trigger',
  'navigation-menu-content',
  'navigation-menu-portal',
  'navigation-menu-positioner',
  'navigation-menu-popup',
  'navigation-menu-viewport',
  'navigation-menu-link',
  'navigation-menu-indicator',
] as const
export const navigationMenuVisualArchetypes = [
  'trigger',
  'overlay',
  'surface',
] as const satisfies readonly VisualArchetypeId[]

export type NavigationMenuState = (typeof navigationMenuStates)[number]
export type NavigationMenuSlot = (typeof navigationMenuSlots)[number]
export type NavigationMenuVisualArchetype = (typeof navigationMenuVisualArchetypes)[number]

export interface NavigationMenuContract {
  slots: readonly NavigationMenuSlot[]
  states: readonly NavigationMenuState[]
  visualArchetypes: readonly NavigationMenuVisualArchetype[]
}

export const navigationMenuContract = {
  slots: navigationMenuSlots,
  states: navigationMenuStates,
  visualArchetypes: navigationMenuVisualArchetypes,
} satisfies NavigationMenuContract
