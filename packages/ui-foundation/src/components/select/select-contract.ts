import type { A11yPatternBinding } from '../../a11y/types'
import type { VisualArchetypeId } from '../../visual-archetypes'

export const selectSizes = ['sm', 'md', 'lg'] as const
export const selectStates = [
  'closed',
  'open',
  'placeholder',
  'focus-visible',
  'disabled',
  'highlighted-item',
  'selected-item',
  'disabled-item',
] as const
export const selectSlots = [
  'select-trigger',
  'select-value',
  'select-icon',
  'select-positioner',
  'select-popup',
  'select-surface',
  'select-list',
  'select-scroll-up-arrow',
  'select-scroll-down-arrow',
  'select-item',
  'select-item-indicator',
  'select-item-text',
  'select-group',
  'select-group-label',
  'select-separator',
] as const
export const selectTokenSlots = [
  'field.background',
  'field.border',
  'field.radius',
  'field.shadow',
  'field.focusRing',
  'field.focusBorder',
  'field.height',
  'field.paddingInline',
  'field.fontSize',
  'field.iconSize',
  'field.gap',
] as const
export const selectVisualArchetypes = [
  'field',
  'trigger',
  'overlay',
  'menu',
] as const satisfies readonly VisualArchetypeId[]

export type SelectSize = (typeof selectSizes)[number]
export type SelectSlot = (typeof selectSlots)[number]
export type SelectState = (typeof selectStates)[number]
export type SelectTokenSlot = (typeof selectTokenSlots)[number]
export type SelectVisualArchetype = (typeof selectVisualArchetypes)[number]

export interface SelectContract {
  /** The WAI-ARIA APG pattern the component implements. */
  accessibility: A11yPatternBinding
  defaultSize: SelectSize
  sizes: readonly SelectSize[]
  slots: readonly SelectSlot[]
  states: readonly SelectState[]
  tokenSlots: readonly SelectTokenSlot[]
  visualArchetypes: readonly SelectVisualArchetype[]
}

export const selectContract = {
  accessibility: {
    pattern: 'combobox-select-only',
    knownGaps: [
      {
        check: 'combobox-active-descendant',
        reason:
          'Base UI Select moves DOM focus onto the options instead of keeping it on the combobox with aria-activedescendant, and has no option to change it. The APG Combobox pattern requires DOM focus to stay on the combobox (https://www.w3.org/WAI/ARIA/apg/patterns/combobox/), so this is a gap, not a variant. Screen readers still announce the focused option.',
      },
    ],
  },
  defaultSize: 'md',
  sizes: selectSizes,
  slots: selectSlots,
  states: selectStates,
  tokenSlots: selectTokenSlots,
  visualArchetypes: selectVisualArchetypes,
} satisfies SelectContract
