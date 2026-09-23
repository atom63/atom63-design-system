import SwiftUI

public enum AtomButtonVariant: Sendable {
  case primary
  case neutral
  case secondary
  case destructive
  case outline
  case ghost
}

public enum AtomControlSize: Sendable {
  case compact
  case regular
  case large
  case icon
}

public struct AtomButton<Label: View>: View {
  @Environment(\.atomTheme) private var theme
  @Environment(\.colorScheme) private var colorScheme
  @Environment(\.accessibilityReduceMotion) private var reduceMotion
  @Environment(\.atomMotionPreference) private var motionPreference

  private let variant: AtomButtonVariant
  private let size: AtomControlSize
  private let fullWidth: Bool
  private let isLoading: Bool
  private let loadingAccessibilityLabel: String
  private let action: () -> Void
  private let label: Label

  public init(
    variant: AtomButtonVariant = .neutral,
    size: AtomControlSize = .regular,
    fullWidth: Bool = false,
    isLoading: Bool = false,
    loadingAccessibilityLabel: String = "Loading",
    action: @escaping () -> Void,
    @ViewBuilder label: () -> Label
  ) {
    self.variant = variant
    self.size = size
    self.fullWidth = fullWidth
    self.isLoading = isLoading
    self.loadingAccessibilityLabel = loadingAccessibilityLabel
    self.action = action
    self.label = label()
  }

  public var body: some View {
    Button(action: action) {
      label
        .font(font)
        .fontWeight(.semibold)
        .lineLimit(2)
        .opacity(isLoading ? 0 : 1)
        .overlay {
          ProgressView()
            .tint(foregroundColor)
            .opacity(isLoading ? 1 : 0)
            .accessibilityHidden(true)
        }
        .frame(maxWidth: fullWidth && size != .icon ? .infinity : nil)
    }
    .buttonStyle(
      AtomButtonStyle(
        variant: variant,
        minimumHeight: minimumHeight,
        horizontalPadding: horizontalPadding,
        cornerRadius: cornerRadius,
        theme: theme,
        colorScheme: colorScheme,
        reduceMotion: motionPreference.resolvesReduceMotion(systemValue: reduceMotion)
      )
    )
    .disabled(isLoading)
    .accessibilityValue(isLoading ? loadingAccessibilityLabel : "")
    .accessibilityAddTraits(isLoading ? .updatesFrequently : [])
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

  private var foregroundColor: Color {
    switch variant {
    case .primary:
      theme.colors.actionPrimaryForeground.resolve(for: colorScheme)
    case .neutral:
      theme.colors.actionNeutralForeground.resolve(for: colorScheme)
    case .destructive:
      theme.colors.actionDangerForeground.resolve(for: colorScheme)
    case .secondary, .outline, .ghost:
      theme.colors.textPrimary.resolve(for: colorScheme)
    }
  }
}

extension AtomButton where Label == Text {
  public init(
    _ title: String,
    variant: AtomButtonVariant = .neutral,
    size: AtomControlSize = .regular,
    fullWidth: Bool = false,
    isLoading: Bool = false,
    loadingAccessibilityLabel: String = "Loading",
    action: @escaping () -> Void
  ) {
    self.init(
      variant: variant,
      size: size,
      fullWidth: fullWidth,
      isLoading: isLoading,
      loadingAccessibilityLabel: loadingAccessibilityLabel,
      action: action
    ) {
      Text(title)
    }
  }
}

private struct AtomButtonStyle: ButtonStyle {
  @Environment(\.isEnabled) private var isEnabled
  @Environment(\.colorSchemeContrast) private var accessibilityContrast

  let variant: AtomButtonVariant
  let minimumHeight: CGFloat
  let horizontalPadding: CGFloat
  let cornerRadius: CGFloat
  let theme: AtomTheme
  let colorScheme: ColorScheme
  let reduceMotion: Bool

  func makeBody(configuration: Configuration) -> some View {
    configuration.label
      .foregroundStyle(foregroundColor)
      .padding(.horizontal, horizontalPadding)
      .padding(.vertical, AtomTokens.Space.x2)
      .frame(minHeight: minimumHeight)
      .background(backgroundColor(configuration: configuration))
      .overlay {
        RoundedRectangle(cornerRadius: cornerRadius)
          .strokeBorder(borderColor, lineWidth: borderWidth)
      }
      .compositingGroup()
      .clipShape(.rect(cornerRadius: cornerRadius))
      .scaleEffect(configuration.isPressed ? AtomTokens.Control.pressScale : 1)
      .opacity(isEnabled ? 1 : AtomTokens.Control.disabledOpacity)
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

  private var foregroundColor: Color {
    switch variant {
    case .primary:
      theme.colors.actionPrimaryForeground.resolve(for: colorScheme)
    case .neutral:
      theme.colors.actionNeutralForeground.resolve(for: colorScheme)
    case .destructive:
      theme.colors.actionDangerForeground.resolve(for: colorScheme)
    case .secondary, .outline, .ghost:
      theme.colors.textPrimary.resolve(for: colorScheme)
    }
  }

  private func backgroundColor(configuration: Configuration) -> Color {
    switch variant {
    case .primary:
      let token =
        configuration.isPressed
        ? theme.colors.actionPrimaryPressed
        : theme.colors.actionPrimary
      return token.resolve(for: colorScheme)
    case .neutral:
      return theme.colors.actionNeutral.resolve(for: colorScheme)
    case .secondary:
      return theme.colors.surfaceMuted.resolve(for: colorScheme)
    case .destructive:
      return theme.colors.actionDanger.resolve(for: colorScheme)
    case .outline, .ghost:
      return .clear
    }
  }

  private var borderColor: Color {
    variant == .outline
      ? theme.colors.borderControl.resolve(for: colorScheme)
      : .clear
  }

  private var borderWidth: CGFloat {
    guard variant == .outline else { return 0 }
    return accessibilityContrast == .increased ? 2 : 1
  }
}
