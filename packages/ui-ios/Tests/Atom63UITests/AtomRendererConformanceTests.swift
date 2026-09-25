import Testing

@testable import Atom63UI

struct AtomRendererConformanceTests {
  @Test
  func verifiedEvidenceMatchesGeneratedContracts() {
    let verifiedIds = AtomRendererConformance.verified.map(\.contractId)
    #expect(Set(verifiedIds).count == verifiedIds.count)
    #expect(Set(verifiedIds) == Set(AtomComponentContracts.all.map(\.id)))

    for evidence in AtomRendererConformance.verified {
      let contract = AtomComponentContracts.all.first { $0.id == evidence.contractId }

      #expect(contract != nil)
      #expect(evidence.implementedStates == contract?.requiredStates)
      #expect(evidence.verifiedSharedOutcomes == contract?.sharedOutcomes)
      #expect(evidence.verifiedAccessibilityOutcomes == contract?.accessibilityOutcomes)
      #expect(evidence.verifiesMotionRecipe == (contract?.motion != nil))
    }
  }

  @Test
  func semanticRendererVocabulariesCoverVerifiedStateContracts() {
    let alert = AtomRendererConformance.evidence(contractId: "alert")
    #expect(alert?.implementedStates == AtomNoticeTone.allCases.map(\.rawValue))

    let pagination = AtomRendererConformance.evidence(contractId: "load-more-trigger")
    #expect(pagination?.implementedStates == AtomPaginationIntent.allCases.map(\.rawValue))

    let skeleton = AtomRendererConformance.evidence(contractId: "skeleton")
    #expect(skeleton?.verifiesMotionRecipe == true)
    #expect(AtomTokens.Motion.skeletonShimmer > 0)
  }
}
