import SwiftUI

public enum AtomFormMessageTone: Sendable {
  case info
  case success
  case error
}

public struct AtomFormMessage: View {
  @Environment(\.atomTheme) private var theme
  @Environment(\.colorScheme) private var colorScheme

  private let title: String
  private let message: String
  private let tone: AtomFormMessageTone

  public init(
    _ title: String,
    message: String,
    tone: AtomFormMessageTone = .info
  ) {
    self.title = title
    self.message = message
    self.tone = tone
  }

  public var body: some View {
    Label {
      VStack(alignment: .leading, spacing: AtomTokens.Space.x1) {
        Text(title)
          .font(.subheadline)
          .fontWeight(.semibold)
          .foregroundStyle(theme.colors.textPrimary.resolve(for: colorScheme))

        Text(message)
          .font(.footnote)
          .foregroundStyle(theme.colors.textSecondary.resolve(for: colorScheme))
      }
    } icon: {
      Image(systemName: systemImage)
        .foregroundStyle(tint)
        .accessibilityHidden(true)
    }
    .frame(maxWidth: .infinity, alignment: .leading)
    .padding(AtomTokens.Space.x3)
    .background(theme.colors.surfaceMuted.resolve(for: colorScheme))
    .overlay {
      RoundedRectangle(cornerRadius: AtomTokens.Radius.large)
        .strokeBorder(theme.colors.borderSubtle.resolve(for: colorScheme))
    }
    .compositingGroup()
    .clipShape(.rect(cornerRadius: AtomTokens.Radius.large))
    .accessibilityElement(children: .combine)
    .onAppear {
      if tone != .info {
        AtomAccessibility.announce("\(title). \(message)")
      }
    }
  }

  private var tint: Color {
    switch tone {
    case .info:
      theme.colors.actionPrimary.resolve(for: colorScheme)
    case .success:
      theme.colors.statusSuccess.resolve(for: colorScheme)
    case .error:
      theme.colors.actionDanger.resolve(for: colorScheme)
    }
  }

  private var systemImage: String {
    switch tone {
    case .info:
      "info.circle.fill"
    case .success:
      "checkmark.circle.fill"
    case .error:
      "exclamationmark.triangle.fill"
    }
  }
}
