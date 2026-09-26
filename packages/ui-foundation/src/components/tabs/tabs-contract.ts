import type { A11yPatternBinding } from '../../a11y/types'
// Faithful to prod @atom63/ui tabs.tsx: the TabsList carries a `variant`
// (default = a filled pill track, underline = an underline indicator,
// attached = borderless folder tabs) and a `size` ramp. TabsTab also takes the
// size so items scale with the list.
export const tabsVariants = ['default', 'underline', 'attached'] as const
export const tabsSizes = ['xs', 'sm', 'default', 'lg'] as const
export const tabsOrientations = ['horizontal', 'vertical'] as const
export const tabsStates = ['rest', 'hover', 'selected', 'focus-visible', 'disabled'] as const
export const tabsSlots = ['tabs', 'tabs-list', 'tabs-tab', 'tab-indicator', 'tabs-content'] as const
export const tabsVisualArchetypes = [
  'segment',
  'surface',
] as const satisfies readonly VisualArchetypeId[]

export type TabsVariant = (typeof tabsVariants)[number]
export type TabsSize = (typeof tabsSizes)[number]
export type TabsSlot = (typeof tabsSlots)[number]
export type TabsOrientation = (typeof tabsOrientations)[number]
export type TabsState = (typeof tabsStates)[number]
export type TabsVisualArchetype = (typeof tabsVisualArchetypes)[number]

export interface TabsContract {
  /** The WAI-ARIA APG pattern the component implements. */
  accessibility: A11yPatternBinding
  defaultVariant: TabsVariant
  defaultSize: TabsSize
  variants: readonly TabsVariant[]
  sizes: readonly TabsSize[]
  slots: readonly TabsSlot[]
  orientations: readonly TabsOrientation[]
  states: readonly TabsState[]
  visualArchetypes: readonly TabsVisualArchetype[]
}

export const tabsContract = {
  accessibility: { pattern: 'tabs', options: { activation: 'manual' } },
  defaultVariant: 'default',
  defaultSize: 'default',
  variants: tabsVariants,
  sizes: tabsSizes,
  slots: tabsSlots,
  orientations: tabsOrientations,
  states: tabsStates,
  visualArchetypes: tabsVisualArchetypes,
} satisfies TabsContract
import type { VisualArchetypeId } from '../../visual-archetypes'
