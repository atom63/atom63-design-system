import Testing

@testable import Atom63UI

struct AtomButtonShapeTests {
  @Test
  func shapesMatchTheWebButtonAxis() {
    // The web Button contract lists shapes default and round; iOS mirrors them.
    #expect(AtomButtonShape.allCases.map(\.rawValue) == ["default", "round"])
  }
}
