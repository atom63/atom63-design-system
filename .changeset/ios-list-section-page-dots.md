---
'@atom63/ui-foundation': minor
'@atom63/ui-react': minor
---

Item and Carousel gain cross-renderer contracts: `ItemGroup variant="inset"` renders as `AtomListSection` in SwiftUI, and `CarouselDots` as `AtomPageDots` under a paged `TabView`. `reactRendererConformance` carries their React evidence. The Avatar contract notes the SwiftUI `AtomAvatar(badge:)` status dot and count.
