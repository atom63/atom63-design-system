export const copyButtonVariants = ['ghost', 'outline', 'secondary'] as const

export const copyButtonSizePairs = [
  { icon: 'icon-xs', label: 'xs' },
  { icon: 'icon-sm', label: 'sm' },
  { icon: 'icon', label: 'md' },
  { icon: 'icon-lg', label: 'lg' },
  { icon: 'icon-xl', label: 'xl' },
] as const

export const copyButtonSizes = copyButtonSizePairs.flatMap(pair => [pair.icon, pair.label])

export const copyButtonSlots = [
  'button',
  'button-label',
  'copy-button-swap',
  'copy-button-item',
  'animated-check',
] as const

export const copyButtonStates = ['rest', 'hover', 'pressed', 'focus-visible', 'copied'] as const

export const copyButtonVisualArchetypes = ['action'] as const

export type CopyButtonSize = (typeof copyButtonSizes)[number]
export type CopyButtonSlot = (typeof copyButtonSlots)[number]
export type CopyButtonState = (typeof copyButtonStates)[number]
export type CopyButtonVariant = (typeof copyButtonVariants)[number]
export type CopyButtonVisualArchetype = (typeof copyButtonVisualArchetypes)[number]

export interface CopyButtonContract {
  defaultIconSize: CopyButtonSize
  defaultLabelSize: CopyButtonSize
  sizePairs: typeof copyButtonSizePairs
  sizes: readonly CopyButtonSize[]
  slots: readonly CopyButtonSlot[]
  states: readonly CopyButtonState[]
  variants: readonly CopyButtonVariant[]
  visualArchetypes: readonly CopyButtonVisualArchetype[]
}

export const copyButtonContract = {
  defaultIconSize: 'icon-sm',
  defaultLabelSize: 'sm',
  sizePairs: copyButtonSizePairs,
  sizes: copyButtonSizes,
  slots: copyButtonSlots,
  states: copyButtonStates,
  variants: copyButtonVariants,
  visualArchetypes: copyButtonVisualArchetypes,
} satisfies CopyButtonContract
