import SwiftUI
import Testing

@testable import Atom63UI

struct AtomVariantParityTests {
  private let theme = AtomTheme.standard

  @Test
  func fieldAndCardVariantsMatchTheSharedSubset() {
    #expect(AtomFieldVariant.allCases.map(\.rawValue) == ["default", "filled"])
    #expect(AtomCardVariant.allCases.map(\.rawValue) == ["default", "filled", "elevated"])
  }

  @Test
  func raisedButtonMapsToTheRaisedEmphasis() {
    #expect(AtomButtonVariant.raised.tone == .neutral)
    #expect(AtomButtonVariant.raised.emphasis == .raised)
  }

  @Test
  func mutedGhostUsesSecondaryTextAndNoFill() {
    let palette = AtomButtonPalette(
      tone: .muted,
      emphasis: .ghost,
      theme: theme,
      colorScheme: .light
    )

    #expect(palette.foreground == theme.colors.textSecondary.resolve(for: .light))
    #expect(palette.background(isPressed: false) == .clear)
  }

  @Test
  func trackTonesResolveToAccentAndNeutralColors() {
    #expect(
      AtomTrackTone.accent.color(theme: theme, colorScheme: .light)
        == theme.colors.actionPrimary.resolve(for: .light))
    #expect(
      AtomTrackTone.neutral.color(theme: theme, colorScheme: .light)
        == theme.colors.textPrimary.resolve(for: .light))
  }

  @Test
  func ghostToggleGroupSupportsBothContractOrientations() {
    #expect(
      AtomToggleGroupOrientation.allCases.map(\.rawValue)
        == ["horizontal", "vertical"])
  }
}
