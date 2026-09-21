export const contextMenuSlots = [
  'context-menu',
  'context-menu-trigger',
  'context-menu-group',
  'context-menu-portal',
  'context-menu-positioner',
  'context-menu-content',
  'context-menu-item',
  'context-menu-sub',
  'context-menu-sub-trigger',
  'context-menu-sub-positioner',
  'context-menu-sub-content',
  'context-menu-checkbox-item',
  'context-menu-radio-group',
  'context-menu-radio-item',
  'context-menu-item-indicator',
  'context-menu-label',
  'context-menu-separator',
  'context-menu-shortcut',
] as const

export const contextMenuStates = [
  'closed',
  'open',
  'highlighted',
  'disabled',
  'checked',
  'unchecked',
  'submenu-open',
  'destructive',
] as const

export const contextMenuVisualArchetypes = ['menu', 'overlay'] as const

export type ContextMenuSlot = (typeof contextMenuSlots)[number]
export type ContextMenuState = (typeof contextMenuStates)[number]
export type ContextMenuVisualArchetype = (typeof contextMenuVisualArchetypes)[number]

export interface ContextMenuContract {
  slots: readonly ContextMenuSlot[]
  states: readonly ContextMenuState[]
  visualArchetypes: readonly ContextMenuVisualArchetype[]
}

export const contextMenuContract = {
  slots: contextMenuSlots,
  states: contextMenuStates,
  visualArchetypes: contextMenuVisualArchetypes,
} satisfies ContextMenuContract
