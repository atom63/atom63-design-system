import SwiftUI
import Testing

@testable import Atom63UI

@MainActor
struct AtomTabRowTests {
  private final class SelectionBox {
    var value: String
    var writes = 0

    init(_ value: String) {
      self.value = value
    }
  }

  private func row(_ box: SelectionBox) -> AtomTabRow<String> {
    AtomTabRow(
      "Sections",
      selection: Binding(
        get: { box.value },
        set: {
          box.value = $0
          box.writes += 1
        }
      ),
      tabs: [
        AtomTab("Overview", value: "overview"),
        AtomTab("Activity", systemImage: "clock", value: "activity"),
      ]
    )
  }

  @Test
  func selectingATabWritesTheBindingOnce() {
    let box = SelectionBox("overview")
    row(box).select("activity")
    #expect(box.value == "activity")
    #expect(box.writes == 1)
  }

  @Test
  func reselectingTheSelectedTabDoesNotWrite() {
    let box = SelectionBox("overview")
    row(box).select("overview")
    #expect(box.value == "overview")
    #expect(box.writes == 0)
  }

  @Test
  func tabsAreIdentifiedByTheirValue() {
    let tab = AtomTab("Activity", systemImage: "clock", value: 2)
    #expect(tab.id == 2)
    #expect(tab.systemImage == "clock")
  }

  @Test
  func everyTabIsAButtonAndOnlyTheSelectedOneIsSelected() {
    #expect(AtomTabRowMotion.traits(isSelected: true) == [.isButton, .isSelected])
    #expect(AtomTabRowMotion.traits(isSelected: false) == .isButton)
  }

  @Test
  func theIndicatorJumpsUnderReduceMotion() {
    #expect(AtomTabRowMotion.indicator(reduceMotion: true) == nil)
    #expect(AtomTabRowMotion.indicator(reduceMotion: false) != nil)
  }

  @Test
  func theTabsContractMapsEachVariantToARenderer() {
    let contract = AtomComponentContracts.all.first { $0.id == "tabs" }
    let renderers = contract?.swiftUIRendererByVariant ?? []
    #expect(renderers.map(\.variant) == ["default", "underline", "attached"])
    #expect(renderers.first { $0.variant == "default" }?.renderer == "Picker(.segmented)")
    let typeName = String(describing: AtomTabRow<Int>.self)
    #expect(typeName.hasPrefix("AtomTabRow"))
    #expect(renderers.first { $0.variant == "underline" }?.renderer == "AtomTabRow")
    #expect(renderers.first { $0.variant == "attached" }?.renderer == "AtomTabRow")
  }
}
