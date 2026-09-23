import SwiftUI

public struct AtomChip: View {
  @Environment(\.atomTheme) private var theme
  @Environment(\.colorScheme) private var colorScheme
  @Environment(\.colorSchemeContrast) private var accessibilityContrast

  private let title: String
  private let systemImage: String?
  private let isSelected: Bool
  private let action: () -> Void

  public init(
    _ title: String,
    systemImage: String? = nil,
    isSelected: Bool = false,
    action: @escaping () -> Void
  ) {
    self.title = title
    self.systemImage = systemImage
    self.isSelected = isSelected
    self.action = action
  }

  public var body: some View {
    Button(action: action) {
      Label {
        Text(title)
      } icon: {
        if let systemImage {
          Image(systemName: systemImage)
        }
      }
      .font(.subheadline.weight(.medium))
      .padding(.horizontal, AtomTokens.Space.x3)
      .padding(.vertical, AtomTokens.Space.x2)
      .foregroundStyle(foregroundColor)
      .background(backgroundColor)
      .overlay {
        Capsule()
          .strokeBorder(
            borderColor,
            lineWidth: accessibilityContrast == .increased ? 2 : 1
          )
      }
      .compositingGroup()
      .clipShape(.capsule)
      .frame(minHeight: 44)
      .contentShape(.rect)
    }
    .buttonStyle(.plain)
    .accessibilityAddTraits(isSelected ? .isSelected : [])
  }

  private var foregroundColor: Color {
    isSelected
      ? theme.colors.actionPrimaryForeground.resolve(for: colorScheme)
      : theme.colors.textPrimary.resolve(for: colorScheme)
  }

  private var backgroundColor: Color {
    isSelected
      ? theme.colors.actionPrimary.resolve(for: colorScheme)
      : theme.colors.surfaceMuted.resolve(for: colorScheme)
  }

  private var borderColor: Color {
    isSelected
      ? .clear
      : theme.colors.borderControl.resolve(for: colorScheme)
  }
}
