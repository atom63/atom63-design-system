import Testing

@testable import Atom63UI

struct AtomListPatternTests {
  @Test
  func pageDotsClampToThePagesThereAre() {
    #expect(AtomPageDots.page(-1, count: 3) == 0)
    #expect(AtomPageDots.page(1, count: 3) == 1)
    #expect(AtomPageDots.page(3, count: 3) == 2)
    #expect(AtomPageDots.page(2, count: 0) == 0)
  }

  @Test
  func avatarBadgesReadTheirLabelAndCapTheCount() {
    #expect(AtomAvatarBadge.dot(accessibilityLabel: "Online").accessibilityLabel == "Online")
    #expect(AtomAvatarBadge.dot(accessibilityLabel: "Online").text == nil)
    #expect(AtomAvatarBadge.count(7, accessibilityLabel: "7 unread").text == "7")
    #expect(AtomAvatarBadge.count(120, accessibilityLabel: "120 unread").text == "99+")
    #expect(AtomAvatarBadge.count(120, accessibilityLabel: "120 unread").accessibilityLabel == "120 unread")
  }

  @Test
  func listSectionAndPageDotsRenderTheItemAndCarouselContracts() {
    #expect(AtomComponentContracts.contract(catalogItem: "listSection")?.id == "item")
    #expect(AtomComponentContracts.contract(catalogItem: "pageDots")?.id == "carousel")
  }
}
