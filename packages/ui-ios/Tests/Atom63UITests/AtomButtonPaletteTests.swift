import SwiftUI
import Testing

@testable import Atom63UI

struct AtomButtonPaletteTests {
  private let theme = AtomTheme.standard

  private func palette(
    _ tone: AtomButtonTone,
    _ emphasis: AtomButtonEmphasis,
    isEnabled: Bool,
    colorScheme: ColorScheme = .light
  ) -> AtomButtonPalette {
    AtomButtonPalette(
      tone: tone,
      emphasis: emphasis,
      theme: theme,
      colorScheme: colorScheme,
      isEnabled: isEnabled
    )
  }

  @Test(arguments: [ColorScheme.light, .dark])
  func disabledPrimaryUsesTheNeutralDisabledColors(colorScheme: ColorScheme) {
    // As on the web: a disabled primary is a neutral fill with muted text, not a paler accent.
    let disabled = palette(.primary, .solid, isEnabled: false, colorScheme: colorScheme)
    #expect(
      disabled.background(isPressed: false)
        == theme.colors.actionDisabledBackground.resolve(for: colorScheme))
    #expect(disabled.foreground == theme.colors.actionDisabledForeground.resolve(for: colorScheme))
    #expect(
      disabled.background(isPressed: false)
        != theme.colors.actionPrimary.resolve(for: colorScheme))
  }

  @Test
  func disabledOutlineTakesTheDisabledBorder() {
    let disabled = palette(.neutral, .outline, isEnabled: false)
    #expect(disabled.border == theme.colors.actionDisabledBorder.resolve(for: .light))
    #expect(
      disabled.background(isPressed: false) == theme.colors.actionDisabledBackground.resolve(for: .light))
  }

  @Test
  func disabledGhostKeepsItsClearFill() {
    let disabled = palette(.neutral, .ghost, isEnabled: false)
    #expect(disabled.background(isPressed: false) == .clear)
    #expect(disabled.foreground != theme.colors.actionDisabledForeground.resolve(for: .light))
  }

  @Test
  func enabledButtonsKeepTheirToneColors() {
    let enabled = palette(.primary, .solid, isEnabled: true)
    #expect(enabled.background(isPressed: false) == theme.colors.actionPrimary.resolve(for: .light))
    #expect(enabled.foreground == theme.colors.actionPrimaryForeground.resolve(for: .light))
  }
}
