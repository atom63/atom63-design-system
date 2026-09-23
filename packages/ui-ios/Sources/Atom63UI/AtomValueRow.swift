import SwiftUI

public struct AtomValueRow: View {
  @Environment(\.atomTheme) private var theme
  @Environment(\.colorScheme) private var colorScheme
  @Environment(\.dynamicTypeSize) private var dynamicTypeSize

  private let title: String
  private let value: String
  private let systemImage: String?

  public init(
    _ title: String,
    value: String,
    systemImage: String? = nil
  ) {
    self.title = title
    self.value = value
    self.systemImage = systemImage
  }

  public var body: some View {
    Group {
      if dynamicTypeSize.isAccessibilitySize {
        VStack(alignment: .leading, spacing: AtomTokens.Space.x2) {
          label
          valueText
        }
      } else {
        HStack(spacing: AtomTokens.Space.x3) {
          label
          Spacer(minLength: AtomTokens.Space.x3)
          valueText
        }
      }
    }
    .padding(.vertical, AtomTokens.Space.x1)
    .accessibilityElement(children: .combine)
  }

  private var label: some View {
    Label {
      Text(title)
        .foregroundStyle(theme.colors.textPrimary.resolve(for: colorScheme))
    } icon: {
      if let systemImage {
        Image(systemName: systemImage)
          .foregroundStyle(theme.colors.actionPrimary.resolve(for: colorScheme))
      }
    }
  }

  private var valueText: some View {
    Text(value)
      .font(.subheadline)
      .foregroundStyle(theme.colors.textSecondary.resolve(for: colorScheme))
      .multilineTextAlignment(dynamicTypeSize.isAccessibilitySize ? .leading : .trailing)
  }
}
