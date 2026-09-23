import SwiftUI

public struct AtomTextEditor: View {
  @Environment(\.atomTheme) private var theme
  @Environment(\.colorScheme) private var colorScheme
  @FocusState private var isFocused: Bool

  @Binding private var text: String
  private let title: String
  private let prompt: String?
  private let supportingText: String?
  private let errorMessage: String?
  private let minHeight: CGFloat

  public init(
    _ title: String,
    text: Binding<String>,
    prompt: String? = nil,
    supportingText: String? = nil,
    errorMessage: String? = nil,
    minHeight: CGFloat = 112
  ) {
    self.title = title
    _text = text
    self.prompt = prompt
    self.supportingText = supportingText
    self.errorMessage = errorMessage
    self.minHeight = minHeight
  }

  public var body: some View {
    AtomFormField(
      title,
      supportingText: supportingText,
      errorMessage: errorMessage,
      isFocused: isFocused
    ) {
      ZStack(alignment: .topLeading) {
        if text.isEmpty, let prompt {
          Text(prompt)
            .foregroundStyle(theme.colors.textSecondary.resolve(for: colorScheme))
            .padding(.horizontal, 5)
            .padding(.vertical, 8)
            .accessibilityHidden(true)
        }

        TextEditor(text: $text)
          .scrollContentBackground(.hidden)
          .frame(minHeight: minHeight)
          .focused($isFocused)
          .accessibilityLabel(title)
          .accessibilityHint(accessibilityHint)
      }
    }
  }

  private var accessibilityHint: String {
    if let errorMessage {
      return "Error: \(errorMessage)"
    }
    return supportingText ?? ""
  }
}
