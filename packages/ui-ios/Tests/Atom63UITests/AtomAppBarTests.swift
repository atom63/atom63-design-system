import SwiftUI
import Testing

@testable import Atom63UI

@MainActor
struct AtomAppBarTests {
  @Test
  func aTitledBarUsesTheTitleAsItsPrincipal() {
    let bar = AtomAppBar("Inbox", trailing: {
      AtomIconButton("Compose", systemImage: "square.and.pencil") {}
    })
    #expect(type(of: bar) == AtomAppBar<EmptyView, AtomAppBarTitle, AtomIconButton>.self)
  }

  @Test
  func aBarRendersInBothStylesAndDensities() {
    for style in [AtomAppBarStyle.standard, .floating] {
      for density in [AtomDensity.regular, .compact] {
        let view = Color.clear
          .atomAppBar {
            AtomAppBar(style: style) {
              AtomIconButton("Back", systemImage: "chevron.backward") {}
            } principal: {
              AtomAppBarTitle("Lisbon")
            } trailing: {
              AtomIconButton("Share", systemImage: "square.and.arrow.up") {}
            }
          }
          .atomDensity(density)
          .frame(width: 390, height: 120)
        #expect(ImageRenderer(content: view).cgImage != nil)
      }
    }
  }
}
