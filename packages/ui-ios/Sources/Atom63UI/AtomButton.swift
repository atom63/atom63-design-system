import SwiftUI

// AtomButtonTone, AtomButtonEmphasis, AtomButtonVariant and AtomControlSize are
// generated from the button contract in AtomComponentIntent.generated.swift.

/// The button's outline. `round` is a capsule: a circle at the icon size and a
/// pill when the button has a label. Mirrors the web Button's `shape` axis.
public enum AtomButtonShape: String, CaseIterable, Sendable {
  case `default`
  case round
}

public struct AtomButton<Label: View>: View {
  @Environment(\.atomTheme) private var theme
  @Environment(\.colorScheme) private var colorScheme

  private let tone: AtomButtonTone
  private let emphasis: AtomButtonEmphasis
  private let size: AtomControlSize
  private let shape: AtomButtonShape
  private let fullWidth: Bool
  private let isLoading: Bool
  private let loadingAccessibilityLabel: String
  private let action: () -> Void
  private let label: Label

  public init(
    tone: AtomButtonTone = .neutral,
    emphasis: AtomButtonEmphasis = .solid,
    size: AtomControlSize = .regular,
    shape: AtomButtonShape = .default,
    fullWidth: Bool = false,
    isLoading: Bool = false,
    loadingAccessibilityLabel: String = "Loading",
    action: @escaping () -> Void,
    @ViewBuilder label: () -> Label
  ) {
    self.tone = tone
    self.emphasis = emphasis
    self.size = size
    self.shape = shape
    self.fullWidth = fullWidth
    self.isLoading = isLoading
    self.loadingAccessibilityLabel = loadingAccessibilityLabel
    self.action = action
    self.label = label()
  }

  @available(*, deprecated, message: "Use tone and emphasis.")
  public init(
    variant: AtomButtonVariant,
    size: AtomControlSize = .regular,
    fullWidth: Bool = false,
    isLoading: Bool = false,
    loadingAccessibilityLabel: String = "Loading",
    action: @escaping () -> Void,
    @ViewBuilder label: () -> Label
  ) {
    self.init(
      tone: variant.tone,
      emphasis: variant.emphasis,
      size: size,
      fullWidth: fullWidth,
      isLoading: isLoading,
      loadingAccessibilityLabel: loadingAccessibilityLabel,
      action: action,
      label: label
    )
  }

  public var body: some View {
    Button(action: action) {
      label
        .lineLimit(2)
        .opacity(isLoading ? 0 : 1)
        .overlay {
          ProgressView()
            .tint(palette.foreground)
            .opacity(isLoading ? 1 : 0)
            .accessibilityHidden(true)
        }
        .frame(maxWidth: fullWidth && size != .icon ? .infinity : nil)
    }
    .buttonStyle(AtomButtonStyle(tone: tone, emphasis: emphasis, size: size, shape: shape))
    .disabled(isLoading)
    .environment(\.atomButtonIsLoading, isLoading)
    .accessibilityValue(isLoading ? loadingAccessibilityLabel : "")
    .accessibilityAddTraits(isLoading ? .updatesFrequently : [])
  }

  private var palette: AtomButtonPalette {
    AtomButtonPalette(tone: tone, emphasis: emphasis, theme: theme, colorScheme: colorScheme)
  }
}

extension AtomButton where Label == Text {
  public init(
    _ title: String,
    tone: AtomButtonTone = .neutral,
    emphasis: AtomButtonEmphasis = .solid,
    size: AtomControlSize = .regular,
    shape: AtomButtonShape = .default,
    fullWidth: Bool = false,
    isLoading: Bool = false,
    loadingAccessibilityLabel: String = "Loading",
    action: @escaping () -> Void
  ) {
    self.init(
      tone: tone,
      emphasis: emphasis,
      size: size,
      shape: shape,
      fullWidth: fullWidth,
      isLoading: isLoading,
      loadingAccessibilityLabel: loadingAccessibilityLabel,
      action: action
    ) {
      Text(title)
    }
  }

  @available(*, deprecated, message: "Use tone and emphasis.")
  public init(
    _ title: String,
    variant: AtomButtonVariant,
    size: AtomControlSize = .regular,
    fullWidth: Bool = false,
    isLoading: Bool = false,
    loadingAccessibilityLabel: String = "Loading",
    action: @escaping () -> Void
  ) {
    self.init(
      title,
      tone: variant.tone,
      emphasis: variant.emphasis,
      size: size,
      fullWidth: fullWidth,
      isLoading: isLoading,
      loadingAccessibilityLabel: loadingAccessibilityLabel,
      action: action
    )
  }
}

/// The Atom63 button look, for a native `Button`:
/// `Button("Save", action: save).buttonStyle(AtomButtonStyle(tone: .primary))`.
/// `AtomButton` uses it and adds the loading state and full-width layout.
public struct AtomButtonStyle: ButtonStyle {
  @Environment(\.isEnabled) private var isEnabled
  @Environment(\.atomButtonIsLoading) private var isLoading
  @Environment(\.colorSchemeContrast) private var accessibilityContrast
  @Environment(\.atomTheme) private var theme
  @Environment(\.colorScheme) private var colorScheme
  @Environment(\.accessibilityReduceMotion) private var systemReduceMotion
  @Environment(\.atomMotionPreference) private var motionPreference

  private let tone: AtomButtonTone
  private let emphasis: AtomButtonEmphasis
  private let size: AtomControlSize
  private let shape: AtomButtonShape

  public init(
    tone: AtomButtonTone = .neutral,
    emphasis: AtomButtonEmphasis = .solid,
    size: AtomControlSize = .regular,
    shape: AtomButtonShape = .default
  ) {
    self.tone = tone
    self.emphasis = emphasis
    self.size = size
    self.shape = shape
  }

  public func makeBody(configuration: Configuration) -> some View {
    let reduceMotion = motionPreference.resolvesReduceMotion(systemValue: systemReduceMotion)
    return configuration.label
      .font(font)
      .fontWeight(.semibold)
      .foregroundStyle(foreground(isPressed: configuration.isPressed))
      .padding(.horizontal, horizontalPadding)
      .padding(.vertical, AtomTokens.Space.x2)
      .frame(minHeight: minimumHeight)
      .background(palette.background(isPressed: configuration.isPressed))
      .overlay {
        outline
          .strokeBorder(palette.border, lineWidth: borderWidth)
      }
      .compositingGroup()
      .clipShape(outline)
      .shadow(
        color: shadowColor(isPressed: configuration.isPressed),
        radius: shadowRadius(isPressed: configuration.isPressed),
        y: shadowY(isPressed: configuration.isPressed)
      )
      .scaleEffect(configuration.isPressed ? AtomTokens.Control.pressScale : 1)
      // Loading disables the button too, but keeps its fill and fades the whole
      // control as before; a plain disabled button takes the disabled colors.
      .opacity(!isEnabled && isLoading ? AtomTokens.Control.disabledOpacity : 1)
      .animation(
        reduceMotion ? nil : .timingCurve(
          AtomTokens.Motion.emphasizedControlPoints.0,
          AtomTokens.Motion.emphasizedControlPoints.1,
          AtomTokens.Motion.emphasizedControlPoints.2,
          AtomTokens.Motion.emphasizedControlPoints.3,
          duration: AtomTokens.Motion.controlFeedback
        ),
        value: configuration.isPressed
      )
      // Rendered geometry above, interaction floor here. Expanding the hit
      // region instead of the box is what lets a 36pt control stay 36pt while
      // still satisfying the 44pt HIG target.
      .frame(minHeight: AtomTokens.Control.minTouchTarget)
      .contentShape(.rect)
  }

  private var palette: AtomButtonPalette {
    AtomButtonPalette(
      tone: tone,
      emphasis: emphasis,
      theme: theme,
      colorScheme: colorScheme,
      isEnabled: isEnabled || isLoading
    )
  }

  private func foreground(isPressed: Bool) -> Color {
    if isPressed, tone == .muted, emphasis == .ghost {
      return theme.colors.textPrimary.resolve(for: colorScheme)
    }
    return palette.foreground
  }

  private var font: Font {
    switch size {
    case .compact:
      .subheadline
    case .regular, .icon:
      .body
    case .large:
      .headline
    }
  }

  private var minimumHeight: CGFloat {
    switch size {
    case .compact:
      AtomTokens.Control.Height.xs
    case .regular:
      AtomTokens.Control.Height.md
    case .large:
      AtomTokens.Control.Height.lg
    case .icon:
      // Square controls stay at the interaction floor: small in BOTH axes, so
      // the "wide button, short height" argument does not apply. Matches the
      // web recipe, which keeps icon sizes floored by --a63-control-min-target.
      AtomTokens.Control.minTouchTarget
    }
  }

  private var horizontalPadding: CGFloat {
    switch size {
    case .compact:
      AtomTokens.Control.PaddingInline.xs
    case .regular:
      AtomTokens.Control.PaddingInline.md
    case .large:
      AtomTokens.Control.PaddingInline.lg
    case .icon:
      AtomTokens.Control.PaddingInline.xs
    }
  }

  /// A capsule when round (SwiftUI caps the radius at half the shorter side);
  /// otherwise the size's corner radius, as before.
  private var outline: some InsettableShape {
    RoundedRectangle(cornerRadius: shape == .round ? 9999 : cornerRadius)
  }

  private var cornerRadius: CGFloat {
    switch size {
    case .compact:
      AtomTokens.Radius.medium
    case .regular, .icon:
      AtomTokens.Radius.large
    case .large:
      AtomTokens.Radius.extraLarge
    }
  }

  private var borderWidth: CGFloat {
    guard emphasis == .outline else { return 0 }
    return accessibilityContrast == .increased ? 2 : 1
  }

  private func shadowColor(isPressed: Bool) -> Color {
    guard emphasis == .raised, isEnabled else { return .clear }
    return theme.colors.textPrimary.resolve(for: colorScheme).opacity(isPressed ? 0.08 : 0.14)
  }

  private func shadowRadius(isPressed: Bool) -> CGFloat {
    guard emphasis == .raised, isEnabled else { return 0 }
    return isPressed ? 4 : 8
  }

  private func shadowY(isPressed: Bool) -> CGFloat {
    guard emphasis == .raised, isEnabled else { return 0 }
    return isPressed ? 2 : 4
  }
}

extension EnvironmentValues {
  /// Set by `AtomButton` while loading, so its style keeps the loading look
  /// instead of the disabled colors.
  @Entry var atomButtonIsLoading = false
}

/// Colors for one tone × emphasis. Solid fills with the tone; soft tints it (the
/// neutral tone uses the muted surface); outline and ghost leave the fill clear,
/// outline adding a border. Off the solid fill, a neutral label is the primary
/// text color and a primary or destructive one takes the tone's color.
///
/// Disabled, as on the web: solid, soft and outline buttons take the neutral
/// `actionDisabled*` colors; a ghost button keeps its clear fill and fades its label.
struct AtomButtonPalette {
  let tone: AtomButtonTone
  let emphasis: AtomButtonEmphasis
  let theme: AtomTheme
  let colorScheme: ColorScheme
  var isEnabled = true

  private var usesDisabledColors: Bool { !isEnabled && emphasis != .ghost }

  var foreground: Color {
    if usesDisabledColors {
      return theme.colors.actionDisabledForeground.resolve(for: colorScheme)
    }
    if !isEnabled {
      return enabledForeground.opacity(AtomTokens.Control.disabledOpacity)
    }
    return enabledForeground
  }

  private var enabledForeground: Color {
    switch (emphasis, tone) {
    case (.solid, .neutral), (.solid, .muted):
      theme.colors.actionNeutralForeground.resolve(for: colorScheme)
    case (.solid, .primary):
      theme.colors.actionPrimaryForeground.resolve(for: colorScheme)
    case (.solid, .destructive):
      theme.colors.actionDangerForeground.resolve(for: colorScheme)
    case (.ghost, .muted):
      theme.colors.textSecondary.resolve(for: colorScheme)
    case (_, .neutral), (_, .muted):
      theme.colors.textPrimary.resolve(for: colorScheme)
    case (_, .primary):
      theme.colors.actionPrimary.resolve(for: colorScheme)
    case (_, .destructive):
      theme.colors.actionDanger.resolve(for: colorScheme)
    }
  }

  func background(isPressed: Bool) -> Color {
    if usesDisabledColors {
      return theme.colors.actionDisabledBackground.resolve(for: colorScheme)
    }
    switch (emphasis, tone) {
    case (.solid, .neutral), (.solid, .muted):
      return theme.colors.actionNeutral.resolve(for: colorScheme)
    case (.solid, .primary):
      let token = isPressed ? theme.colors.actionPrimaryPressed : theme.colors.actionPrimary
      return token.resolve(for: colorScheme)
    case (.solid, .destructive):
      return theme.colors.actionDanger.resolve(for: colorScheme)
    case (.soft, .neutral), (.soft, .muted):
      return theme.colors.surfaceMuted.resolve(for: colorScheme)
    case (.soft, .primary):
      return theme.colors.actionPrimary.resolve(for: colorScheme).opacity(0.1)
    case (.soft, .destructive):
      return theme.colors.actionDanger.resolve(for: colorScheme).opacity(0.1)
    case (.raised, _):
      return theme.colors.surfacePanel.resolve(for: colorScheme)
    case (.outline, _), (.ghost, _):
      return .clear
    }
  }

  var border: Color {
    guard emphasis == .outline else { return .clear }
    if usesDisabledColors {
      return theme.colors.actionDisabledBorder.resolve(for: colorScheme)
    }
    switch tone {
    case .neutral, .muted:
      return theme.colors.borderControl.resolve(for: colorScheme)
    case .primary:
      return theme.colors.actionPrimary.resolve(for: colorScheme)
    case .destructive:
      return theme.colors.actionDanger.resolve(for: colorScheme)
    }
  }
}
