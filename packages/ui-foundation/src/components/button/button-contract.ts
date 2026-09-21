export const buttonVariants = [
  'default',
  'primary',
  'secondary',
  'destructive',
  'destructive-outline',
  'outline',
  'ghost',
  'link',
  'overlay',
  'glass',
] as const
export const buttonSizes = [
  'xs',
  'sm',
  'md',
  'lg',
  'xl',
  'tile',
  'icon-xs',
  'icon-sm',
  'icon',
  'icon-lg',
  'icon-xl',
] as const
export const buttonStates = [
  'rest',
  'hover',
  'pressed',
  'focusVisible',
  'disabled',
  'loading',
] as const
export const buttonSlots = ['root', 'label', 'icon', 'spinner'] as const
export const buttonTokenSlots = [
  'button.background',
  'button.foreground',
  'button.border.color',
  'button.border.width',
  'button.radius',
  'button.shadow',
  'button.focusRing',
  'button.height',
  'button.paddingInline',
  'button.gap',
  'button.iconSize',
  'button.motion.press',
] as const
export const buttonVisualArchetypes = ['action'] as const

export type ButtonVariant = (typeof buttonVariants)[number]
export type ButtonSize = (typeof buttonSizes)[number]
export type ButtonState = (typeof buttonStates)[number]
export type ButtonSlot = (typeof buttonSlots)[number]
export type ButtonTokenSlot = (typeof buttonTokenSlots)[number]
export type ButtonVisualArchetype = (typeof buttonVisualArchetypes)[number]

export interface ButtonContract {
  defaultSize: ButtonSize
  defaultVariant: ButtonVariant
  slots: readonly ButtonSlot[]
  states: readonly ButtonState[]
  tokenSlots: readonly ButtonTokenSlot[]
  variants: readonly ButtonVariant[]
  visualArchetypes: readonly ButtonVisualArchetype[]
}

export const buttonContract = {
  defaultSize: 'md',
  defaultVariant: 'default',
  slots: buttonSlots,
  states: buttonStates,
  tokenSlots: buttonTokenSlots,
  variants: buttonVariants,
  visualArchetypes: buttonVisualArchetypes,
} satisfies ButtonContract
