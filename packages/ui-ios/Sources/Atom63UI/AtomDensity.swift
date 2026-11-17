import SwiftUI

/// Proportional rhythm, the iOS counterpart of the web `data-a63-density` axis.
///
/// `compact` draws components smaller: spacing inside them scales by 0.875 (the
/// web `--a63-space-unit` factor), text steps down one Dynamic Type style, and a
/// `.regular` button draws at the `.compact` size. It never shrinks a hit area:
/// interactive controls keep the 44pt touch target.
public enum AtomDensity: Sendable {
  case regular
  case compact
}

extension EnvironmentValues {
  @Entry public var atomDensity: AtomDensity = .regular
}

extension View {
  /// Sets the density for this view and everything inside it.
  public func atomDensity(_ density: AtomDensity) -> some View {
    environment(\.atomDensity, density)
  }
}

extension AtomDensity {
  /// Scales a space token; matches `[data-a63-density='compact']` on the web.
  public func space(_ value: Double) -> CGFloat {
    self == .compact ? value * 0.875 : value
  }

  /// The text style for a role: one Dynamic Type step down in compact.
  public func textStyle(_ style: Font.TextStyle) -> Font.TextStyle {
    guard self == .compact else { return style }
    switch style {
    case .largeTitle: return .title
    case .title: return .title2
    case .title2: return .title3
    case .title3, .headline, .body: return .subheadline
    case .callout, .subheadline: return .footnote
    case .footnote: return .caption
    case .caption: return .caption2
    default: return style
    }
  }

  /// The size a control draws at: compact draws `.regular` as `.compact` and
  /// `.large` as `.regular`. `.compact` and `.icon` are unchanged.
  public func controlSize(_ size: AtomControlSize) -> AtomControlSize {
    guard self == .compact else { return size }
    switch size {
    case .regular: return .compact
    case .large: return .regular
    case .compact, .icon: return size
    }
  }
}
