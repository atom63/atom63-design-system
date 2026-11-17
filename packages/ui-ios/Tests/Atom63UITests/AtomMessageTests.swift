import SwiftUI
import Testing

@testable import Atom63UI

@MainActor
struct AtomMessageTests {
  @Test
  func axesMatchTheWebMessageContract() {
    #expect(AtomMessageDirection.allCases.map(\.rawValue) == ["incoming", "outgoing"])
    #expect(AtomMessagePosition.allCases.map(\.rawValue) == ["single", "first", "middle", "last"])
    #expect(
      AtomMessageDeliveryState.allCases.map(\.rawValue)
        == ["sending", "sent", "delivered", "read", "failed"]
    )
  }

  @Test
  func onlySingleAndLastEndARun() {
    #expect(AtomMessagePosition.allCases.filter(\.endsRun) == [.single, .last])
    #expect(AtomMessagePosition.allCases.filter(\.joinsAbove) == [.middle, .last])
    #expect(AtomMessagePosition.allCases.filter(\.joinsBelow) == [.first, .middle])
  }

  @Test
  func everyDeliveryStateIsNamed() {
    for state in AtomMessageDeliveryState.allCases {
      #expect(!state.label.isEmpty)
    }
  }

  @Test
  func aThreadRendersInBothDirectionsAndPositions() {
    let view = VStack {
      AtomMessageEvent("Today")
      ForEach(AtomMessagePosition.allCases, id: \.self) { position in
        AtomMessage("Hello", from: "Ada", position: position, time: "12:01") {
          Circle().frame(width: 28, height: 28)
        }
        AtomMessage("Hi", from: "You", direction: .outgoing, position: position, time: "12:02", status: .read)
      }
    }
    .frame(width: 390)
    #expect(ImageRenderer(content: view).cgImage != nil)
  }
}

struct AtomAvatarRingTests {
  @Test
  func ringsMatchTheWebAvatarContract() {
    #expect(AtomAvatarRing.allCases.map(\.rawValue) == ["unseen", "seen"])
  }
}
