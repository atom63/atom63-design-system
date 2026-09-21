/* Shared value-token slots for every selection control (Switch, Checkbox, Radio).
 * The recipes read these `--a63-selection-*` tokens at the use-site; this list is
 * the SSOT for what the selection archetype exposes. */
export const selectionTokenSlots = [
  'selection.accent',
  'selection.accentForeground',
  'selection.trackOff',
  'selection.border',
  'selection.thumb',
  'selection.focusRing',
] as const

export type SelectionTokenSlot = (typeof selectionTokenSlots)[number]
