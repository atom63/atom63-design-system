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
