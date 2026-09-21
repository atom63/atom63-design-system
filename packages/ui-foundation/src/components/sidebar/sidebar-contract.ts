// Faithful to prod @atom63/ui sidebar.tsx: the Sidebar has three variant unions
// (side / variant / collapsible) plus the two menu-button ramps (variant + size)
// and the sub-button size ramp. The many structural parts each get a data-slot;
// these are enumerated as the contract's slots so consumers can target them.
export const sidebarSides = ['left', 'right'] as const
export const sidebarVariants = ['sidebar', 'floating', 'inset'] as const
export const sidebarCollapsibles = ['offcanvas', 'icon', 'none'] as const

export const sidebarMenuButtonVariants = ['default', 'outline'] as const
export const sidebarMenuButtonSizes = ['default', 'sm', 'lg'] as const
export const sidebarMenuSubButtonSizes = ['sm', 'md'] as const

export const sidebarStates = ['expanded', 'collapsed'] as const

export const sidebarSlots = [
  'sidebar-wrapper',
  'sidebar',
  'sidebar-gap',
  'sidebar-container',
  'sidebar-inner',
  'sidebar-trigger',
  'sidebar-rail',
  'sidebar-inset',
  'sidebar-input',
  'sidebar-header',
  'sidebar-footer',
  'sidebar-separator',
  'sidebar-content',
  'sidebar-group',
  'sidebar-group-label',
  'sidebar-group-action',
  'sidebar-group-content',
  'sidebar-menu',
  'sidebar-menu-item',
  'sidebar-menu-button',
  'sidebar-menu-action',
  'sidebar-menu-badge',
  'sidebar-menu-skeleton',
  'sidebar-menu-sub',
  'sidebar-menu-sub-item',
  'sidebar-menu-sub-button',
] as const
export const sidebarVisualArchetypes = [
  'surface',
  'action',
  'field',
  'trigger',
] as const satisfies readonly VisualArchetypeId[]

export type SidebarSide = (typeof sidebarSides)[number]
export type SidebarVariant = (typeof sidebarVariants)[number]
export type SidebarCollapsible = (typeof sidebarCollapsibles)[number]
export type SidebarMenuButtonVariant = (typeof sidebarMenuButtonVariants)[number]
export type SidebarMenuButtonSize = (typeof sidebarMenuButtonSizes)[number]
export type SidebarMenuSubButtonSize = (typeof sidebarMenuSubButtonSizes)[number]
export type SidebarState = (typeof sidebarStates)[number]
export type SidebarSlot = (typeof sidebarSlots)[number]
export type SidebarVisualArchetype = (typeof sidebarVisualArchetypes)[number]

export interface SidebarContract {
  defaultSide: SidebarSide
  defaultVariant: SidebarVariant
  defaultCollapsible: SidebarCollapsible
  defaultMenuButtonVariant: SidebarMenuButtonVariant
  defaultMenuButtonSize: SidebarMenuButtonSize
  defaultMenuSubButtonSize: SidebarMenuSubButtonSize
  sides: readonly SidebarSide[]
  variants: readonly SidebarVariant[]
  collapsibles: readonly SidebarCollapsible[]
  menuButtonVariants: readonly SidebarMenuButtonVariant[]
  menuButtonSizes: readonly SidebarMenuButtonSize[]
  menuSubButtonSizes: readonly SidebarMenuSubButtonSize[]
  states: readonly SidebarState[]
  slots: readonly SidebarSlot[]
  visualArchetypes: readonly SidebarVisualArchetype[]
}

export const sidebarContract = {
  defaultSide: 'left',
  defaultVariant: 'sidebar',
  defaultCollapsible: 'offcanvas',
  defaultMenuButtonVariant: 'default',
  defaultMenuButtonSize: 'default',
  defaultMenuSubButtonSize: 'md',
  sides: sidebarSides,
  variants: sidebarVariants,
  collapsibles: sidebarCollapsibles,
  menuButtonVariants: sidebarMenuButtonVariants,
  menuButtonSizes: sidebarMenuButtonSizes,
  menuSubButtonSizes: sidebarMenuSubButtonSizes,
  states: sidebarStates,
  slots: sidebarSlots,
  visualArchetypes: sidebarVisualArchetypes,
} satisfies SidebarContract
import type { VisualArchetypeId } from '../../visual-archetypes'
