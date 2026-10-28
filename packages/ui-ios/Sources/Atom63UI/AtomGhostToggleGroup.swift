import SwiftUI

public enum AtomToggleGroupOrientation: String, CaseIterable, Sendable {
  case horizontal
  case vertical
}

/// A quiet group of peer filters. Use a segmented `Picker` for the joined
/// segmented variant; this type mirrors ToggleGroup's ghost recipe.
public struct AtomGhostToggleGroup<Content: View>: View {
  private let orientation: AtomToggleGroupOrientation
  @ViewBuilder private let content: Content

  public init(
    orientation: AtomToggleGroupOrientation = .horizontal,
    @ViewBuilder content: () -> Content
  ) {
    self.orientation = orientation
    self.content = content()
  }

  public var body: some View {
    layout {
      content
    }
    .accessibilityElement(children: .contain)
  }

  private var layout: AnyLayout {
    switch orientation {
    case .horizontal:
      AnyLayout(HStackLayout(spacing: AtomTokens.Space.x1))
    case .vertical:
      AnyLayout(VStackLayout(alignment: .leading, spacing: AtomTokens.Space.x1))
    }
  }
}

public struct AtomGhostToggleGroupItem<Label: View>: View {
  private let isSelected: Bool
  private let action: () -> Void
  @ViewBuilder private let label: Label

  public init(
    isSelected: Bool,
    action: @escaping () -> Void,
    @ViewBuilder label: () -> Label
  ) {
    self.isSelected = isSelected
    self.action = action
    self.label = label()
  }

  public var body: some View {
    Button(action: action) {
      label
    }
    .buttonStyle(AtomGhostToggleGroupItemStyle(isSelected: isSelected))
    .accessibilityAddTraits(isSelected ? .isSelected : [])
  }
}

extension AtomGhostToggleGroupItem where Label == Text {
  public init(_ title: String, isSelected: Bool, action: @escaping () -> Void) {
    self.init(isSelected: isSelected, action: action) {
      Text(title)
    }
  }
}

private struct AtomGhostToggleGroupItemStyle: ButtonStyle {
  @Environment(\.atomTheme) private var theme
  @Environment(\.colorScheme) private var colorScheme
  @Environment(\.isEnabled) private var isEnabled

  let isSelected: Bool

  func makeBody(configuration: Configuration) -> some View {
    configuration.label
      .font(.subheadline.weight(.medium))
      .foregroundStyle(foreground(isPressed: configuration.isPressed))
      .padding(.horizontal, AtomTokens.Space.x3)
      .padding(.vertical, AtomTokens.Space.x2)
      .frame(minHeight: AtomTokens.Control.minTouchTarget)
      .background(background(isPressed: configuration.isPressed))
      .clipShape(.rect(cornerRadius: AtomTokens.Radius.medium))
      .opacity(isEnabled ? 1 : AtomTokens.Control.disabledOpacity)
      .contentShape(.rect)
  }

  private func foreground(isPressed: Bool) -> Color {
    let token = isSelected || isPressed ? theme.colors.textPrimary : theme.colors.textSecondary
    return token.resolve(for: colorScheme)
  }

  private func background(isPressed: Bool) -> Color {
    guard isSelected || isPressed else { return .clear }
    return theme.colors.surfaceMuted.resolve(for: colorScheme)
  }
}
