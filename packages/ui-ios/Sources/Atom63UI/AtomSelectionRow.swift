import SwiftUI

public struct AtomSelectionRow: View {
  @Environment(\.atomTheme) private var theme
  @Environment(\.colorScheme) private var colorScheme

  private let title: String
  private let subtitle: String?
  private let isSelected: Bool
  private let action: () -> Void

  public init(
    _ title: String,
    subtitle: String? = nil,
    isSelected: Bool,
    action: @escaping () -> Void
  ) {
    self.title = title
    self.subtitle = subtitle
    self.isSelected = isSelected
    self.action = action
  }

  public var body: some View {
    Button(action: action) {
      HStack(spacing: AtomTokens.Space.x3) {
        VStack(alignment: .leading, spacing: AtomTokens.Space.x1) {
          Text(title)
            .foregroundStyle(theme.colors.textPrimary.resolve(for: colorScheme))

          if let subtitle {
            Text(subtitle)
              .font(.footnote)
              .foregroundStyle(theme.colors.textSecondary.resolve(for: colorScheme))
          }
        }
        .frame(maxWidth: .infinity, alignment: .leading)

        Image(systemName: isSelected ? "checkmark.circle.fill" : "circle")
          .foregroundStyle(
            isSelected
              ? theme.colors.actionPrimary.resolve(for: colorScheme)
              : theme.colors.textSecondary.resolve(for: colorScheme)
          )
          .accessibilityHidden(true)
      }
      .frame(minHeight: 44)
      .contentShape(.rect)
    }
    .buttonStyle(.plain)
    .accessibilityAddTraits(isSelected ? .isSelected : [])
  }
}
