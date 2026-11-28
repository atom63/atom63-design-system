import SwiftUI
import Testing

@testable import Atom63UI

struct AtomWidgetTests {
  @Test
  func sizesSpanTheWebCells() {
    #expect(AtomWidgetSize.allCases.map { [$0.columns, $0.rows] } == [[1, 1], [2, 1], [2, 2]])
  }

  @Test
  func gridFillsTheFirstGapRowByRow() {
    let placed = AtomWidgetGrid.pack([.large, .small, .small, .medium], columns: 4)
    #expect(placed.map { [$0.column, $0.row] } == [[0, 0], [2, 0], [3, 0], [2, 1]])
  }

  @Test
  func smallTilesBackfillBesideATallerOne() {
    let placed = AtomWidgetGrid.pack([.small, .large, .small], columns: 3)
    #expect(placed.map { [$0.column, $0.row] } == [[0, 0], [1, 0], [0, 1]])
  }

  @Test
  func aWideTileTakesTheWholeNarrowGrid() {
    let placed = AtomWidgetGrid.pack([.medium, .small], columns: 1)
    #expect(placed.map { [$0.column, $0.row] } == [[0, 0], [0, 1]])
  }

  @Test
  func themesSetTheRimWidth() {
    #expect(AtomTheme(skin: .retro).skin == .retro)
    #expect(AtomTokens.Widget.rimWidth(for: .retro) < AtomTokens.Widget.rimWidth(for: .modern))
  }

  @Test
  func errorWinsOverLoadingAndEmptyCountsOnceSettled() {
    #expect(AtomWidgetState.resolve(hasError: true, isLoading: true, isEmpty: true) == .error)
    #expect(AtomWidgetState.resolve(hasError: false, isLoading: true, isEmpty: true) == .loading)
    #expect(AtomWidgetState.resolve(hasError: false, isLoading: false, isEmpty: true) == .empty)
    #expect(AtomWidgetState.resolve(hasError: false, isLoading: false, isEmpty: false) == nil)
  }
}

@MainActor
struct AtomWidgetGridSizingTests {
  /// Two columns of 190-point cells in a 390-point grid.
  private func height(of tile: some View) -> Int {
    let view = AtomWidgetGrid(columns: 2, spacing: 10) {
      AtomWidgetCard { AtomWidgetHeader("Steps") }
      AtomWidgetCard { tile }
    }
    .frame(width: 390)
    return ImageRenderer(content: view).cgImage?.height ?? 0
  }

  @Test
  func rowsStaySquareWhenTheContentFits() {
    #expect(height(of: Text("Rest")) == 190)
  }

  @Test
  func aRowGrowsToFitContentTallerThanItsCell() {
    // Taller than a cell, as a tile's text is at accessibility sizes.
    #expect(height(of: Color.clear.frame(height: 300)) > 300)
  }
}
