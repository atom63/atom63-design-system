import SwiftUI

public enum AtomBadgeTone: Sendable {
  case neutral
  case accent
  case success
  case warning
  case danger
}

public struct AtomBadge: View {
  @Environment(\.atomTheme) private var theme
  @Environment(\.colorScheme) private var colorScheme

  private let title: String
  private let tone: AtomBadgeTone

  public init(_ title: String, tone: AtomBadgeTone = .neutral) {
    self.title = title
    self.tone = tone
  }

  public var body: some View {
    Text(title)
      .font(.caption)
      .fontWeight(.semibold)
      .foregroundStyle(foregroundColor)
      .padding(.horizontal, AtomTokens.Space.x2)
      .padding(.vertical, AtomTokens.Space.x1)
      .background(backgroundColor)
      .clipShape(.capsule)
  }

  private var foregroundColor: Color {
    switch tone {
    case .neutral:
      theme.colors.textPrimary.resolve(for: colorScheme)
    case .accent:
      theme.colors.actionPrimaryForeground.resolve(for: colorScheme)
    case .success, .warning, .danger:
      theme.colors.textPrimary.resolve(for: colorScheme)
    }
  }

  private var backgroundColor: Color {
    switch tone {
    case .neutral:
      theme.colors.surfaceMuted.resolve(for: colorScheme)
    case .accent:
      theme.colors.actionPrimary.resolve(for: colorScheme)
    case .success:
      theme.colors.statusSuccess.resolve(for: colorScheme).opacity(0.14)
    case .warning:
      theme.colors.statusWarning.resolve(for: colorScheme).opacity(0.14)
    case .danger:
      theme.colors.actionDanger.resolve(for: colorScheme).opacity(0.14)
    }
  }
}
