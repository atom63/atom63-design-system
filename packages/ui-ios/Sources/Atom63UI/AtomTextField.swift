import SwiftUI

public struct AtomTextField: View {
  @Environment(\.atomTheme) private var theme
  @Environment(\.colorScheme) private var colorScheme
  @FocusState private var isFocused: Bool

  @Binding private var text: String
  private let title: String
  private let prompt: String?
  private let supportingText: String?
  private let isSecure: Bool
  private let errorMessage: String?

  public init(
    _ title: String,
    text: Binding<String>,
    prompt: String? = nil,
    supportingText: String? = nil,
    isSecure: Bool = false,
    errorMessage: String? = nil
  ) {
    self.title = title
    _text = text
    self.prompt = prompt
    self.supportingText = supportingText
    self.isSecure = isSecure
    self.errorMessage = errorMessage
  }

  public var body: some View {
    AtomFormField(
      title,
      supportingText: supportingText,
      errorMessage: errorMessage,
      isFocused: isFocused
    ) {
      field
        .textFieldStyle(.plain)
        .focused($isFocused)
        .accessibilityLabel(title)
        .accessibilityHint(accessibilityHint)
    }
  }

  @ViewBuilder
  private var field: some View {
    if isSecure {
      SecureField(title, text: $text, prompt: promptText)
    } else {
      TextField(title, text: $text, prompt: promptText)
    }
  }

  private var promptText: Text? {
    prompt.map {
      Text($0)
        .foregroundColor(theme.colors.textSecondary.resolve(for: colorScheme))
    }
  }

  private var accessibilityHint: String {
    if let errorMessage {
      return "Error: \(errorMessage)"
    }
    return supportingText ?? ""
  }
}
