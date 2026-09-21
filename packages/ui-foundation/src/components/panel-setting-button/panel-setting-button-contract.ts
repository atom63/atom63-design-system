import type { VisualArchetypeId } from '../../visual-archetypes'

export const panelSettingButtonStates = ['off', 'on', 'disabled', 'focus-visible'] as const
export const panelSettingButtonSlots = [
  'panel-setting-button',
  'panel-setting-button-label',
] as const
export const panelSettingButtonVisualArchetypes = [
  'toggle',
  'surface',
] as const satisfies readonly VisualArchetypeId[]

export type PanelSettingButtonState = (typeof panelSettingButtonStates)[number]
export type PanelSettingButtonSlot = (typeof panelSettingButtonSlots)[number]
export type PanelSettingButtonVisualArchetype = (typeof panelSettingButtonVisualArchetypes)[number]

export interface PanelSettingButtonContract {
  slots: readonly PanelSettingButtonSlot[]
  states: readonly PanelSettingButtonState[]
  visualArchetypes: readonly PanelSettingButtonVisualArchetype[]
}

export const panelSettingButtonContract = {
  slots: panelSettingButtonSlots,
  states: panelSettingButtonStates,
  visualArchetypes: panelSettingButtonVisualArchetypes,
} satisfies PanelSettingButtonContract
