import type { VisualArchetypeId } from '../../visual-archetypes'

export const marqueeOrientations = ['horizontal', 'vertical'] as const
export const marqueeStates = ['running', 'paused', 'hover-paused', 'reduced-motion'] as const
export const marqueeSlots = ['marquee', 'marquee-track'] as const
export const marqueeVisualArchetypes = [] as const satisfies readonly VisualArchetypeId[]

export type MarqueeOrientation = (typeof marqueeOrientations)[number]
export type MarqueeState = (typeof marqueeStates)[number]
export type MarqueeSlot = (typeof marqueeSlots)[number]

export interface MarqueeContract {
  defaultGap: string
  defaultRepeat: number
  orientations: readonly MarqueeOrientation[]
  slots: readonly MarqueeSlot[]
  states: readonly MarqueeState[]
  visualArchetypes: readonly VisualArchetypeId[]
}

export const marqueeContract = {
  defaultGap: 'var(--a63-space-4, 1rem)',
  defaultRepeat: 4,
  orientations: marqueeOrientations,
  slots: marqueeSlots,
  states: marqueeStates,
  visualArchetypes: marqueeVisualArchetypes,
} satisfies MarqueeContract
