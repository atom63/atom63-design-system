import SwiftUI

public struct AtomIconButton: View {
  private let title: String
  private let systemImage: String
  private let variant: AtomButtonVariant
  private let isLoading: Bool
  private let action: () -> Void

  public init(
    _ title: String,
    systemImage: String,
    variant: AtomButtonVariant = .ghost,
    isLoading: Bool = false,
    action: @escaping () -> Void
  ) {
    self.title = title
    self.systemImage = systemImage
    self.variant = variant
    self.isLoading = isLoading
    self.action = action
  }

  public var body: some View {
    AtomButton(
      variant: variant,
      size: .icon,
      isLoading: isLoading,
      loadingAccessibilityLabel: "Loading",
      action: action
    ) {
      Label(title, systemImage: systemImage)
        .labelStyle(.iconOnly)
        .dynamicTypeSize(...DynamicTypeSize.accessibility2)
    }
    .accessibilityLabel(title)
  }
}
