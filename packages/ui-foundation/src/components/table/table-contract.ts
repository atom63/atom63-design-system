import type { VisualArchetypeId } from '../../visual-archetypes'
export const tableVariants = ['plain', 'framed'] as const
export const tableStates = ['rest', 'row-hover', 'row-selected'] as const
export const tableSlots = [
  'table-container',
  'table',
  'table-header',
  'table-body',
  'table-footer',
  'table-row',
  'table-head',
  'table-cell',
  'table-caption',
] as const
export const tableVisualArchetypes = ['surface'] as const satisfies readonly VisualArchetypeId[]
export type TableVariant = (typeof tableVariants)[number]
export type TableState = (typeof tableStates)[number]
export type TableSlot = (typeof tableSlots)[number]
export type TableVisualArchetype = (typeof tableVisualArchetypes)[number]
export interface TableContract {
  defaultVariant: TableVariant
  variants: readonly TableVariant[]
  states: readonly TableState[]
  slots: readonly TableSlot[]
  visualArchetypes: readonly TableVisualArchetype[]
}
export const tableContract = {
  defaultVariant: 'plain',
  variants: tableVariants,
  states: tableStates,
  slots: tableSlots,
  visualArchetypes: tableVisualArchetypes,
} satisfies TableContract
