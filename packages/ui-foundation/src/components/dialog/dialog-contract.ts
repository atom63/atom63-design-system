import type { A11yPatternBinding } from '../../a11y/types'
import type { VisualArchetypeId } from '../../visual-archetypes'

export const dialogSizes = ['sm', 'default', 'lg'] as const
export const dialogMobilePlacements = ['bottom', 'center'] as const
export const dialogFooterVariants = ['default', 'bare'] as const
export const dialogStates = ['closed', 'open', 'starting', 'ending', 'focus-visible'] as const
export const dialogSlots = [
  'dialog-portal',
  'dialog-trigger',
  'dialog-backdrop',
  'dialog-viewport',
  'dialog-popup',
  'dialog-close',
  'dialog-close-button',
  'dialog-header',
  'dialog-title',
  'dialog-description',
  'dialog-panel',
  'dialog-footer',
] as const
export const dialogVisualArchetypes = [
  'overlay',
  'surface',
  'trigger',
  'action',
] as const satisfies readonly VisualArchetypeId[]

export type DialogSize = (typeof dialogSizes)[number]
export type DialogMobilePlacement = (typeof dialogMobilePlacements)[number]
export type DialogFooterVariant = (typeof dialogFooterVariants)[number]
export type DialogState = (typeof dialogStates)[number]
export type DialogSlot = (typeof dialogSlots)[number]
export type DialogVisualArchetype = (typeof dialogVisualArchetypes)[number]

export interface DialogContract {
  /** The WAI-ARIA APG pattern the component implements. */
  accessibility: A11yPatternBinding
  defaultFooterVariant: DialogFooterVariant
  defaultMobilePlacement: DialogMobilePlacement
  defaultSize: DialogSize
  footerVariants: readonly DialogFooterVariant[]
  mobilePlacements: readonly DialogMobilePlacement[]
  sizes: readonly DialogSize[]
  slots: readonly DialogSlot[]
  states: readonly DialogState[]
  visualArchetypes: readonly DialogVisualArchetype[]
}

export const dialogContract = {
  accessibility: {
    pattern: 'dialog-modal',
  },
  defaultFooterVariant: 'default',
  defaultMobilePlacement: 'bottom',
  defaultSize: 'default',
  footerVariants: dialogFooterVariants,
  mobilePlacements: dialogMobilePlacements,
  sizes: dialogSizes,
  slots: dialogSlots,
  states: dialogStates,
  visualArchetypes: dialogVisualArchetypes,
} satisfies DialogContract
