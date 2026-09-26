import type { A11yPatternBinding } from '../../a11y/types'
import { type SelectionTokenSlot, selectionTokenSlots } from '../selection/selection-contract'

export const switchSizes = ['sm', 'md'] as const
export const switchStates = ['off', 'on', 'hover', 'pressed', 'focus-visible', 'disabled'] as const
export const switchSlots = ['switch', 'switch-thumb'] as const
export const switchVisualArchetypes = ['choice'] as const satisfies readonly VisualArchetypeId[]

export type { SelectionTokenSlot }
/* The shared selection token list now lives in selection-contract.ts (shared by
 * Switch, Checkbox, Radio); re-exported here for back-compat. */
export { selectionTokenSlots }

export type SwitchSize = (typeof switchSizes)[number]
export type SwitchState = (typeof switchStates)[number]
export type SwitchSlot = (typeof switchSlots)[number]
export type SwitchVisualArchetype = (typeof switchVisualArchetypes)[number]

export interface SwitchContract {
  /** The WAI-ARIA APG pattern the component implements. */
  accessibility: A11yPatternBinding
  defaultSize: SwitchSize
  sizes: readonly SwitchSize[]
  slots: readonly SwitchSlot[]
  states: readonly SwitchState[]
  tokenSlots: readonly SelectionTokenSlot[]
  visualArchetypes: readonly SwitchVisualArchetype[]
}

export const switchContract = {
  accessibility: { pattern: 'switch' },
  defaultSize: 'md',
  sizes: switchSizes,
  slots: switchSlots,
  states: switchStates,
  tokenSlots: selectionTokenSlots,
  visualArchetypes: switchVisualArchetypes,
} satisfies SwitchContract
import type { VisualArchetypeId } from '../../visual-archetypes'
