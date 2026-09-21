export const commandSlots = [
  'command',
  'command-dialog-trigger',
  'command-dialog-backdrop',
  'command-dialog-viewport',
  'command-dialog-popup',
  'command-input-wrapper',
  'command-input',
  'command-panel',
  'command-list',
  'command-empty',
  'command-group',
  'command-group-label',
  'command-collection',
  'command-item',
  'command-separator',
  'command-shortcut',
  'command-footer',
] as const

export const commandStates = [
  'closed',
  'open',
  'empty',
  'highlighted',
  'disabled',
  'focus-visible',
] as const

export const commandVisualArchetypes = ['overlay', 'surface', 'field', 'menu'] as const

export type CommandSlot = (typeof commandSlots)[number]
export type CommandState = (typeof commandStates)[number]
export type CommandVisualArchetype = (typeof commandVisualArchetypes)[number]

export interface CommandContract {
  slots: readonly CommandSlot[]
  states: readonly CommandState[]
  visualArchetypes: readonly CommandVisualArchetype[]
}

export const commandContract = {
  slots: commandSlots,
  states: commandStates,
  visualArchetypes: commandVisualArchetypes,
} satisfies CommandContract
