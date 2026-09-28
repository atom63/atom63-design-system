import SwiftUI

#if canImport(WidgetKit)
  import WidgetKit
#endif

/// A widget's size, in cells of a square grid: the same spans as the web's
/// `WidgetSize` in @atom63/widgets.
public enum AtomWidgetSize: String, CaseIterable, Sendable {
  /// One cell.
  case small
  /// Two cells wide, one tall.
  case medium
  /// Two cells wide, two tall.
  case large

  public var columns: Int { self == .small ? 1 : 2 }
  public var rows: Int { self == .large ? 2 : 1 }

  #if canImport(WidgetKit) && !os(watchOS)
    /// The home screen widget family with the same shape.
    public var widgetFamily: WidgetFamily {
      switch self {
      case .small: .systemSmall
      case .medium: .systemMedium
      case .large: .systemLarge
      }
    }
  #endif
}

/// A widget tile in an app: the widget contract's rim and card face around
/// the content. It fills the space it is given; in an `AtomWidgetGrid` that is
/// the cells of its size.
///
/// The content carries no chrome of its own, so the same content view can be a
/// WidgetKit widget's body, where the system draws the frame and background.
public struct AtomWidgetCard<Content: View>: View {
  @Environment(\.atomTheme) private var theme
  @Environment(\.colorScheme) private var colorScheme

  @ViewBuilder private let content: Content

  public init(@ViewBuilder content: () -> Content) {
    self.content = content()
  }

  public var body: some View {
    let rim = AtomTokens.Widget.rimWidth(for: theme.skin)
    let radius = AtomTokens.Widget.radius
    content
      .foregroundStyle(theme.colors.widgetForeground.resolve(for: colorScheme))
      .padding(AtomTokens.Space.x4)
      .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
      .background(theme.colors.widgetBackground.resolve(for: colorScheme))
      .clipShape(.rect(cornerRadius: max(radius - rim, 0)))
      .padding(rim)
      .background(
        theme.colors.widgetRim.resolve(for: colorScheme),
        in: .rect(cornerRadius: radius)
      )
      .accessibilityElement(children: .contain)
  }
}

/// A widget's title row, with an optional symbol. It is the widget's heading
/// for VoiceOver, and it draws no chrome, so it works inside WidgetKit too.
public struct AtomWidgetHeader: View {
  private let title: String
  private let systemImage: String?

  public init(_ title: String, systemImage: String? = nil) {
    self.title = title
    self.systemImage = systemImage
  }

  public var body: some View {
    Group {
      if let systemImage {
        Label(title, systemImage: systemImage)
      } else {
        Text(title)
      }
    }
    .font(.subheadline.weight(.semibold))
    .lineLimit(1)
    .accessibilityAddTraits(.isHeader)
  }
}

private struct AtomWidgetSizeKey: LayoutValueKey {
  static let defaultValue: AtomWidgetSize = .small
}

extension View {
  /// The cells this view takes in an `AtomWidgetGrid`.
  public func atomWidgetSize(_ size: AtomWidgetSize) -> some View {
    layoutValue(key: AtomWidgetSizeKey.self, value: size)
  }
}

/// Square cells, `columns` across, sized by the grid's width. Each child takes
/// the cells of its `atomWidgetSize` and fills the first gap it fits in, row by
/// row, as a widget board does.
public struct AtomWidgetGrid: Layout {
  public var columns: Int
  public var spacing: CGFloat

  public init(columns: Int = 2, spacing: CGFloat = AtomTokens.Space.x4) {
    self.columns = max(columns, 1)
    self.spacing = spacing
  }

  struct Placement: Equatable {
    var column: Int
    var row: Int
    var size: AtomWidgetSize
  }

  private func cell(for width: CGFloat) -> CGFloat {
    max((width - spacing * CGFloat(columns - 1)) / CGFloat(columns), 0)
  }

  /// Where each size lands, in order: the first gap it fits in, row by row. A
  /// size wider than the grid takes the grid's width.
  static func pack(_ sizes: [AtomWidgetSize], columns: Int) -> [Placement] {
    var taken: Set<[Int]> = []
    var result: [Placement] = []
    for size in sizes {
      let width = min(size.columns, columns)
      var row = 0
      search: while true {
        for column in 0...(columns - width) {
          let cells = (0..<size.rows).flatMap { dy in
            (0..<width).map { dx in [column + dx, row + dy] }
          }
          if cells.allSatisfy({ !taken.contains($0) }) {
            cells.forEach { taken.insert($0) }
            result.append(Placement(column: column, row: row, size: size))
            break search
          }
        }
        row += 1
      }
    }
    return result
  }

  private func placements(_ subviews: Subviews) -> [Placement] {
    Self.pack(subviews.map { $0[AtomWidgetSizeKey.self] }, columns: columns)
  }

  public func sizeThatFits(
    proposal: ProposedViewSize,
    subviews: Subviews,
    cache: inout ()
  ) -> CGSize {
    let width = proposal.width ?? 360
    let cell = cell(for: width)
    let rows = placements(subviews).map { $0.row + $0.size.rows }.max() ?? 0
    let height = rows == 0 ? 0 : CGFloat(rows) * cell + CGFloat(rows - 1) * spacing
    return CGSize(width: width, height: height)
  }

  public func placeSubviews(
    in bounds: CGRect,
    proposal: ProposedViewSize,
    subviews: Subviews,
    cache: inout ()
  ) {
    let cell = cell(for: bounds.width)
    for (subview, placement) in zip(subviews, placements(subviews)) {
      let width = min(placement.size.columns, columns)
      let size = CGSize(
        width: CGFloat(width) * cell + CGFloat(width - 1) * spacing,
        height: CGFloat(placement.size.rows) * cell + CGFloat(placement.size.rows - 1) * spacing
      )
      subview.place(
        at: CGPoint(
          x: bounds.minX + CGFloat(placement.column) * (cell + spacing),
          y: bounds.minY + CGFloat(placement.row) * (cell + spacing)
        ),
        proposal: ProposedViewSize(size)
      )
    }
  }
}
