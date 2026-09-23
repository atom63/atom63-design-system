import SwiftUI

public struct AtomLoadMoreView: View {
  @Environment(\.atomTheme) private var theme
  @Environment(\.colorScheme) private var colorScheme

  private let intent: AtomPaginationIntent
  private let loadMore: () -> Void

  public init(
    intent: AtomPaginationIntent,
    loadMore: @escaping () -> Void
  ) {
    self.intent = intent
    self.loadMore = loadMore
  }

  public var body: some View {
    Group {
      switch intent {
      case .idle:
        Button("Load more", action: loadMore)
          .font(.subheadline.weight(.semibold))
      case .loadingMore:
        HStack(spacing: AtomTokens.Space.x2) {
          ProgressView()
            .controlSize(.small)
            .tint(intent.semanticTone.tint(in: theme, colorScheme: colorScheme))
            .accessibilityHidden(true)
          Text("Loading more")
            .foregroundStyle(theme.colors.textSecondary.resolve(for: colorScheme))
        }
        .accessibilityElement(children: .combine)
        .accessibilityValue("In progress")
      case .failed:
        AtomNotice(
          "Couldn’t load more",
          message: "Check the connection and try again.",
          tone: .error,
          actionTitle: "Retry",
          action: loadMore
        )
      case .exhausted:
        Label {
          Text("All items loaded")
            .foregroundStyle(theme.colors.textSecondary.resolve(for: colorScheme))
        } icon: {
          Image(systemName: intent.semanticTone.systemImage)
            .foregroundStyle(intent.semanticTone.tint(in: theme, colorScheme: colorScheme))
            .accessibilityHidden(true)
        }
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(intent.semanticTone.accessibilityLabel): All items loaded")
      }
    }
    .font(.footnote)
    .frame(maxWidth: .infinity, minHeight: 44)
    .padding(.vertical, AtomTokens.Space.x3)
    .accessibilityAddTraits(
      intent == .loadingMore ? .updatesFrequently : []
    )
  }
}
