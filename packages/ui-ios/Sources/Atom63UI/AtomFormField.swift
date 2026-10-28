import SwiftUI

/// The standalone text-field chrome. Grouped and sheet presentations keep
/// their container-owned row treatment for either value.
public enum AtomFieldVariant: String, CaseIterable, Sendable {
  case `default`
  case filled
}

public struct AtomFormField<Content: View>: View {
  @Environment(\.atomTheme) private var theme
  @Environment(\.colorScheme) private var colorScheme
  @Environment(\.atomFormPresentation) private var presentation
  @Environment(\.colorSchemeContrast) private var accessibilityContrast

  private let title: String
  private let supportingText: String?
  private let errorMessage: String?
  private let isFocused: Bool
  private let variant: AtomFieldVariant
  private let content: Content

  public init(
    _ title: String,
    supportingText: String? = nil,
    errorMessage: String? = nil,
    isFocused: Bool = false,
    variant: AtomFieldVariant = .default,
    @ViewBuilder content: () -> Content
  ) {
    self.title = title
    self.supportingText = supportingText
    self.errorMessage = errorMessage
    self.isFocused = isFocused
    self.variant = variant
    self.content = content()
  }

  public var body: some View {
    VStack(alignment: .leading, spacing: fieldSpacing) {
      Text(title)
        .font(.subheadline)
        .fontWeight(.medium)
        .foregroundStyle(theme.colors.textPrimary.resolve(for: colorScheme))
        .accessibilityHidden(true)

      styledContent

      if let message = errorMessage ?? supportingText {
        Text(message)
          .font(.footnote)
          .foregroundStyle(messageColor)
          .accessibilityLabel(errorMessage == nil ? message : "Error: \(message)")
      }
    }
  }

  @ViewBuilder
  private var styledContent: some View {
    switch presentation {
    case .standalone:
      content
        .font(.body)
        .foregroundColor(theme.colors.textPrimary.resolve(for: colorScheme))
        .textFieldStyle(.plain)
        .padding(.horizontal, AtomTokens.Space.x3)
        .padding(.vertical, AtomTokens.Space.x2)
        .frame(maxWidth: .infinity, minHeight: 44, alignment: .leading)
        .background(standaloneBackground)
        .overlay {
          RoundedRectangle(cornerRadius: AtomTokens.Radius.large)
            .strokeBorder(borderColor, lineWidth: standaloneBorderWidth)
        }
        .compositingGroup()
        .clipShape(.rect(cornerRadius: AtomTokens.Radius.large))
    case .grouped, .sheet:
      content
        .font(.body)
        .foregroundColor(theme.colors.textPrimary.resolve(for: colorScheme))
        .textFieldStyle(.plain)
        .padding(.vertical, AtomTokens.Space.x1)
        .frame(maxWidth: .infinity, minHeight: 44, alignment: .leading)
        .overlay(alignment: .bottom) {
          if isFocused || errorMessage != nil {
            Rectangle()
              .fill(borderColor)
              .frame(height: emphasisLineWidth)
              .accessibilityHidden(true)
          }
        }
    }
  }

  private var fieldSpacing: CGFloat {
    presentation == .standalone ? AtomTokens.Space.x2 : AtomTokens.Space.x1
  }

  private var borderColor: Color {
    if errorMessage != nil {
      return theme.colors.actionDanger.resolve(for: colorScheme)
    }
    if isFocused {
      return theme.colors.actionPrimary.resolve(for: colorScheme)
    }
    if variant == .filled, presentation == .standalone {
      return .clear
    }
    return theme.colors.borderInput.resolve(for: colorScheme)
  }

  private var standaloneBorderWidth: CGFloat {
    if isFocused || errorMessage != nil {
      return emphasisLineWidth
    }
    return accessibilityContrast == .increased ? 2 : 1
  }

  private var standaloneBackground: Color {
    switch variant {
    case .default:
      theme.colors.surfaceControl.resolve(for: colorScheme)
    case .filled:
      theme.colors.surfaceMuted.resolve(for: colorScheme)
    }
  }

  private var emphasisLineWidth: CGFloat {
    accessibilityContrast == .increased ? 3 : 2
  }

  private var messageColor: Color {
    if errorMessage != nil {
      return theme.colors.actionDanger.resolve(for: colorScheme)
    }
    return theme.colors.textSecondary.resolve(for: colorScheme)
  }
}
