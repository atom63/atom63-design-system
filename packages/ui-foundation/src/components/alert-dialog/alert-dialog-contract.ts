import type { VisualArchetypeId } from '../../visual-archetypes'

export const alertDialogVariants = ['default', 'destructive', 'info', 'success', 'warning'] as const
export const alertDialogFooterVariants = ['default', 'bare'] as const
export const alertDialogSizes = ['default', 'sm'] as const
export const alertDialogStates = ['closed', 'open'] as const
export const alertDialogSlots = [
  'alert-dialog-portal',
  'alert-dialog-trigger',
  'alert-dialog-backdrop',
  'alert-dialog-viewport',
  'alert-dialog-popup',
  'alert-dialog-header',
  'alert-dialog-footer',
  'alert-dialog-media',
  'alert-dialog-title',
  'alert-dialog-description',
  'alert-dialog-close',
  'alert-dialog-action',
  'alert-dialog-cancel',
] as const
export const alertDialogVisualArchetypes = [
  'overlay',
  'surface',
  'trigger',
  'action',
] as const satisfies readonly VisualArchetypeId[]

export type AlertDialogVariant = (typeof alertDialogVariants)[number]
export type AlertDialogFooterVariant = (typeof alertDialogFooterVariants)[number]
export type AlertDialogSize = (typeof alertDialogSizes)[number]
export type AlertDialogState = (typeof alertDialogStates)[number]
export type AlertDialogSlot = (typeof alertDialogSlots)[number]
export type AlertDialogVisualArchetype = (typeof alertDialogVisualArchetypes)[number]

export interface AlertDialogContract {
  defaultFooterVariant: AlertDialogFooterVariant
  defaultSize: AlertDialogSize
  defaultVariant: AlertDialogVariant
  footerVariants: readonly AlertDialogFooterVariant[]
  sizes: readonly AlertDialogSize[]
  slots: readonly AlertDialogSlot[]
  states: readonly AlertDialogState[]
  variants: readonly AlertDialogVariant[]
  visualArchetypes: readonly AlertDialogVisualArchetype[]
}

export const alertDialogContract = {
  defaultFooterVariant: 'default',
  defaultSize: 'default',
  defaultVariant: 'default',
  footerVariants: alertDialogFooterVariants,
  sizes: alertDialogSizes,
  slots: alertDialogSlots,
  states: alertDialogStates,
  variants: alertDialogVariants,
  visualArchetypes: alertDialogVisualArchetypes,
} satisfies AlertDialogContract
