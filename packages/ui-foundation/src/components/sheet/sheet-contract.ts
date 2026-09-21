import type { VisualArchetypeId } from '../../visual-archetypes'

export const sheetSides = ['right', 'left', 'top', 'bottom'] as const
export const sheetVariants = ['default', 'inset'] as const
export const sheetFooterVariants = ['default', 'bare'] as const
export const sheetStates = ['closed', 'open', 'starting', 'ending'] as const
export const sheetSlots = [
  'sheet',
  'sheet-portal',
  'sheet-trigger',
  'sheet-backdrop',
  'sheet-viewport',
  'sheet-popup',
  'sheet-close',
  'sheet-close-button',
  'sheet-header',
  'sheet-title',
  'sheet-description',
  'sheet-panel',
  'sheet-footer',
] as const
export const sheetVisualArchetypes = [
  'overlay',
  'surface',
  'trigger',
  'action',
] as const satisfies readonly VisualArchetypeId[]

export type SheetSide = (typeof sheetSides)[number]
export type SheetVariant = (typeof sheetVariants)[number]
export type SheetFooterVariant = (typeof sheetFooterVariants)[number]
export type SheetState = (typeof sheetStates)[number]
export type SheetSlot = (typeof sheetSlots)[number]
export type SheetVisualArchetype = (typeof sheetVisualArchetypes)[number]

export interface SheetContract {
  defaultFooterVariant: SheetFooterVariant
  defaultSide: SheetSide
  defaultVariant: SheetVariant
  footerVariants: readonly SheetFooterVariant[]
  sides: readonly SheetSide[]
  slots: readonly SheetSlot[]
  states: readonly SheetState[]
  variants: readonly SheetVariant[]
  visualArchetypes: readonly SheetVisualArchetype[]
}

export const sheetContract = {
  defaultFooterVariant: 'default',
  defaultSide: 'right',
  defaultVariant: 'default',
  footerVariants: sheetFooterVariants,
  sides: sheetSides,
  slots: sheetSlots,
  states: sheetStates,
  variants: sheetVariants,
  visualArchetypes: sheetVisualArchetypes,
} satisfies SheetContract
