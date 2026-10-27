import SwiftUI

/// A grouped inset list section: its rows on one rounded panel with dividers between them,
/// and an optional header and footer, as in iOS Settings. The SwiftUI side of
/// `ItemGroup variant="inset"`.
///
/// Use it inside a `ScrollView` and `VStack`. Inside a `List` or `Form`, use the native
/// `Section` instead: the list already draws the inset group, its dividers and the chevrons
/// of its `NavigationLink` rows.
///
/// The section does not pad its rows. Each row pads itself with `atomListRowInsets()`, inside
/// its own tap area, so a `NavigationLink` or `Button` row is tappable edge to edge.
/// `AtomValueRow`, `AtomListRow`, `AtomSelectionRow` and `AtomToggle` already do; give a
/// custom row the modifier inside the link's label.
///
/// Rows are at least 52 points tall, as in iOS 26 Settings, and grow with Dynamic Type. The
/// panel has an 18-point continuous corner. The web side is the phone form factor's
/// `--a63-inset-row-min-size` and `--a63-inset-group-radius`.
///
/// `surface` picks the section's fill: `.card` (the default) is the panel on a `surfacePage`
/// background, as in iOS Settings; `.muted` is the grey card for a white (`surfacePanel`) page.
/// The web side is `ItemGroup surface`.
///
/// ```swift
/// AtomListSection("Preferences", footer: "Applies to every device.") {
///   NavigationLink(value: Route.currency) {
///     AtomValueRow("Currency", value: "USD", showsDisclosure: true)
///   }
///   NavigationLink(value: Route.profile) {
///     ProfileSummary().atomListRowInsets()
///   }
///   AtomToggle("Notifications", isOn: $notifications)
/// }
/// ```
/// The fill of an `AtomListSection`, after the web `ItemGroup surface` axis.
public enum AtomListSectionSurface: String, CaseIterable, Sendable {
  /// The panel fill, for a `surfacePage` background (the default).
  case card
  /// The muted grey fill, for a white `surfacePanel` page.
  case muted
}

public struct AtomListSection<Content: View>: View {
  @Environment(\.atomTheme) private var theme
  @Environment(\.colorScheme) private var colorScheme

  private let header: String?
  private let footer: String?
  private let surface: AtomListSectionSurface
  private let content: Content

  public init(
    _ header: String? = nil,
    footer: String? = nil,
    surface: AtomListSectionSurface = .card,
    @ViewBuilder content: () -> Content
  ) {
    self.header = header
    self.footer = footer
    self.surface = surface
    self.content = content()
  }

  public var body: some View {
    VStack(alignment: .leading, spacing: AtomTokens.Space.x2) {
      if let header {
        AtomSectionHeader(header)
          .padding(.horizontal, AtomTokens.Space.x4)
      }

      rows
        .environment(\.atomListRowInsets, AtomListSectionMetrics.rowInsets)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(fill)
        .clipShape(.rect(cornerRadius: AtomListSectionMetrics.cornerRadius, style: .continuous))

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

  private var fill: Color {
    switch surface {
    case .card: theme.colors.surfacePanel.resolve(for: colorScheme)
    case .muted: theme.colors.surfaceMuted.resolve(for: colorScheme)
    }
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
            subview
          }
        }
      }
    } else {
      // iOS 17 has no public way to walk a view builder's children.
      _VariadicView.Tree(AtomListSectionLegacyRows(divider: divider)) { content }
    }
  }
}

enum AtomListSectionMetrics {
  /// Row padding inside an `AtomListSection`; the divider starts at the leading inset.
  static let rowInsets = EdgeInsets(
    top: AtomTokens.Space.x2,
    leading: AtomTokens.Space.x4,
    bottom: AtomTokens.Space.x2,
    trailing: AtomTokens.Space.x4
  )
  /// The minimum row height at the default Dynamic Type size: the 52-point row of iOS 26
  /// Settings. The web side is `--a63-inset-row-min-size` in the phone form factor.
  static let minRowHeight: CGFloat = 52
  /// The panel's continuous corner radius. The web side is `--a63-inset-group-radius`
  /// (`--radius-2xl`, 18px) in the phone form factor.
  static let cornerRadius: CGFloat = 18
}

extension EnvironmentValues {
  /// The row insets of the `AtomListSection` around a view, or nil outside one.
  @Entry var atomListRowInsets: EdgeInsets? = nil
}

extension View {
  /// Pads a row by the insets of the `AtomListSection` it is in, gives it the 52-point minimum
  /// height (scaled with Dynamic Type), and makes the padding part of its tap area. Outside a
  /// section it does nothing.
  ///
  /// Apply it inside a `NavigationLink` or `Button` label, not to the link, so the padding is
  /// tappable. Atom63 rows apply it themselves.
  public func atomListRowInsets() -> some View {
    modifier(AtomListRowInsetsModifier())
  }
}

private struct AtomListRowInsetsModifier: ViewModifier {
  @Environment(\.atomListRowInsets) private var insets
  @ScaledMetric(relativeTo: .body) private var minHeight = AtomListSectionMetrics.minRowHeight

  func body(content: Content) -> some View {
    if let insets {
      content
        // A row nested in a row is padded once.
        .environment(\.atomListRowInsets, nil)
        .padding(insets)
        .frame(
          maxWidth: .infinity,
          minHeight: minHeight,
          alignment: .leading
        )
        .contentShape(.rect)
    } else {
      content
    }
  }
}

/// A hairline that starts at the rows' leading inset and runs to the trailing edge.
private struct AtomListSectionDivider: View {
  let color: Color

  var body: some View {
    Rectangle()
      .fill(color)
      .frame(height: 1)
      .padding(.leading, AtomListSectionMetrics.rowInsets.leading)
      .accessibilityHidden(true)
  }
}

private struct AtomListSectionLegacyRows: _VariadicView_MultiViewRoot {
  let divider: AtomListSectionDivider

  func body(children: _VariadicView.Children) -> some View {
    VStack(spacing: 0) {
      ForEach(children) { child in
        if child.id != children.first?.id { divider }
        child
      }
    }
  }
}
