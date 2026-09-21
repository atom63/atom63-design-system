import type { VisualArchetypeId } from '../../visual-archetypes'

export const avatarSizes = ['sm', 'default', 'lg'] as const
export const avatarStates = ['loading', 'loaded', 'fallback'] as const
export const avatarCompositions = ['standalone', 'badge', 'group'] as const
export const avatarSlots = [
  'avatar',
  'avatar-image',
  'avatar-fallback',
  'avatar-badge',
  'avatar-group',
  'avatar-group-count',
] as const
export const avatarVisualArchetypes = ['marker'] as const satisfies readonly VisualArchetypeId[]

export type AvatarSize = (typeof avatarSizes)[number]
export type AvatarState = (typeof avatarStates)[number]
export type AvatarComposition = (typeof avatarCompositions)[number]
export type AvatarSlot = (typeof avatarSlots)[number]
export type AvatarVisualArchetype = (typeof avatarVisualArchetypes)[number]

export interface AvatarContract {
  compositions: readonly AvatarComposition[]
  defaultSize: AvatarSize
  sizes: readonly AvatarSize[]
  slots: readonly AvatarSlot[]
  states: readonly AvatarState[]
  visualArchetypes: readonly AvatarVisualArchetype[]
}

export const avatarContract = {
  compositions: avatarCompositions,
  defaultSize: 'default',
  sizes: avatarSizes,
  slots: avatarSlots,
  states: avatarStates,
  visualArchetypes: avatarVisualArchetypes,
} satisfies AvatarContract
