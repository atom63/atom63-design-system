import type { VisualArchetypeId } from '../../visual-archetypes'

// Faithful to prod @atom63/ui alert.tsx: a status callout with a default
// (neutral) variant plus four semantic tones. Visually, Alert is a static
// content/status surface; interactive controls only appear inside its action slot.
export const alertVariants = ['default', 'error', 'info', 'success', 'warning'] as const
export const alertSlots = [
  'alert',
  'alert-icon',
  'alert-title',
  'alert-description',
  'alert-action',
] as const
export const alertVisualArchetypes = ['surface'] as const satisfies readonly VisualArchetypeId[]

export type AlertVariant = (typeof alertVariants)[number]
export type AlertSlot = (typeof alertSlots)[number]
export type AlertVisualArchetype = (typeof alertVisualArchetypes)[number]

export interface AlertContract {
  defaultVariant: AlertVariant
  variants: readonly AlertVariant[]
  slots: readonly AlertSlot[]
  visualArchetypes: readonly AlertVisualArchetype[]
}

export const alertContract = {
  defaultVariant: 'default',
  variants: alertVariants,
  slots: alertSlots,
  visualArchetypes: alertVisualArchetypes,
} satisfies AlertContract
