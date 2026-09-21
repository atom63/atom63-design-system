// Faithful to prod @atom63/ui button-group: horizontal|vertical orientation and
// the full text/icon size ramp. Sizes drive the welded control heights; the
// text sizes (xs..xl) size the text/label runs, the icon-* sizes make square
// icon-button runs. The DS recipe reads these off data-orientation / data-size.
export const buttonGroupOrientations = ['horizontal', 'vertical'] as const
export const buttonGroupSizes = [
  'xs',
  'sm',
  'default',
  'lg',
  'xl',
  'icon-xs',
  'icon-sm',
  'icon',
  'icon-lg',
  'icon-xl',
] as const
export const buttonGroupSlots = [
  'button-group',
  'button-group-text',
  'button-group-separator',
] as const
export const buttonGroupStates = ['rest', 'focus-within'] as const
export const buttonGroupVisualArchetypes = ['action', 'segment'] as const

export type ButtonGroupOrientation = (typeof buttonGroupOrientations)[number]
export type ButtonGroupSize = (typeof buttonGroupSizes)[number]
export type ButtonGroupSlot = (typeof buttonGroupSlots)[number]
export type ButtonGroupState = (typeof buttonGroupStates)[number]
export type ButtonGroupVisualArchetype = (typeof buttonGroupVisualArchetypes)[number]

export interface ButtonGroupContract {
  defaultOrientation: ButtonGroupOrientation
  defaultSize: ButtonGroupSize
  orientations: readonly ButtonGroupOrientation[]
  sizes: readonly ButtonGroupSize[]
  slots: readonly ButtonGroupSlot[]
  states: readonly ButtonGroupState[]
  visualArchetypes: readonly ButtonGroupVisualArchetype[]
}

export const buttonGroupContract = {
  defaultOrientation: 'horizontal',
  defaultSize: 'default',
  orientations: buttonGroupOrientations,
  sizes: buttonGroupSizes,
  slots: buttonGroupSlots,
  states: buttonGroupStates,
  visualArchetypes: buttonGroupVisualArchetypes,
} satisfies ButtonGroupContract
