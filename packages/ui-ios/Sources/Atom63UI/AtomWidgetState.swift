import SwiftUI

/// The feedback a widget shows instead of its content: the same three states
/// as the web's `WidgetStateFeedback` in @atom63/widgets.
public enum AtomWidgetState: String, CaseIterable, Sendable {
  case loading
  case empty
  case error

  /// Which state a widget shows, if any. An error wins over loading, so a
  /// failed refresh never sits behind a spinner; emptiness counts only once
  /// the data settles. The same order as `resolveWidgetFeedbackState` on the web.
  public static func resolve(hasError: Bool, isLoading: Bool, isEmpty: Bool) -> AtomWidgetState? {
    if hasError { return .error }
    if isLoading { return .loading }
    if isEmpty { return .empty }
    return nil
  }
}

/// A widget's loading, empty or error state, sized for a tile. It draws no
/// chrome, so it sits inside an `AtomWidgetCard` or a WidgetKit widget alike.
///
/// The error state shows its description under the title, where the web opens
/// it in a popover, and a "Try again" button when `onRetry` is set. A WidgetKit
/// widget leaves `onRetry` out: its buttons need an App Intent.
public struct AtomWidgetStateView: View {
  @Environment(\.atomTheme) private var theme
  @Environment(\.colorScheme) private var colorScheme

  private let state: AtomWidgetState
  private let title: String
  private let description: String?
  private let onRetry: (() -> Void)?

  public init(
    _ state: AtomWidgetState,
    title: String,
    description: String? = nil,
    onRetry: (() -> Void)? = nil
  ) {
    self.state = state
    self.title = title
    self.description = description
    self.onRetry = onRetry
  }

  public var body: some View {
    VStack(spacing: AtomTokens.Space.x2) {
      symbol
        .font(.title3)
        .foregroundStyle(symbolColor)
        .accessibilityHidden(true)
      VStack(spacing: AtomTokens.Space.x1) {
        Text(title)
          .font(.footnote.weight(.semibold))
        if let description {
          Text(description)
            .font(.caption)
            .foregroundStyle(theme.colors.textSecondary.resolve(for: colorScheme))
            .lineLimit(3)
        }
      }
      .multilineTextAlignment(.center)
      .accessibilityElement(children: .combine)
      .accessibilityAddTraits(state == .loading ? .updatesFrequently : [])
      if state == .error, let onRetry {
        AtomButton(variant: .outline, size: .compact, action: onRetry) {
          Label("Try again", systemImage: "arrow.clockwise")
        }
      }
    }
    .frame(maxWidth: .infinity, maxHeight: .infinity)
  }

  @ViewBuilder private var symbol: some View {
    switch state {
    case .loading:
      ProgressView()
    case .empty:
      Image(systemName: "tray")
    case .error:
      Image(systemName: "exclamationmark.triangle")
    }
  }

  private var symbolColor: Color {
    state == .error
      ? theme.colors.actionDanger.resolve(for: colorScheme)
      : theme.colors.textSecondary.resolve(for: colorScheme)
  }
}
