import type { VisualArchetypeId } from '../../visual-archetypes'

export const toggleSizes = ['sm', 'md', 'lg'] as const
export const toggleTones = ['neutral', 'accent'] as const
export const toggleStates = ['off', 'on', 'rest', 'hover', 'pressed', 'disabled', 'focus'] as const
export const toggleSlots = ['toggle', 'toggle-content'] as const
export const toggleTokenSlots = [
  'toggle.background',
  'toggle.foreground',
  'toggle.hoverBackground',
  'toggle.onBackground',
  'toggle.onForeground',
  'toggle.primaryBackground',
  'toggle.primaryForeground',
  'toggle.borderWidth',
  'toggle.radius',
  'toggle.gloss',
  'toggle.shadow',
  'toggle.shadowActive',
  'toggle.textShadow',
] as const
export const toggleVisualArchetypes = ['toggle'] as const satisfies readonly VisualArchetypeId[]

export type ToggleSize = (typeof toggleSizes)[number]
export type ToggleTone = (typeof toggleTones)[number]
export type ToggleState = (typeof toggleStates)[number]
export type ToggleSlot = (typeof toggleSlots)[number]
export type ToggleTokenSlot = (typeof toggleTokenSlots)[number]
export type ToggleVisualArchetype = (typeof toggleVisualArchetypes)[number]

export interface ToggleContract {
  defaultSize: ToggleSize
  defaultTone: ToggleTone
  sizes: readonly ToggleSize[]
  slots: readonly ToggleSlot[]
  states: readonly ToggleState[]
  tokenSlots: readonly ToggleTokenSlot[]
  tones: readonly ToggleTone[]
  visualArchetypes: readonly ToggleVisualArchetype[]
}

export const toggleContract = {
  defaultSize: 'md',
  defaultTone: 'neutral',
  sizes: toggleSizes,
  slots: toggleSlots,
  states: toggleStates,
  tokenSlots: toggleTokenSlots,
  tones: toggleTones,
  visualArchetypes: toggleVisualArchetypes,
} satisfies ToggleContract
