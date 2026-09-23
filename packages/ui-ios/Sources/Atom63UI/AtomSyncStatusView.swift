import SwiftUI

public struct AtomSyncStatusView: View {
  @Environment(\.atomTheme) private var theme
  @Environment(\.colorScheme) private var colorScheme

  private let intent: AtomSyncIntent

  public init(intent: AtomSyncIntent) {
    self.intent = intent
  }

  public var body: some View {
    HStack(spacing: AtomTokens.Space.x2) {
      if intent == .refreshing {
        ProgressView()
          .controlSize(.small)
          .accessibilityHidden(true)
      } else {
        Image(systemName: systemImage)
          .foregroundStyle(tint)
          .accessibilityHidden(true)
      }

      Text(title)
        .font(.footnote)
        .fontWeight(.medium)
        .foregroundStyle(theme.colors.textPrimary.resolve(for: colorScheme))

      Spacer(minLength: 0)
    }
    .padding(.horizontal, AtomTokens.Space.x3)
    .padding(.vertical, AtomTokens.Space.x2)
    .background(theme.colors.surfaceMuted.resolve(for: colorScheme))
    .accessibilityElement(children: .combine)
    .accessibilityLabel(title)
    .accessibilityAddTraits(
      intent == .refreshing ? .updatesFrequently : []
    )
  }

  private var title: String {
    switch intent {
    case .idle:
      "Not synchronized"
    case .refreshing:
      "Updating"
    case .synchronized:
      "Up to date"
    case .stale:
      "Showing saved data"
    case .offline:
      "Offline, showing saved data"
    case .failed:
      "Couldn’t synchronize"
    }
  }

  private var systemImage: String {
    switch intent {
    case .idle:
      "minus.circle"
    case .refreshing:
      "arrow.trianglehead.2.clockwise"
    case .synchronized:
      "checkmark.circle.fill"
    case .stale:
      "clock.badge.exclamationmark"
    case .offline:
      "wifi.slash"
    case .failed:
      "exclamationmark.triangle.fill"
    }
  }

  private var tint: Color {
    switch intent {
    case .idle:
      theme.colors.textSecondary.resolve(for: colorScheme)
    case .refreshing:
      theme.colors.actionPrimary.resolve(for: colorScheme)
    case .synchronized:
      theme.colors.statusSuccess.resolve(for: colorScheme)
    case .stale, .offline:
      theme.colors.statusWarning.resolve(for: colorScheme)
    case .failed:
      theme.colors.actionDanger.resolve(for: colorScheme)
    }
  }
}
