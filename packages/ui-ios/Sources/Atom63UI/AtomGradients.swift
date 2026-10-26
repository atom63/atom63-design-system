import SwiftUI

/// The web gradient tokens (`--a63-gradient-*`), drawn from a theme's colors so
/// they follow its skin, brand, surface and the color scheme.
/// Scripts/generate-swift-tokens.mjs pins each CSS gradient and fails when one
/// changes, so these stay in step with the web.
extension AtomThemeColors {
  /// `--a63-gradient-brand`: brand 500 to 700 at 135°, for heroes and banners.
  public func brandGradient(for colorScheme: ColorScheme) -> LinearGradient {
    LinearGradient(
      colors: [brand500.resolve(for: colorScheme), brand700.resolve(for: colorScheme)],
      startPoint: .topLeading,
      endPoint: .bottomTrailing
    )
  }

  /// `--a63-gradient-brand-subtle`: brand 50 to 100 at 135°, for quiet
  /// illustration backgrounds and cards.
  public func brandSubtleGradient(for colorScheme: ColorScheme) -> LinearGradient {
    LinearGradient(
      colors: [brand50.resolve(for: colorScheme), brand100.resolve(for: colorScheme)],
      startPoint: .topLeading,
      endPoint: .bottomTrailing
    )
  }

  /// `--a63-gradient-brand-fade`: a hero that fades from the brand into the page.
  /// Brand 800 at the top, brand 700 at the end of the dark zone
  /// (`AtomTokens.Gradient.brandFadeDarkZone`), then `surfacePage`. Overlay
  /// controls and on-media labels belong in the dark zone only; content over the
  /// faded part uses the page colors.
  public func brandFadeGradient(for colorScheme: ColorScheme) -> LinearGradient {
    LinearGradient(
      stops: [
        .init(color: brand800.resolve(for: colorScheme), location: 0),
        .init(
          color: brand700.resolve(for: colorScheme),
          location: AtomTokens.Gradient.brandFadeDarkZone
        ),
        .init(color: surfacePage.resolve(for: colorScheme), location: 1),
      ],
      startPoint: .top,
      endPoint: .bottom
    )
  }
}

extension AtomTokens.Gradient {
  /// `--a63-gradient-scrim`: a vertical fade to dark under text laid over a
  /// photo. The same in every theme and mode.
  public static var scrim: LinearGradient {
    LinearGradient(
      colors: [scrimEnd.color.opacity(0), scrimEnd.color],
      startPoint: .top,
      endPoint: .bottom
    )
  }
}
