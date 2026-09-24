import SwiftUI

public struct AtomThemeColors: Equatable, Sendable {
  public var surfacePage: AtomDynamicColor
  public var surfacePanel: AtomDynamicColor
  public var surfaceMuted: AtomDynamicColor
  public var surfaceControl: AtomDynamicColor
  public var textPrimary: AtomDynamicColor
  public var textSecondary: AtomDynamicColor
  public var borderSubtle: AtomDynamicColor
  public var borderControl: AtomDynamicColor
  public var actionPrimary: AtomDynamicColor
  public var actionPrimaryPressed: AtomDynamicColor
  public var actionPrimaryForeground: AtomDynamicColor
  public var actionNeutral: AtomDynamicColor
  public var actionNeutralForeground: AtomDynamicColor
  public var actionDanger: AtomDynamicColor
  public var actionDangerForeground: AtomDynamicColor
  public var statusInfo: AtomDynamicColor
  public var statusSuccess: AtomDynamicColor
  public var statusWarning: AtomDynamicColor
  public var selectionTrackOff: AtomDynamicColor
  public var selectionThumb: AtomDynamicColor
  public var skeletonHighlight: AtomDynamicColor
}

public struct AtomTheme: Equatable, Sendable {
  public var colors: AtomThemeColors

  public init(colors: AtomThemeColors) {
    self.colors = colors
  }

  /// The colors the web renders for a skin, brand and surface. The defaults
  /// equal `.standard`.
  public init(skin: AtomSkin = .modern, brand: AtomBrand = .b1, surface: AtomSurface = .n1) {
    self.init(colors: AtomThemeColors(skin: skin, brand: brand, surface: surface))
  }

  public static let standard = AtomTheme(
    colors: AtomThemeColors(
      surfacePage: AtomTokens.Color.surfacePage,
      surfacePanel: AtomTokens.Color.surfacePanel,
      surfaceMuted: AtomTokens.Color.surfaceMuted,
      surfaceControl: AtomTokens.Color.surfaceControl,
      textPrimary: AtomTokens.Color.textPrimary,
      textSecondary: AtomTokens.Color.textSecondary,
      borderSubtle: AtomTokens.Color.borderSubtle,
      borderControl: AtomTokens.Color.borderControl,
      actionPrimary: AtomTokens.Color.actionPrimary,
      actionPrimaryPressed: AtomTokens.Color.actionPrimaryPressed,
      actionPrimaryForeground: AtomTokens.Color.actionPrimaryForeground,
      actionNeutral: AtomTokens.Color.actionNeutral,
      actionNeutralForeground: AtomTokens.Color.actionNeutralForeground,
      actionDanger: AtomTokens.Color.actionDanger,
      actionDangerForeground: AtomTokens.Color.actionDangerForeground,
      statusInfo: AtomTokens.Color.statusInfo,
      statusSuccess: AtomTokens.Color.statusSuccess,
      statusWarning: AtomTokens.Color.statusWarning,
      selectionTrackOff: AtomTokens.Color.selectionTrackOff,
      selectionThumb: AtomTokens.Color.selectionThumb,
      skeletonHighlight: AtomTokens.Color.skeletonHighlight
    )
  )
}

extension EnvironmentValues {
  @Entry public var atomTheme: AtomTheme = .standard
}

extension View {
  public func atomTheme(_ theme: AtomTheme) -> some View {
    environment(\.atomTheme, theme)
  }
}
