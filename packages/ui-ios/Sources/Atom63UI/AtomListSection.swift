import SwiftUI

/// A grouped inset list section: its rows on one rounded panel with dividers between them,
/// and an optional header and footer, as in iOS Settings. The SwiftUI side of
/// `ItemGroup variant="inset"`.
///
/// Use it inside a `ScrollView` and `VStack`. Inside a `List` or `Form`, use the native
/// `Section` instead: the list already draws the inset group, its dividers and the chevrons
/// of its `NavigationLink` rows.
///
/// ```swift
/// AtomListSection("Preferences", footer: "Applies to every device.") {
///   NavigationLink(value: Route.currency) {
///     AtomValueRow("Currency", value: "USD", showsDisclosure: true)
///   }
///   AtomToggle("Notifications", isOn: $notifications)
/// }
/// ```
public struct AtomListSection<Content: View>: View {
  @Environment(\.atomTheme) private var theme
  @Environment(\.colorScheme) private var colorScheme

  private let header: String?
  private let footer: String?
  private let content: Content

  public init(
    _ header: String? = nil,
    footer: String? = nil,
    @ViewBuilder content: () -> Content
  ) {
    self.header = header
    self.footer = footer
    self.content = content()
  }

  public var body: some View {
    VStack(alignment: .leading, spacing: AtomTokens.Space.x2) {
      if let header {
        AtomSectionHeader(header)
          .padding(.horizontal, AtomTokens.Space.x4)
      }

      rows
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(theme.colors.surfacePanel.resolve(for: colorScheme))
        .clipShape(.rect(cornerRadius: AtomTokens.Radius.large))

      if let footer {
        Text(footer)
          .font(.footnote)
          .foregroundStyle(theme.colors.textSecondary.resolve(for: colorScheme))
          .padding(.horizontal, AtomTokens.Space.x4)
      }
    }
    .frame(maxWidth: .infinity, alignment: .leading)
    .accessibilityElement(children: .contain)
  }

  @ViewBuilder private var rows: some View {
    let divider = AtomListSectionDivider(
      color: theme.colors.borderSubtle.resolve(for: colorScheme)
    )
    if #available(iOS 18.0, macOS 15.0, *) {
      Group(subviews: content) { subviews in
        VStack(spacing: 0) {
          ForEach(subviews) { subview in
            if subview.id != subviews.first?.id { divider }
            AtomListSectionRow { subview }
          }
        }
      }
    } else {
      // iOS 17 has no public way to walk a view builder's children.
      _VariadicView.Tree(AtomListSectionLegacyRows(divider: divider)) { content }
    }
  }
}

private struct AtomListSectionRow<Row: View>: View {
  @ViewBuilder let row: Row

  var body: some View {
    row
      .padding(.horizontal, AtomTokens.Space.x4)
      .padding(.vertical, AtomTokens.Space.x2)
      .frame(
        maxWidth: .infinity,
        minHeight: AtomTokens.Control.minTouchTarget,
        alignment: .leading
      )
  }
}

/// A hairline that starts at the rows' leading inset and runs to the trailing edge.
private struct AtomListSectionDivider: View {
  let color: Color

  var body: some View {
    Rectangle()
      .fill(color)
      .frame(height: 1)
      .padding(.leading, AtomTokens.Space.x4)
      .accessibilityHidden(true)
  }
}

private struct AtomListSectionLegacyRows: _VariadicView_MultiViewRoot {
  let divider: AtomListSectionDivider

  func body(children: _VariadicView.Children) -> some View {
    VStack(spacing: 0) {
      ForEach(children) { child in
        if child.id != children.first?.id { divider }
        AtomListSectionRow { child }
      }
    }
  }
}
