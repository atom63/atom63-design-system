import SwiftUI

public struct AtomProgressView: View {
  @Environment(\.atomTheme) private var theme
  @Environment(\.colorScheme) private var colorScheme

  private let title: String
  private let message: String?
  private let value: Double?
  private let total: Double

  public init(
    _ title: String,
    message: String? = nil,
    value: Double? = nil,
    total: Double = 1
  ) {
    self.title = title
    self.message = message
    self.value = value
    self.total = total
  }

  public var body: some View {
    VStack(alignment: .leading, spacing: AtomTokens.Space.x2) {
      HStack(spacing: AtomTokens.Space.x3) {
        if value == nil {
          ProgressView()
            .controlSize(.small)
            .accessibilityHidden(true)
        }

        VStack(alignment: .leading, spacing: AtomTokens.Space.x1) {
          Text(title)
            .font(.subheadline.weight(.semibold))
            .foregroundStyle(theme.colors.textPrimary.resolve(for: colorScheme))

          if let message {
            Text(message)
              .font(.footnote)
              .foregroundStyle(theme.colors.textSecondary.resolve(for: colorScheme))
          }
        }
        .frame(maxWidth: .infinity, alignment: .leading)

        if let value {
          Text(progressFraction(value), format: .percent.precision(.fractionLength(0)))
            .font(.footnote.monospacedDigit())
            .foregroundStyle(theme.colors.textSecondary.resolve(for: colorScheme))
            .accessibilityHidden(true)
        }
      }

      if let value {
        ProgressView(value: value, total: total)
          .tint(theme.colors.actionPrimary.resolve(for: colorScheme))
          .accessibilityHidden(true)
      }
    }
    .accessibilityElement(children: .combine)
    .accessibilityValue(accessibilityValue)
    .accessibilityAddTraits(value == nil ? .updatesFrequently : [])
  }

  private var accessibilityValue: String {
    guard let value else { return "In progress" }
    return progressFraction(value).formatted(.percent.precision(.fractionLength(0)))
  }

  private func progressFraction(_ value: Double) -> Double {
    guard total > 0 else { return 0 }
    return min(max(value / total, 0), 1)
  }
}
