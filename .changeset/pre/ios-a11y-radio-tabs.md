---
'@atom63/ui-foundation': patch
---

Add `ios` sections to the radio and tabs pattern contracts. The tabs cross-renderer contract now names a segmented `Picker` with the selected content as its SwiftUI renderer for in-page sections, keeping `TabView` for app-level sections, and the radio contract says its inline `Picker` sits inside a `Form` or `List`.
