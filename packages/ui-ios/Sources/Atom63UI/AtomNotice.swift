import SwiftUI

public enum AtomNoticeTone: String, CaseIterable, Sendable {
  case info
  case success
  case warning
  case error
}

public struct AtomNotice: View {
  @Environment(\.atomTheme) private var theme
  @Environment(\.colorScheme) private var colorScheme
  @Environment(\.colorSchemeContrast) private var accessibilityContrast

  private let title: String
  private let message: String?
  private let tone: AtomNoticeTone
  private let actionTitle: String?
  private let action: (() -> Void)?

  public init(
    _ title: String,
    message: String? = nil,
    tone: AtomNoticeTone = .info,
    actionTitle: String? = nil,
    action: (() -> Void)? = nil
  ) {
    self.title = title
    self.message = message
    self.tone = tone
    self.actionTitle = actionTitle
    self.action = action
  }

  public var body: some View {
    HStack(alignment: .top, spacing: AtomTokens.Space.x3) {
      Image(systemName: systemImage)
        .font(.body.weight(.semibold))
        .dynamicTypeSize(...DynamicTypeSize.accessibility2)
        .foregroundStyle(tint)
        .frame(minWidth: 24, minHeight: 24)
        .accessibilityHidden(true)

      VStack(alignment: .leading, spacing: AtomTokens.Space.x1) {
        Text(title)
          .font(.subheadline.weight(.semibold))
          .foregroundStyle(theme.colors.textPrimary.resolve(for: colorScheme))
          .accessibilityLabel("\(accessibilityTone): \(title)")

        if let message {
          Text(message)
            .font(.footnote)
            .foregroundStyle(theme.colors.textSecondary.resolve(for: colorScheme))
            .fixedSize(horizontal: false, vertical: true)
        }
      }
      .frame(maxWidth: .infinity, alignment: .leading)

      if let actionTitle, let action {
        Button(actionTitle, action: action)
          .font(.subheadline.weight(.semibold))
          .buttonStyle(.plain)
          .foregroundStyle(tint)
          .frame(minWidth: 44, minHeight: 44)
      }
    }
    .padding(AtomTokens.Space.x3)
    .background(theme.colors.surfaceMuted.resolve(for: colorScheme))
    .overlay {
      RoundedRectangle(cornerRadius: AtomTokens.Radius.large)
        .strokeBorder(
          tint.opacity(accessibilityContrast == .increased ? 0.7 : 0.35),
          lineWidth: accessibilityContrast == .increased ? 2 : 1
        )
    }
    .compositingGroup()
    .clipShape(.rect(cornerRadius: AtomTokens.Radius.large))
    .accessibilityElement(children: .contain)
  }

  private var systemImage: String {
    semanticTone.systemImage
  }

  private var accessibilityTone: String {
    semanticTone.accessibilityLabel
  }

  private var tint: Color {
    semanticTone.tint(in: theme, colorScheme: colorScheme)
  }

  private var semanticTone: AtomSemanticTone {
    switch tone {
    case .info:
      .info
    case .success:
      .success
    case .warning:
      .warning
    case .error:
      .error
    }
  }
}
