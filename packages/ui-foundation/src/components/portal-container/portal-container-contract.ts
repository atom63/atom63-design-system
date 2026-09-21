import type { VisualArchetypeId } from '../../visual-archetypes'

export const portalContainerTargets = ['element', 'shadow-root', 'null', 'undefined'] as const
export const portalContainerStates = ['unprovided', 'pending', 'resolved'] as const
export const portalContainerVisualArchetypes = [] as const satisfies readonly VisualArchetypeId[]

export type PortalContainerTarget = (typeof portalContainerTargets)[number]
export type PortalContainerState = (typeof portalContainerStates)[number]

export interface PortalContainerContract {
  states: readonly PortalContainerState[]
  targets: readonly PortalContainerTarget[]
  visualArchetypes: readonly VisualArchetypeId[]
}

export const portalContainerContract = {
  states: portalContainerStates,
  targets: portalContainerTargets,
  visualArchetypes: portalContainerVisualArchetypes,
} satisfies PortalContainerContract
