---
'@atom63/ui-foundation': patch
---

The tabs contract's SwiftUI adaptations now say how a `TabView` tab keeps its last row above the floating iOS 26 tab bar: each tab's root is its `ScrollView` or `List`, with no bottom padding, overlay or bottom `ignoresSafeArea`, and extra bottom chrome in `safeAreaInset(edge: .bottom)`.
