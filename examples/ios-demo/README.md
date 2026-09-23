# Atom63 iOS Demo

Runnable SwiftUI reference app consuming `packages/ui-ios` through a local Swift
Package dependency.

Open `Atom63Demo.xcodeproj`, select the `Atom63Demo` scheme and an iPhone
simulator, then run. The app exercises authentication, tabs, search, list/detail
navigation, loading/empty/error states, item-driven sheets, alerts, toast
feedback, async media, an editable settings flow, and an offline-first project
repository. Its Catalog tab provides an executable component reference without
replacing these end-to-end product flows.

The Catalog contains every current `Atom63UI` foundation, component, and intent.
It supports search, interactive state matrices, light/dark appearance overrides,
Dynamic Type overrides, selectable usage snippets, and native share actions. See
`packages/ui-ios/docs/catalog.md` for its registry and coverage rules.

The Projects toolbar includes a **Preview state** menu for switching between
loaded, loading, empty, error, and offline intents without changing the
repository. Production loading uses `URLSession` against the public Atom63
GitHub account and persists results with SwiftData. Cached data remains
available when refresh fails.

Infrastructure remains app-owned. Repository outcomes map to
`AtomResourceIntent` and `AtomSyncIntent` before they reach the UI; see
`packages/ui-ios/docs/app-foundation.md`.

CLI build:

```bash
DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer \
  xcodebuild \
  -project Atom63Demo.xcodeproj \
  -scheme Atom63Demo \
  -destination 'platform=iOS Simulator,name=iPhone 17 Pro' \
  build
```

Focused tests from the repository root:

```bash
pnpm --filter @atom63/ui-ios test:app
pnpm --filter @atom63/ui-ios test:ui
```
