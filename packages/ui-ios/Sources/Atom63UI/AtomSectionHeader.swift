import SwiftUI

public struct AtomSectionHeader: View {
  @Environment(\.atomTheme) private var theme
  @Environment(\.colorScheme) private var colorScheme
  @Environment(\.atomDensity) private var density

  private let title: String
  private let subtitle: String?
  private let actionTitle: String?
  private let action: (() -> Void)?

  public init(
    _ title: String,
    subtitle: String? = nil,
    actionTitle: String? = nil,
    action: (() -> Void)? = nil
  ) {
    self.title = title
    self.subtitle = subtitle
    self.actionTitle = actionTitle
    self.action = action
  }

  public var body: some View {
    HStack(alignment: .firstTextBaseline, spacing: density.space(AtomTokens.Space.x3)) {
      VStack(alignment: .leading, spacing: density.space(AtomTokens.Space.x1)) {
        Text(title)
          .font(.system(density.textStyle(.headline), weight: .semibold))
          .foregroundStyle(theme.colors.textPrimary.resolve(for: colorScheme))
          .accessibilityAddTraits(.isHeader)

        if let subtitle {
          Text(subtitle)
            .font(.system(density.textStyle(.footnote)))
            .foregroundStyle(theme.colors.textSecondary.resolve(for: colorScheme))
        }
      }
      .frame(maxWidth: .infinity, alignment: .leading)

      if let actionTitle, let action {
        Button(actionTitle, action: action)
          .font(.system(density.textStyle(.subheadline), weight: .semibold))
      }
    }
  }
}
