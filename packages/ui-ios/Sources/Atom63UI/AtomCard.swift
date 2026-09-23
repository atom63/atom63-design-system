import SwiftUI

public struct AtomCard<Content: View>: View {
  @Environment(\.atomTheme) private var theme
  @Environment(\.colorScheme) private var colorScheme

  private let action: (() -> Void)?
  @ViewBuilder private let content: Content

  public init(
    action: (() -> Void)? = nil,
    @ViewBuilder content: () -> Content
  ) {
    self.action = action
    self.content = content()
  }

  public var body: some View {
    Group {
      if let action {
        Button(action: action) {
          cardContent
        }
        .buttonStyle(.plain)
      } else {
        cardContent
      }
    }
  }

  private var cardContent: some View {
    content
      .padding(AtomTokens.Space.x4)
      .frame(maxWidth: .infinity, alignment: .leading)
      .background(theme.colors.surfacePanel.resolve(for: colorScheme))
      .overlay {
        RoundedRectangle(cornerRadius: AtomTokens.Radius.extraLarge)
          .strokeBorder(
            theme.colors.borderSubtle.resolve(for: colorScheme),
            lineWidth: 1
          )
      }
      .compositingGroup()
      .clipShape(.rect(cornerRadius: AtomTokens.Radius.extraLarge))
  }
}
