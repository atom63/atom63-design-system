import { type CrossRendererContractId, crossRendererContracts } from '@atom63/ui-foundation'

export interface ReactRendererConformanceEvidence {
  contractId: CrossRendererContractId
  implementedStates: readonly string[]
  verifiedSharedOutcomes: readonly string[]
  verifiedAccessibilityOutcomes: readonly string[]
  verifiesMotionRecipe: boolean
}

/**
 * The React renderer's evidence for each cross-renderer contract. It is read from the contracts;
 * renderer-conformance.test.tsx keeps the verified list by hand and fails when the two differ.
 */
export const reactRendererConformance: readonly ReactRendererConformanceEvidence[] =
  crossRendererContracts.map(contract => ({
    contractId: contract.id,
    implementedStates: contract.requiredStates,
    verifiedSharedOutcomes: contract.sharedOutcomes,
    verifiedAccessibilityOutcomes: contract.accessibilityOutcomes,
    verifiesMotionRecipe: 'motion' in contract,
  }))

export type ReactVerifiedContractId = CrossRendererContractId

export function getReactRendererConformance(
  contractId: CrossRendererContractId
): ReactRendererConformanceEvidence | undefined {
  return reactRendererConformance.find(evidence => evidence.contractId === contractId)
}
