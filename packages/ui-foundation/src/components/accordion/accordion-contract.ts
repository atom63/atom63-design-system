import type { A11yPatternBinding } from '../../a11y/types'
import type { VisualArchetypeId } from '../../visual-archetypes'

export const accordionIconVariants = ['chevron', 'plus-minus'] as const
export const accordionStates = ['closed', 'open', 'focusVisible', 'disabled'] as const
export const accordionSlots = [
  'accordion',
  'accordion-item',
  'accordion-trigger',
  'accordion-indicator',
  'accordion-content',
  'accordion-content-inner',
] as const
export const accordionVisualArchetypes = [
  'surface',
  'trigger',
] as const satisfies readonly VisualArchetypeId[]

export type AccordionIconVariant = (typeof accordionIconVariants)[number]
export type AccordionState = (typeof accordionStates)[number]
export type AccordionSlot = (typeof accordionSlots)[number]
export type AccordionVisualArchetype = (typeof accordionVisualArchetypes)[number]

export interface AccordionContract {
  /** The WAI-ARIA APG pattern the component implements. */
  accessibility: A11yPatternBinding
  defaultIconVariant: AccordionIconVariant
  iconVariants: readonly AccordionIconVariant[]
  slots: readonly AccordionSlot[]
  states: readonly AccordionState[]
  visualArchetypes: readonly AccordionVisualArchetype[]
}

export const accordionContract = {
  accessibility: {
    pattern: 'accordion',
    options: { collapse: 'collapsible', expand: 'single' },
    knownGaps: [
      {
        check: 'header-controls-panel',
        reason:
          'Base UI sets aria-controls only on the header of an expanded panel, because a collapsed panel is not mounted. A fix needs the panels kept mounted and Base UI to set aria-controls while closed.',
      },
    ],
  },
  defaultIconVariant: 'chevron',
  iconVariants: accordionIconVariants,
  slots: accordionSlots,
  states: accordionStates,
  visualArchetypes: accordionVisualArchetypes,
} satisfies AccordionContract
