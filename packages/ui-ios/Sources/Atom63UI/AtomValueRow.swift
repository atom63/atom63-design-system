import SwiftUI

/// A label with its value at the trailing edge. `emphasizesValue` draws the value in the primary
/// text color and a semibold weight; `showsDisclosure` adds a chevron for a row that navigates,
/// such as a `NavigationLink` label inside a `ScrollView` or an `AtomListSection`. Inside a
/// `List`, a `NavigationLink` draws its own chevron, so leave `showsDisclosure` off there.
public struct AtomValueRow: View {
  @Environment(\.atomTheme) private var theme
  @Environment(\.colorScheme) private var colorScheme
  @Environment(\.dynamicTypeSize) private var dynamicTypeSize

  private let title: String
  private let value: String
  private let systemImage: String?
  private let emphasizesValue: Bool
  private let showsDisclosure: Bool

  public init(
    _ title: String,
    value: String,
    systemImage: String? = nil,
    emphasizesValue: Bool = false,
    showsDisclosure: Bool = false
  ) {
    self.title = title
    self.value = value
    self.systemImage = systemImage
    self.emphasizesValue = emphasizesValue
    self.showsDisclosure = showsDisclosure
  }

  public var body: some View {
    HStack(spacing: AtomTokens.Space.x3) {
      if dynamicTypeSize.isAccessibilitySize {
        VStack(alignment: .leading, spacing: AtomTokens.Space.x2) {
          label
          valueText
        }
        .frame(maxWidth: .infinity, alignment: .leading)
      } else {
        label
        Spacer(minLength: AtomTokens.Space.x3)
        valueText
      }

      if showsDisclosure {
        Image(systemName: "chevron.forward")
          .font(.footnote.weight(.semibold))
          .foregroundStyle(theme.colors.textSecondary.resolve(for: colorScheme))
          .accessibilityHidden(true)
      }
    }
    .padding(.vertical, AtomTokens.Space.x1)
    .atomListRowInsets()
    .contentShape(.rect)
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
      .fontWeight(emphasizesValue ? .semibold : nil)
      .foregroundStyle(
        (emphasizesValue ? theme.colors.textPrimary : theme.colors.textSecondary)
          .resolve(for: colorScheme)
      )
      .multilineTextAlignment(dynamicTypeSize.isAccessibilitySize ? .leading : .trailing)
  }
}
