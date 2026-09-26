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

## iOS screenshot tests

`Atom63DemoTests/CatalogSnapshotTests.swift` renders every catalog showcase with
[swift-snapshot-testing](https://github.com/pointfreeco/swift-snapshot-testing)
(1.19.6, a test-target dependency only) and compares it with a baseline PNG.

- **Coverage.** The tests loop over `CatalogRegistry.items`, so a new catalog
  entry is covered without touching the tests. Each showcase is captured three
  times: `light`, `dark`, and `large-type` (light at Dynamic Type
  `accessibility3`). A guard test fails when an entry has no committed baseline
  or a baseline has no entry.
- **Rendering.** Showcases render on the page surface at the iPhone 17 Pro
  width (402 pt) and their natural height, at 2x, in the host app's key window.
  Animations are off, motion is reduced, locale, time zone and calendar are
  fixed (`en_US`, UTC, Gregorian), spinners stay still, and remote image
  requests never finish, so async images always show their placeholder.
- **Tolerance.** `perceptualPrecision: 0.98` and `precision: 0.995`: a pixel
  counts as changed when its color differs by more than 2% (Delta E), and up to
  0.5% of the pixels may change.
- **Pinned simulator.** Baselines count only on the simulator named in
  `snapshot-simulator.json` (iPhone 17 Pro, iOS 26.2: the CI runner's). They
  live in `Atom63DemoTests/__Snapshots__/iPhone-17-Pro_iOS-26.2/`, and CI fails
  when one is missing.
- **Other simulators.** On any other device or iOS version, the tests use their
  own baselines in `__Snapshots__/local/<device>_iOS-<version>/`, which git
  ignores. The first run records them and passes; later runs compare against
  them. They are useful only for comparing two local runs, like the web's
  `-darwin` screenshots.

Run from the repository root:

```bash
pnpm --filter @atom63/ui-ios test:snapshots          # compare
pnpm --filter @atom63/ui-ios test:snapshots:record   # re-record the baselines this simulator uses
```

The other test commands skip the screenshot tests, which run on their own
without retries. When a comparison fails, the new capture is written to
`snapshot-failures/` (git-ignored), and the test result bundle holds the
reference, the capture and their difference.

To create or update the committed baselines after an intentional visual change
(or after adding a catalog entry), run the **iOS snapshots** workflow
(`.github/workflows/ios-snapshots.yml`) on the branch with **update** checked.
It records the baselines on the macOS runner, compares them again to prove they
are stable, and commits them to the branch; review the changed images in that
commit. When a comparison fails in CI, the `ios-snapshot-failures` artifact holds
the new captures and the result bundle.

When the CI runner no longer has the pinned iOS version, `run-ios-snapshots.mjs`
fails with a message saying so: pin an installed simulator in `snapshot-simulator.json` and
run the workflow with **update**.
