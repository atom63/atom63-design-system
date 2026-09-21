export const breadcrumbCompositions = ['full', 'collapsed', 'custom-separator'] as const
export const breadcrumbStates = ['rest', 'hover', 'focus', 'current'] as const
export const breadcrumbSlots = [
  'breadcrumb',
  'breadcrumb-list',
  'breadcrumb-item',
  'breadcrumb-link',
  'breadcrumb-page',
  'breadcrumb-separator',
  'breadcrumb-ellipsis',
] as const
export const breadcrumbVisualArchetypes = [] as const

export type BreadcrumbComposition = (typeof breadcrumbCompositions)[number]
export type BreadcrumbState = (typeof breadcrumbStates)[number]
export type BreadcrumbSlot = (typeof breadcrumbSlots)[number]
export type BreadcrumbVisualArchetype = (typeof breadcrumbVisualArchetypes)[number]

export interface BreadcrumbContract {
  compositions: readonly BreadcrumbComposition[]
  slots: readonly BreadcrumbSlot[]
  states: readonly BreadcrumbState[]
  visualArchetypes: readonly BreadcrumbVisualArchetype[]
}

export const breadcrumbContract = {
  compositions: breadcrumbCompositions,
  slots: breadcrumbSlots,
  states: breadcrumbStates,
  visualArchetypes: breadcrumbVisualArchetypes,
} satisfies BreadcrumbContract
