import type { VisualArchetypeId } from '../../visual-archetypes'

export const drawerDirections = ['top', 'bottom', 'left', 'right'] as const
export const drawerFooterVariants = ['default', 'bare'] as const
export const drawerStates = ['closed', 'open', 'dragging', 'snapped'] as const
export const drawerSlots = [
  'drawer',
  'drawer-trigger',
  'drawer-portal',
  'drawer-overlay',
  'drawer-content',
  'drawer-handle',
  'drawer-header',
  'drawer-title',
  'drawer-description',
  'drawer-body',
  'drawer-footer',
  'drawer-close',
] as const
export const drawerVisualArchetypes = [
  'overlay',
  'surface',
  'trigger',
  'action',
] as const satisfies readonly VisualArchetypeId[]

export type DrawerDirection = (typeof drawerDirections)[number]
export type DrawerFooterVariant = (typeof drawerFooterVariants)[number]
export type DrawerState = (typeof drawerStates)[number]
export type DrawerSlot = (typeof drawerSlots)[number]
export type DrawerVisualArchetype = (typeof drawerVisualArchetypes)[number]

export interface DrawerContract {
  defaultDirection: DrawerDirection
  defaultFooterVariant: DrawerFooterVariant
  directions: readonly DrawerDirection[]
  footerVariants: readonly DrawerFooterVariant[]
  slots: readonly DrawerSlot[]
  states: readonly DrawerState[]
  visualArchetypes: readonly DrawerVisualArchetype[]
}

export const drawerContract = {
  defaultDirection: 'bottom',
  defaultFooterVariant: 'default',
  directions: drawerDirections,
  footerVariants: drawerFooterVariants,
  slots: drawerSlots,
  states: drawerStates,
  visualArchetypes: drawerVisualArchetypes,
} satisfies DrawerContract
