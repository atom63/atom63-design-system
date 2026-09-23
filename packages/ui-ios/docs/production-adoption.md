# Production adoption and releases

Atom63UI supports two local development entry points and one remote distribution
shape:

- `packages/ui-ios/Package.swift` keeps package development and focused tests
  close to the implementation.
- The repository-root `Package.swift` exposes the same `Atom63UI` product for
  Xcode and SwiftPM consumers that resolve a Git repository from its root.
- `Scripts/check-consumer-smoke.mjs` copies only that root manifest and the
  package Sources into a temporary repository, then compiles an independent
  consumer. This prevents accidental monorepo-only imports or generated-file
  dependencies.

## Adding the package

During monorepo development, add `packages/ui-ios` as a local package dependency.
For a tagged remote release, add the Atom63 repository URL and select the
`Atom63UI` product.

```swift
// Package.swift dependency
.package(
  url: "https://github.com/ATOM63/atom63-design-system.git",
  from: "0.1.0"
)
```

```swift
import Atom63UI

struct ProjectForm: View {
  @State private var name = ""

  var body: some View {
    Form {
      AtomTextField("Name", text: $name)
      AtomButton("Save", variant: .primary, fullWidth: true) {
        save()
      }
    }
    .atomFormPresentation(.grouped)
    .scrollDismissesKeyboard(.interactively)
    .contentMargins(.bottom, AtomTokens.Space.x4, for: .scrollContent)
  }
}
```

## Versioning

SwiftPM derives versions from Git tags rather than `Package.swift` and does not
resolve package-qualified tags. Atom63UI therefore uses repository-level SemVer
tags in the form `vMAJOR.MINOR.PATCH`.

- **Patch**: fixes that preserve public source compatibility.
- **Minor**: additive public APIs, components, tokens, or contracts.
- **Major**: removed/renamed APIs, changed defaults with migration impact, or a
  raised minimum platform/toolchain.

Every consumer-visible change also updates the `@atom63/ui-ios` changeset. The
npm package record and the repository-level Swift tag must describe the same
release, even though their publishing mechanisms are independent.

## Public API review

`api/public-api.json` is generated from Swift's public symbol graph. Run:

```bash
pnpm --filter @atom63/ui-ios check:api
pnpm --filter @atom63/ui-ios check:api:write
```

Use the write command only for an intentional API change, then review the
manifest diff and classify its SemVer impact. Generated contract/token sources,
the public API manifest, isolated consumer build, root package tests, and the
generic iOS app build are enforced by `.github/workflows/ios.yml`.
The pull-request workflow uses one macOS job and does not install the JavaScript
workspace. Complete application and XCUITest suites remain local by default and
can be enabled explicitly from the workflow-dispatch form when release-level
remote verification is needed.

## Feature integration template

[`Examples/ProjectFeatureTemplate.swift`](../Examples/ProjectFeatureTemplate.swift)
is compiled by the isolated consumer check. It demonstrates an app-owned
repository boundary suitable for URLSession, SwiftData, or another persistence
adapter; an `@Observable` feature model; native navigation and sheets; loading,
content, empty, and error intents; validated form composition; and transient
feedback.

## Migration notes

Release notes for a breaking or behavior-changing release must include:

1. The old API or behavior.
2. The replacement and a before/after example.
3. Platform-minimum or generated-token implications.
4. Whether the change affects React parity or only SwiftUI adaptation.
