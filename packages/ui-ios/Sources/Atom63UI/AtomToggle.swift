import SwiftUI

public struct AtomToggle: View {
  @Environment(\.atomTheme) private var theme
  @Environment(\.colorScheme) private var colorScheme
  @Environment(\.dynamicTypeSize) private var dynamicTypeSize

  @Binding private var isOn: Bool
  private let title: String
  private let description: String?
  private let accessibilityIdentifier: String?

  public init(
    _ title: String,
    isOn: Binding<Bool>,
    description: String? = nil,
    accessibilityIdentifier: String? = nil
  ) {
    self.title = title
    _isOn = isOn
    self.description = description
    self.accessibilityIdentifier = accessibilityIdentifier
  }

  public var body: some View {
    Group {
      if dynamicTypeSize.isAccessibilitySize {
        VStack(alignment: .leading, spacing: AtomTokens.Space.x2) {
          label

          identified(
            Toggle(title, isOn: $isOn)
              .labelsHidden()
              .frame(maxWidth: .infinity, alignment: .trailing)
          )
        }
        .accessibilityRepresentation {
          identified(
            Toggle(title, isOn: $isOn)
              .accessibilityHint(description ?? "")
          )
        }
      } else {
        identified(
          Toggle(isOn: $isOn) {
            label
          }
        )
      }
    }
    .toggleStyle(.switch)
    .tint(theme.colors.actionPrimary.resolve(for: colorScheme))
    .frame(minHeight: 44)
  }

  private var label: some View {
    VStack(alignment: .leading, spacing: AtomTokens.Space.x1) {
      Text(title)
        .font(.body)
        .foregroundStyle(theme.colors.textPrimary.resolve(for: colorScheme))

      if let description {
        Text(description)
          .font(.footnote)
          .foregroundStyle(
            theme.colors.textSecondary.resolve(for: colorScheme)
          )
      }
    }
  }

  @ViewBuilder
  private func identified<Content: View>(_ content: Content) -> some View {
    if let accessibilityIdentifier {
      content.accessibilityIdentifier(accessibilityIdentifier)
    } else {
      content
    }
  }
}
