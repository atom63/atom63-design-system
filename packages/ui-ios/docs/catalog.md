# Native component catalog

`examples/ios-demo` contains the executable Atom63UI catalog. It complements the
reference product flows: the catalog isolates component behavior, while Home,
Projects, and Settings prove that the same APIs compose into a real app.

## Catalog contract

- `CatalogRegistry.swift` is the explicit inventory for every public foundation,
  component, and intent demonstrated by the app.
- Each entry has a stable identifier, section, public type name, description,
  searchable metadata, SF Symbol, and representative usage snippet.
- `CatalogShowcases.swift` owns interactive state matrices. Showcases render the
  real `Atom63UI` APIs; they do not reproduce component styling.
- `CatalogView.swift` owns native navigation, search, preview environment
  controls, source presentation, and accessibility identifiers.
- Cross-renderer entries resolve generated `AtomComponentContract` metadata from
  the shared Foundation registry and display parity, required states,
  accessibility outcomes, motion recipes, and intentional platform adaptation.

## Required coverage

Every new public Atom63UI component should add:

1. One `CatalogItem` registry entry.
2. One showcase that covers meaningful variants and interaction states.
3. A usage snippet tied to the public Swift API.
4. Registry coverage assertions.
5. An end-to-end rendered check when it introduces a new interaction pattern.

Do not add catalog-only styling branches to package components. A component that
only works in the catalog is not production-ready.

## Preview environment

Each detail page can override light/dark appearance, representative Dynamic Type
sizes, and the Atom63 reduced-motion intent without changing the rest of the app.
The default remains the user's system environment. VoiceOver semantics, locale
behavior, and safe-area behavior continue to come from native SwiftUI.

`AtomMotionPreference.system` always preserves the system Reduce Motion setting.
The Catalog can force `.reduced` to verify static fallbacks; it cannot force a
user who enabled Reduce Motion back into animation.

The catalog intentionally does not emulate device chrome. Use iPhone and iPad
Simulators to validate size classes, multitasking widths, keyboards, and actual
safe areas.
