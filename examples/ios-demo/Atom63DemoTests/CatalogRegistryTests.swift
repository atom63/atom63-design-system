import Atom63UI
import XCTest

@testable import Atom63Demo

final class CatalogRegistryTests: XCTestCase {
  func testCatalogCoversEveryRegisteredEntryWithUniqueMetadata() {
    XCTAssertGreaterThanOrEqual(CatalogRegistry.items.count, AtomComponentContracts.all.count)
    XCTAssertEqual(Set(CatalogRegistry.items.map(\.title)).count, CatalogRegistry.items.count)
    XCTAssertEqual(Set(CatalogRegistry.items.map(\.typeName)).count, CatalogRegistry.items.count)
    XCTAssertTrue(CatalogRegistry.items.allSatisfy { !$0.summary.isEmpty && !$0.usage.isEmpty })
  }

  func testEveryCatalogSectionContainsEntries() {
    for section in CatalogRegistry.sections {
      XCTAssertFalse(
        CatalogRegistry.items(in: section, matching: "").isEmpty,
        "\(section.rawValue) should contain catalog entries"
      )
    }
  }

  func testCatalogSearchMatchesPublicTypeAndIntentNames() {
    XCTAssertEqual(
      CatalogRegistry.items(in: .feedback, matching: "AtomPaginationIntent"),
      [.pagination]
    )
    XCTAssertEqual(
      CatalogRegistry.items(in: .actions, matching: "loading"),
      [.button]
    )
  }

  func testCatalogExposesGeneratedCrossRendererContracts() {
    XCTAssertEqual(
      CatalogRegistry.items.filter { $0.conformanceContract != nil }.count,
      AtomComponentContracts.all.count
    )
    XCTAssertEqual(CatalogItem.skeleton.conformanceContract?.motion?.kind, "shimmer")
    XCTAssertEqual(CatalogItem.button.conformanceContract?.parity, .recipe)
    XCTAssertEqual(
      Set(AtomRendererConformance.verified.map(\.contractId)),
      Set(AtomComponentContracts.all.map(\.id))
    )
    XCTAssertTrue(
      AtomComponentContracts.all.allSatisfy {
        !$0.intent.isEmpty
          && !$0.sharedOutcomes.isEmpty
          && !$0.platformAdaptations.react.isEmpty
          && !$0.platformAdaptations.swiftUI.isEmpty
      }
    )
    XCTAssertNil(CatalogItem.tokens.conformanceContract)
  }
}
