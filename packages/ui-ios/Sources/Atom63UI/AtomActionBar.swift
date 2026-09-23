import SwiftUI

public struct AtomActionBar: View {
  @Environment(\.atomTheme) private var theme
  @Environment(\.colorScheme) private var colorScheme
  @Environment(\.dynamicTypeSize) private var dynamicTypeSize

  private let primaryTitle: String
  private let primaryVariant: AtomButtonVariant
  private let isPrimaryLoading: Bool
  private let primaryAction: () -> Void
  private let secondaryTitle: String?
  private let secondaryAction: (() -> Void)?

  public init(
    primaryTitle: String,
    primaryVariant: AtomButtonVariant = .primary,
    isPrimaryLoading: Bool = false,
    primaryAction: @escaping () -> Void,
    secondaryTitle: String? = nil,
    secondaryAction: (() -> Void)? = nil
  ) {
    self.primaryTitle = primaryTitle
    self.primaryVariant = primaryVariant
    self.isPrimaryLoading = isPrimaryLoading
    self.primaryAction = primaryAction
    self.secondaryTitle = secondaryTitle
    self.secondaryAction = secondaryAction
  }

  public var body: some View {
    Group {
      if dynamicTypeSize.isAccessibilitySize {
        VStack(spacing: AtomTokens.Space.x2) {
          primaryButton
          secondaryButton
        }
      } else {
        HStack(spacing: AtomTokens.Space.x3) {
          secondaryButton
          primaryButton
        }
      }
    }
    .padding(AtomTokens.Space.x3)
    .background(theme.colors.surfacePanel.resolve(for: colorScheme))
    .overlay(alignment: .top) {
      Rectangle()
        .fill(theme.colors.borderSubtle.resolve(for: colorScheme))
        .frame(height: 1)
    }
  }

  private var primaryButton: some View {
    AtomButton(
      primaryTitle,
      variant: primaryVariant,
      fullWidth: true,
      isLoading: isPrimaryLoading,
      action: primaryAction
    )
  }

  @ViewBuilder
  private var secondaryButton: some View {
    if let secondaryTitle, let secondaryAction {
      AtomButton(
        secondaryTitle,
        variant: .outline,
        fullWidth: true,
        action: secondaryAction
      )
    }
  }
}
