import type { VisualArchetypeId } from '../../visual-archetypes'

export const sidebarNavTreeStates = [
  'rest',
  'hover',
  'active',
  'expanded',
  'collapsed',
  'focus-visible',
] as const
export const sidebarNavTreeParts = [
  'group',
  'link-item',
  'collapsible-item',
  'toggle',
  'sub-list',
  'sub-link-item',
] as const
export const sidebarNavTreeVisualArchetypes = [
  'action',
  'trigger',
] as const satisfies readonly VisualArchetypeId[]

export type SidebarNavTreeState = (typeof sidebarNavTreeStates)[number]
export type SidebarNavTreePart = (typeof sidebarNavTreeParts)[number]
export type SidebarNavTreeVisualArchetype = (typeof sidebarNavTreeVisualArchetypes)[number]

export interface SidebarNavTreeContract {
  parts: readonly SidebarNavTreePart[]
  states: readonly SidebarNavTreeState[]
  visualArchetypes: readonly SidebarNavTreeVisualArchetype[]
}

export const sidebarNavTreeContract = {
  parts: sidebarNavTreeParts,
  states: sidebarNavTreeStates,
  visualArchetypes: sidebarNavTreeVisualArchetypes,
} satisfies SidebarNavTreeContract
