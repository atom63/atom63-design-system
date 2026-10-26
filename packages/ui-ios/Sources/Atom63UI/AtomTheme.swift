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
  /// The border of a form field: 3:1 against the page, the panel and the field
  /// fill (WCAG 1.4.11). Decorative edges keep `borderControl`.
  public var borderInput: AtomDynamicColor
  public var actionPrimary: AtomDynamicColor
  public var actionPrimaryPressed: AtomDynamicColor
  public var actionPrimaryForeground: AtomDynamicColor
  public var actionNeutral: AtomDynamicColor
  public var actionNeutralForeground: AtomDynamicColor
  public var actionDanger: AtomDynamicColor
  public var actionDangerForeground: AtomDynamicColor
  /// A disabled button's neutral fill, label and border, so it reads as
  /// unavailable rather than as a paler accent.
  public var actionDisabledBackground: AtomDynamicColor
  public var actionDisabledForeground: AtomDynamicColor
  public var actionDisabledBorder: AtomDynamicColor
  public var statusInfo: AtomDynamicColor
  public var statusSuccess: AtomDynamicColor
  public var statusWarning: AtomDynamicColor
  public var selectionTrackOff: AtomDynamicColor
  public var selectionThumb: AtomDynamicColor
  public var skeletonHighlight: AtomDynamicColor
  public var widgetBackground: AtomDynamicColor
  public var widgetForeground: AtomDynamicColor
  public var widgetBorder: AtomDynamicColor
  public var widgetRim: AtomDynamicColor
  /// Brand ramp steps (`--a63-brand-*`) that the brand gradients draw; see
  /// `brandGradient`, `brandSubtleGradient` and `brandFadeGradient(for:)`.
  public var brand50: AtomDynamicColor
  public var brand100: AtomDynamicColor
  public var brand500: AtomDynamicColor
  public var brand700: AtomDynamicColor
  public var brand800: AtomDynamicColor
}

public struct AtomTheme: Equatable, Sendable {
  public var colors: AtomThemeColors
  /// The web theme the colors come from. Geometry that varies by theme, such as
  /// the widget rim, reads it.
  public var skin: AtomSkin

  public init(colors: AtomThemeColors, skin: AtomSkin = .modern) {
    self.colors = colors
    self.skin = skin
  }

  /// The colors the web renders for a skin, brand and surface. The defaults
  /// equal `.standard`.
  public init(skin: AtomSkin = .modern, brand: AtomBrand = .b1, surface: AtomSurface = .n1) {
    self.init(colors: AtomThemeColors(skin: skin, brand: brand, surface: surface), skin: skin)
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
      borderInput: AtomTokens.Color.borderInput,
      actionPrimary: AtomTokens.Color.actionPrimary,
      actionPrimaryPressed: AtomTokens.Color.actionPrimaryPressed,
      actionPrimaryForeground: AtomTokens.Color.actionPrimaryForeground,
      actionNeutral: AtomTokens.Color.actionNeutral,
      actionNeutralForeground: AtomTokens.Color.actionNeutralForeground,
      actionDanger: AtomTokens.Color.actionDanger,
      actionDangerForeground: AtomTokens.Color.actionDangerForeground,
      actionDisabledBackground: AtomTokens.Color.actionDisabledBackground,
      actionDisabledForeground: AtomTokens.Color.actionDisabledForeground,
      actionDisabledBorder: AtomTokens.Color.actionDisabledBorder,
      statusInfo: AtomTokens.Color.statusInfo,
      statusSuccess: AtomTokens.Color.statusSuccess,
      statusWarning: AtomTokens.Color.statusWarning,
      selectionTrackOff: AtomTokens.Color.selectionTrackOff,
      selectionThumb: AtomTokens.Color.selectionThumb,
      skeletonHighlight: AtomTokens.Color.skeletonHighlight,
      widgetBackground: AtomTokens.Color.widgetBackground,
      widgetForeground: AtomTokens.Color.widgetForeground,
      widgetBorder: AtomTokens.Color.widgetBorder,
      widgetRim: AtomTokens.Color.widgetRim,
      brand50: AtomTokens.Color.brand50,
      brand100: AtomTokens.Color.brand100,
      brand500: AtomTokens.Color.brand500,
      brand700: AtomTokens.Color.brand700,
      brand800: AtomTokens.Color.brand800
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
