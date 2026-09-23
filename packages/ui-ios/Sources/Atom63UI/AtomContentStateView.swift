import SwiftUI

public enum AtomContentStateTone: Sendable {
  case neutral
  case error
}

public struct AtomContentStateView: View {
  @Environment(\.atomTheme) private var theme
  @Environment(\.colorScheme) private var colorScheme

  private let title: String
  private let message: String
  private let systemImage: String
  private let tone: AtomContentStateTone
  private let actionTitle: String?
  private let action: (() -> Void)?

  public init(
    title: String,
    message: String,
    systemImage: String,
    tone: AtomContentStateTone = .neutral,
    actionTitle: String? = nil,
    action: (() -> Void)? = nil
  ) {
    self.title = title
    self.message = message
    self.systemImage = systemImage
    self.tone = tone
    self.actionTitle = actionTitle
    self.action = action
  }

  public var body: some View {
    ContentUnavailableView {
      Label(title, systemImage: systemImage)
        .foregroundStyle(iconColor)
    } description: {
      Text(message)
    } actions: {
      if let actionTitle, let action {
        AtomButton(actionTitle, variant: tone == .error ? .destructive : .primary) {
          action()
        }
      }
    }
  }

  private var iconColor: Color {
    switch tone {
    case .neutral:
      theme.colors.textSecondary.resolve(for: colorScheme)
    case .error:
      theme.colors.actionDanger.resolve(for: colorScheme)
    }
  }
}
