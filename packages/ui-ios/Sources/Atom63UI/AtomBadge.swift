import SwiftUI

// AtomBadgeTone is generated from the badge contract in
// AtomComponentIntent.generated.swift; `danger` is a deprecated name for `error`.

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
    case .info, .success, .warning, .error:
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
    case .info:
      theme.colors.statusInfo.resolve(for: colorScheme).opacity(0.14)
    case .error:
      theme.colors.actionDanger.resolve(for: colorScheme).opacity(0.14)
    }
  }
}
