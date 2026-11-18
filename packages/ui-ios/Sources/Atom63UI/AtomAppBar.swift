import SwiftUI

/// How an app bar sits on the screen.
public enum AtomAppBarStyle: Sendable {
  /// On the page surface, which runs up under the status bar.
  case standard
  /// No surface: the leading and trailing controls float over the content
  /// (a photo, a map) on on-media plates that hold contrast on any image.
  case floating
}

/// A custom top bar: leading controls, a principal view (a title or a search
/// field) and trailing controls. The counterpart of the web `AppView` top-bar
/// slot. Place it with `.atomAppBar { … }`, which puts it in the top safe-area
/// inset so content scrolls under it.
///
/// For a plain back-button-and-title screen, keep the native navigation bar;
/// use this when the bar needs what the native bar cannot draw, such as icon
/// buttons floating over media, a search field across the bar or a denser bar.
public struct AtomAppBar<Leading: View, Principal: View, Trailing: View>: View {
  @Environment(\.atomTheme) private var theme
  @Environment(\.colorScheme) private var colorScheme
  @Environment(\.atomDensity) private var density

  private let style: AtomAppBarStyle
  private let leading: Leading
  private let principal: Principal
  private let trailing: Trailing

  public init(
    style: AtomAppBarStyle = .standard,
    @ViewBuilder leading: () -> Leading = { EmptyView() },
    @ViewBuilder principal: () -> Principal = { EmptyView() },
    @ViewBuilder trailing: () -> Trailing = { EmptyView() }
  ) {
    self.style = style
    self.leading = leading()
    self.principal = principal()
    self.trailing = trailing()
  }

  public var body: some View {
    HStack(spacing: density.space(AtomTokens.Space.x2)) {
      if Leading.self != EmptyView.self {
        plate { leading }
      }
      if Principal.self == EmptyView.self {
        Spacer(minLength: 0)
      } else {
        principal
          .frame(maxWidth: .infinity, alignment: .leading)
      }
      if Trailing.self != EmptyView.self {
        plate { trailing }
      }
    }
    .padding(.horizontal, density.space(AtomTokens.Space.x4))
    .padding(.vertical, density.space(AtomTokens.Space.x1))
    .frame(minHeight: AtomTokens.Control.minTouchTarget)
    .background {
      if style == .standard {
        theme.colors.surfacePage.resolve(for: colorScheme)
          .ignoresSafeArea(edges: .top)
      }
    }
    .accessibilityElement(children: .contain)
  }

  @ViewBuilder
  private func plate<Content: View>(@ViewBuilder _ content: () -> Content) -> some View {
    let slot = HStack(spacing: density.space(AtomTokens.Space.x1)) { content() }
    switch style {
    case .standard:
      slot
    case .floating:
      // The plate is always dark, so the controls on it resolve their dark
      // appearance: Atom63 buttons read their colors from the theme, not from
      // foregroundStyle.
      slot
        .environment(\.colorScheme, .dark)
        .foregroundStyle(AtomTokens.Color.onMediaForeground.resolve(for: .dark))
        // At least as wide as it is tall, so a single control sits on a circle.
        .frame(minWidth: AtomTokens.Control.minTouchTarget)
        .background(
          AtomTokens.Color.onMediaSurface.resolve(for: colorScheme),
          in: Capsule()
        )
    }
  }
}

extension AtomAppBar where Principal == AtomAppBarTitle {
  /// A bar with a title as its principal view.
  public init(
    _ title: String,
    style: AtomAppBarStyle = .standard,
    @ViewBuilder leading: () -> Leading = { EmptyView() },
    @ViewBuilder trailing: () -> Trailing = { EmptyView() }
  ) {
    self.init(
      style: style,
      leading: leading,
      principal: { AtomAppBarTitle(title) },
      trailing: trailing
    )
  }
}

/// The title of an `AtomAppBar`, marked as a header for VoiceOver.
public struct AtomAppBarTitle: View {
  @Environment(\.atomTheme) private var theme
  @Environment(\.colorScheme) private var colorScheme
  @Environment(\.atomDensity) private var density

  private let title: String

  public init(_ title: String) {
    self.title = title
  }

  public var body: some View {
    Text(title)
      .font(.system(density.textStyle(.headline), weight: .semibold))
      .foregroundStyle(theme.colors.textPrimary.resolve(for: colorScheme))
      .lineLimit(1)
      .accessibilityAddTraits(.isHeader)
  }
}

extension View {
  /// Places a bar at the top of this view, in the top safe-area inset, so the
  /// content scrolls under it. Hide the native navigation bar on the same screen.
  public func atomAppBar<Bar: View>(@ViewBuilder _ bar: () -> Bar) -> some View {
    safeAreaInset(edge: .top, spacing: 0) { bar() }
  }
}
