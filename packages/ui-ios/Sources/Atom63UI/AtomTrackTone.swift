import SwiftUI

/// The semantic tint shared by value tracks. Accent calls attention to one of
/// the view's primary cues; neutral uses the primary text color.
public enum AtomTrackTone: String, CaseIterable, Sendable {
  case accent
  case neutral
}

extension AtomTrackTone {
  func color(theme: AtomTheme, colorScheme: ColorScheme) -> Color {
    switch self {
    case .accent:
      theme.colors.actionPrimary.resolve(for: colorScheme)
    case .neutral:
      theme.colors.textPrimary.resolve(for: colorScheme)
    }
  }
}

private struct AtomSliderToneModifier: ViewModifier {
  @Environment(\.atomTheme) private var theme
  @Environment(\.colorScheme) private var colorScheme

  let tone: AtomTrackTone

  func body(content: Content) -> some View {
    content.tint(tone.color(theme: theme, colorScheme: colorScheme))
  }
}

extension View {
  /// Applies Atom63's accent or neutral value-track tint to a native `Slider`.
  public func atomSliderTone(_ tone: AtomTrackTone = .accent) -> some View {
    modifier(AtomSliderToneModifier(tone: tone))
  }
}
