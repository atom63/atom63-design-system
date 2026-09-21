export type ContractParity = 'strict' | 'recipe' | 'platform-adaptive'
export type CrossRendererSemanticTone = 'neutral' | 'info' | 'success' | 'warning' | 'error'

export interface CrossRendererMotionContract {
  kind: string
  durationToken: string
  easing: string
  direction: string
  reducedMotion: 'none' | 'static'
}

export interface CrossRendererPlatformAdaptations {
  react: readonly string[]
  swiftUI: readonly string[]
}

export interface CrossRendererComponentContract {
  id: string
  foundationContract: string
  foundationAxis: 'states' | 'variants'
  catalogItem: string
  reactRenderer: string
  swiftUIRenderer: string
  intent: string
  parity: ContractParity
  requiredStates: readonly string[]
  stateTones?: Readonly<Record<string, CrossRendererSemanticTone>>
  sharedOutcomes: readonly string[]
  accessibilityOutcomes: readonly string[]
  motion?: CrossRendererMotionContract
  platformAdaptations: CrossRendererPlatformAdaptations
}
