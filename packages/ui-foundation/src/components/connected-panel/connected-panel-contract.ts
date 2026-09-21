import type { VisualArchetypeId } from '../../visual-archetypes'

// An in-flow disclosure whose trigger and expanded content share one continuous
// surface. It consumes trigger behavior for the header row and surface chrome
// for the panel itself; it is not an overlay because it remains in document flow.

export const connectedPanelAligns = ['start', 'center', 'end'] as const
export const connectedPanelSlots = [
  'connected-panel',
  'connected-panel-anchor',
  'connected-panel-trigger',
  'connected-panel-trigger-icon',
  'connected-panel-trigger-text',
  'connected-panel-trigger-label',
  'connected-panel-trigger-summary',
  'connected-panel-trigger-chevron',
  'connected-panel-content',
  'connected-panel-content-clip',
  'connected-panel-content-inner',
  'connected-panel-header',
  'connected-panel-title',
  'connected-panel-description',
  'connected-panel-body',
  'connected-panel-footer',
] as const
export const connectedPanelStates = [
  'closed',
  'open',
  'hover',
  'focus-visible',
  'disabled',
] as const
export const connectedPanelVisualArchetypes = [
  'trigger',
  'surface',
] as const satisfies readonly VisualArchetypeId[]

export type ConnectedPanelAlign = (typeof connectedPanelAligns)[number]
export type ConnectedPanelSlot = (typeof connectedPanelSlots)[number]
export type ConnectedPanelState = (typeof connectedPanelStates)[number]
export type ConnectedPanelVisualArchetype = (typeof connectedPanelVisualArchetypes)[number]

export interface ConnectedPanelContract {
  defaultAlign: ConnectedPanelAlign
  aligns: readonly ConnectedPanelAlign[]
  slots: readonly ConnectedPanelSlot[]
  states: readonly ConnectedPanelState[]
  visualArchetypes: readonly ConnectedPanelVisualArchetype[]
}

export const connectedPanelContract = {
  defaultAlign: 'start',
  aligns: connectedPanelAligns,
  slots: connectedPanelSlots,
  states: connectedPanelStates,
  visualArchetypes: connectedPanelVisualArchetypes,
} satisfies ConnectedPanelContract
