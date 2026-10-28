import SwiftUI

public enum AtomCardVariant: String, CaseIterable, Sendable {
  case `default`
  case filled
  case elevated
}

public struct AtomCard<Content: View>: View {
  @Environment(\.atomTheme) private var theme
  @Environment(\.colorScheme) private var colorScheme

  private let action: (() -> Void)?
  private let variant: AtomCardVariant
  @ViewBuilder private let content: Content

  public init(
    action: (() -> Void)? = nil,
    variant: AtomCardVariant = .default,
    @ViewBuilder content: () -> Content
  ) {
    self.action = action
    self.variant = variant
    self.content = content()
  }

  public var body: some View {
    Group {
      if let action {
        Button(action: action) {
          cardContent
        }
        .buttonStyle(.plain)
      } else {
        cardContent
      }
    }
  }

  private var cardContent: some View {
    content
      .padding(AtomTokens.Space.x4)
      .frame(maxWidth: .infinity, alignment: .leading)
      .background(backgroundColor)
      .overlay {
        RoundedRectangle(cornerRadius: AtomTokens.Radius.extraLarge)
          .strokeBorder(
            borderColor,
            lineWidth: 1
          )
      }
      .compositingGroup()
      .clipShape(.rect(cornerRadius: AtomTokens.Radius.extraLarge))
      .shadow(color: shadowColor, radius: shadowRadius, y: shadowY)
  }

  private var backgroundColor: Color {
    switch variant {
    case .default, .elevated:
      theme.colors.surfacePanel.resolve(for: colorScheme)
    case .filled:
      theme.colors.surfaceMuted.resolve(for: colorScheme)
    }
  }

  private var borderColor: Color {
    variant == .default ? theme.colors.borderSubtle.resolve(for: colorScheme) : .clear
  }

  private var shadowColor: Color {
    variant == .elevated
      ? theme.colors.textPrimary.resolve(for: colorScheme).opacity(0.14)
      : .clear
  }

  private var shadowRadius: CGFloat {
    variant == .elevated ? 12 : 0
  }

  private var shadowY: CGFloat {
    variant == .elevated ? 4 : 0
  }
}
