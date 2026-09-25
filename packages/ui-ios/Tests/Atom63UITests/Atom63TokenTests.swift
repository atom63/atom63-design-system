import SwiftUI
import Testing

@testable import Atom63UI

struct Atom63TokenTests {
  @Test
  func generatedTokensMatchSharedFoundationValues() {
    #expect(AtomTokens.Space.x1 == 4)
    #expect(AtomTokens.Space.x4 == 16)
    #expect(AtomTokens.Radius.large == 10)
    #expect(AtomTokens.Motion.standard == 0.25)
    #expect(AtomTokens.Motion.controlFeedback == 0.15)
    #expect(AtomTokens.Motion.skeletonShimmer == 1.5)
    // Exact values are checked against the web by swift-parity.browser.test.ts.
    #expect(AtomTokens.Color.statusInfo.light.blue > 0.7)
    #expect(AtomTokens.Color.statusSuccess.light.green > 0.5)
    // Colors are resolved as painted, so alpha has 8-bit precision (0.1 is 26/255).
    #expect(abs(AtomTokens.Color.skeletonHighlight.light.opacity - 0.6) < 1 / 255)
    #expect(abs(AtomTokens.Color.skeletonHighlight.dark.opacity - 0.1) < 1 / 255)
  }

  @Test
  func standardThemeUsesGeneratedSemanticTokens() {
    #expect(AtomTheme.standard.colors.actionPrimary == AtomTokens.Color.actionPrimary)
    #expect(AtomTheme.standard.colors.surfacePage == AtomTokens.Color.surfacePage)
    #expect(AtomTheme.standard.colors.statusInfo == AtomTokens.Color.statusInfo)
    #expect(AtomTheme.standard.colors.statusWarning == AtomTokens.Color.statusWarning)
  }

  @Test
  func resourceIntentsMirrorFoundationFeedbackSemantics() {
    #expect(
      AtomResourceIntent.allCases.map(\.rawValue) == ["loading", "content", "empty", "error"])
    #expect(
      AtomSyncIntent.allCases.map(\.rawValue)
        == ["idle", "refreshing", "synchronized", "stale", "offline", "failed"]
    )
    #expect(
      AtomPaginationIntent.allCases.map(\.rawValue)
        == ["idle", "loading", "failed", "exhausted"]
    )
    #expect(
      AtomPaginationIntent.allCases.map(\.semanticTone)
        == [.neutral, .info, .error, .success]
    )
  }

  @Test
  func noticeTonesCoverProductFeedbackSemantics() {
    #expect(
      AtomNoticeTone.allCases.map(\.rawValue)
        == ["info", "success", "warning", "error"]
    )
  }

  @Test
  func generatedComponentContractsCoverCrossRendererRecipes() {
    #expect(!AtomComponentContracts.all.isEmpty)
    #expect(AtomComponentContracts.all.count == AtomRendererConformance.verified.count)

    let skeleton = AtomComponentContracts.contract(catalogItem: "skeleton")
    #expect(skeleton?.parity == .recipe)
    #expect(skeleton?.requiredStates == ["loading", "reduced-motion"])
    #expect(skeleton?.motion?.kind == "shimmer")
    #expect(skeleton?.motion?.durationToken == "motion-skeleton-shimmer")
    #expect(skeleton?.motion?.reducedMotion == "static")

    let pagination = AtomComponentContracts.contract(catalogItem: "pagination")
    #expect(pagination?.intent.contains("next collection segment") == true)
    #expect(
      pagination?.stateTones
        == ["idle": "neutral", "loading": "info", "failed": "error", "exhausted": "success"]
    )
    #expect(pagination?.sharedOutcomes.contains("failure-provides-retry") == true)
    #expect(pagination?.platformAdaptations.react.isEmpty == false)
    #expect(pagination?.platformAdaptations.swiftUI.isEmpty == false)
  }

  @Test
  func motionPreferencePreservesSystemIntentAndSupportsReducedPreview() {
    #expect(AtomMotionPreference.system.resolvesReduceMotion(systemValue: false) == false)
    #expect(AtomMotionPreference.system.resolvesReduceMotion(systemValue: true) == true)
    #expect(AtomMotionPreference.reduced.resolvesReduceMotion(systemValue: false) == true)
  }

  @Test
  func formPresentationContextsCoverNativeContainerOwnership() {
    #expect(
      AtomFormPresentation.allCases == [.standalone, .grouped, .sheet]
    )
  }
}
