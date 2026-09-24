# Atom63UI

Native SwiftUI renderer for the Atom63 design system. The package consumes
generated Swift tokens sourced from `@atom63/styles` and implements platform
appropriate controls instead of wrapping React or reproducing CSS.

## Use from Xcode

Add a local Swift package dependency pointing at `packages/ui-ios`, then import:

```swift
import Atom63UI

AtomButton("Continue", variant: .primary) {
    continueFlow()
}
```

The package targets iOS 17+ and macOS 14+.

## Components

- `AtomButton`
- `AtomIconButton`
- `AtomActionBar`
- `AtomFormField`
- `AtomFormMessage`
- `AtomTextField`
- `AtomTextEditor`
- `AtomToggle`
- `AtomCard`
- `AtomListRow`
- `AtomValueRow`
- `AtomSelectionRow`
- `AtomSectionHeader`
- `AtomChip`
- `AtomBadge`
- `AtomAvatar`
- `AtomAsyncImage`
- `AtomContentStateView`
- `AtomNotice`
- `AtomProgressView`
- `AtomSkeletonRow` and `atomSkeleton(_:)`
- `AtomResourceIntent`
- `AtomPaginationIntent` and `AtomLoadMoreView`
- `AtomSyncStatusView`
- `AtomToast`
- `AtomMotionPreference`
- generated `AtomComponentContracts`
- `AtomRendererConformance` verified renderer evidence
- `AtomTheme` and generated `AtomTokens`

The JSON files in `tokens/` document how the platform-neutral component slots
map to SwiftUI. Component anatomy and behavior remain native to iOS.
Cross-renderer contracts may therefore map a React component to a native SwiftUI
API rather than an `Atom*` wrapper. For example, React `Dialog` maps to `.sheet`
and React `Select` maps to `Picker`; the generated contract aligns intent, states,
outcomes, and accessibility without replacing native presentation.
See [`docs/coverage.md`](./docs/coverage.md) for the native/Atom63 ownership
boundary and reference-flow inventory.
See [`docs/forms.md`](./docs/forms.md) for field composition and validation
patterns.
See [`docs/building-blocks.md`](./docs/building-blocks.md) for the UI acceleration
roadmap and native ownership boundary.
See [`docs/app-foundation.md`](./docs/app-foundation.md) for the infrastructure
to design-intent boundary.
See [`docs/catalog.md`](./docs/catalog.md) for the executable component catalog
contract and contribution requirements.

## Token generation

The DTCG token sources in `@atom63/styles` and the cross-renderer component
registry are the source of truth. Swift colours are resolved from the web
semantic and contract tokens through the Figma sync model
(`@atom63/styles/figma-sync.json`). `AtomTokens.Color` holds the defaults an app
starts with (skin modern, brand b1, surface n1); `AtomTheme(skin:brand:surface:)`
resolves any other selection at runtime from the generated variable graph
(`AtomTokenGraph.generated.swift`), reading variables that vary on several axes
from `@atom63/styles`'s `atom63.computed-values.json`:

```swift
ContentView()
  .atomTheme(AtomTheme(skin: .aqua, brand: .b3, surface: .n2))
```

Regenerate the checked-in Swift tokens and contract metadata after changing
either source:

```bash
pnpm --filter @atom63/ui-ios generate:swift
pnpm --filter @atom63/ui-ios check:swift-tokens
```

The generators read `packages/styles/src/tokens/foundation/primitives.css` and
`packages/ui-foundation/contracts/cross-renderer-contracts.json`; do not hand-edit
files under `Sources/Atom63UI/Generated`.
`pnpm check:harness-architecture` also rejects stale generated tokens.

## Run the demo

Open `examples/ios-demo/Atom63Demo.xcodeproj`, select an iPhone simulator, and run
the `Atom63Demo` scheme. Use the Catalog tab for isolated components and the
other tabs for complete product flows. From the repository root:

```bash
pnpm --filter @atom63/ui-ios test:swift
pnpm --filter @atom63/ui-ios test:app
pnpm --filter @atom63/ui-ios test:ui
pnpm --filter @atom63/ui-ios build:app

DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer \
  xcodebuild \
  -project examples/ios-demo/Atom63Demo.xcodeproj \
  -scheme Atom63Demo \
  -destination 'platform=iOS Simulator,name=iPhone 17 Pro' \
  build
```

For remote SwiftPM consumption, SemVer policy, public API review, and isolated
consumer verification, see
[`docs/production-adoption.md`](./docs/production-adoption.md).
