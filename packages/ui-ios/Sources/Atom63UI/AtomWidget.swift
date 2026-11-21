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
/// row, as a widget board does. A row grows past one cell only when a tile's
/// content does not fit, as at accessibility text sizes.
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

  private func tileWidth(_ placement: Placement, cell: CGFloat) -> CGFloat {
    let span = min(placement.size.columns, columns)
    return CGFloat(span) * cell + CGFloat(span - 1) * spacing
  }

  /// Each row is one cell tall, unless a tile's content needs more, as at accessibility text
  /// sizes: then the last row the tile spans grows to fit it, so tiles never overlap.
  private func rowHeights(
    _ placements: [Placement],
    subviews: Subviews,
    cell: CGFloat
  ) -> [CGFloat] {
    let rowCount = placements.map { $0.row + $0.size.rows }.max() ?? 0
    var heights = Array(repeating: cell, count: rowCount)
    // One-row tiles first, so a taller tile only adds what its rows still lack.
    let tiles = zip(subviews, placements).sorted { $0.1.size.rows < $1.1.size.rows }
    for (subview, placement) in tiles {
      let width = tileWidth(placement, cell: cell)
      let rows = placement.row..<(placement.row + placement.size.rows)
      let available = rows.map { heights[$0] }.reduce(0, +) + CGFloat(rows.count - 1) * spacing
      let squeezed = subview.sizeThatFits(ProposedViewSize(width: width, height: available)).height
      guard squeezed > available else { continue }
      // Content that does not fit gets its natural height, so text wraps instead of truncating.
      let natural = subview.sizeThatFits(ProposedViewSize(width: width, height: nil)).height
      heights[rows.upperBound - 1] += max(squeezed, natural) - available
    }
    return heights
  }

  public func sizeThatFits(
    proposal: ProposedViewSize,
    subviews: Subviews,
    cache: inout ()
  ) -> CGSize {
    let width = proposal.width ?? 360
    let heights = rowHeights(placements(subviews), subviews: subviews, cell: cell(for: width))
    let height =
      heights.isEmpty ? 0 : heights.reduce(0, +) + CGFloat(heights.count - 1) * spacing
    return CGSize(width: width, height: height)
  }

  public func placeSubviews(
    in bounds: CGRect,
    proposal: ProposedViewSize,
    subviews: Subviews,
    cache: inout ()
  ) {
    let cell = cell(for: bounds.width)
    let placed = placements(subviews)
    let heights = rowHeights(placed, subviews: subviews, cell: cell)
    var tops: [CGFloat] = []
    var top = bounds.minY
    for height in heights {
      tops.append(top)
      top += height + spacing
    }
    for (subview, placement) in zip(subviews, placed) {
      let rows = placement.row..<(placement.row + placement.size.rows)
      let size = CGSize(
        width: tileWidth(placement, cell: cell),
        height: rows.map { heights[$0] }.reduce(0, +) + CGFloat(rows.count - 1) * spacing
      )
      subview.place(
        at: CGPoint(
          x: bounds.minX + CGFloat(placement.column) * (cell + spacing),
          y: tops[placement.row]
        ),
        proposal: ProposedViewSize(size)
      )
    }
  }
}
