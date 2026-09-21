import type { VisualArchetypeId } from '../../visual-archetypes'

export const fieldOrientations = ['vertical', 'horizontal', 'responsive'] as const
export const fieldLegendVariants = ['legend', 'label'] as const
export const fieldStates = ['default', 'invalid', 'disabled'] as const
export const fieldSlots = [
  'field-set',
  'field-legend',
  'field-group',
  'field',
  'field-content',
  'field-label',
  'field-title',
  'field-description',
  'field-separator',
  'field-separator-content',
  'field-error',
] as const
export const fieldVisualArchetypes = [
  'field',
  'choice',
] as const satisfies readonly VisualArchetypeId[]

export type FieldOrientation = (typeof fieldOrientations)[number]
export type FieldLegendVariant = (typeof fieldLegendVariants)[number]
export type FieldState = (typeof fieldStates)[number]
export type FieldSlot = (typeof fieldSlots)[number]
export type FieldVisualArchetype = (typeof fieldVisualArchetypes)[number]

export interface FieldContract {
  defaultLegendVariant: FieldLegendVariant
  defaultOrientation: FieldOrientation
  legendVariants: readonly FieldLegendVariant[]
  orientations: readonly FieldOrientation[]
  slots: readonly FieldSlot[]
  states: readonly FieldState[]
  visualArchetypes: readonly FieldVisualArchetype[]
}

export const fieldContract = {
  defaultLegendVariant: 'legend',
  defaultOrientation: 'vertical',
  legendVariants: fieldLegendVariants,
  orientations: fieldOrientations,
  slots: fieldSlots,
  states: fieldStates,
  visualArchetypes: fieldVisualArchetypes,
} satisfies FieldContract
