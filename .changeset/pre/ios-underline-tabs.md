---
'@atom63/ui-foundation': minor
---

Cross-renderer contracts take an optional `swiftUIRendererByVariant`, the SwiftUI renderer for each variant. The Tabs contract maps `default` to `Picker(.segmented)` and `underline` and `attached` to the new Atom63UI `AtomTabRow`, a scrolling row of underline text tabs with an optional SF Symbol over each label.
