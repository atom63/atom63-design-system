# Cross-renderer component contracts

Atom63 shares component intent across React and SwiftUI without requiring both
renderers to use the same implementation primitive. The canonical registry is:

`packages/ui-foundation/contracts/cross-renderer-contracts.json`

The registry currently covers the shared mobile-ready subset: actions, fields,
search, selection, menus, disclosure, date input, modal tasks, navigation, content
surfaces, feedback, loading, pagination, and transient notifications.

## Parity levels

| Level | Required outcome |
| --- | --- |
| `strict` | States, semantic tone, accessibility outcome, and recovery behavior match. |
| `recipe` | Strict parity plus shared motion kind, duration token, easing, direction, and reduced-motion fallback. |
| `platform-adaptive` | Intent and accessibility match while geometry or interaction follows the native platform convention. |

Platform adaptation is not permission to drift. A native control may use a
different API or anatomy only when the registry states the adaptation explicitly.

## Alignment model

Each registered component separates invariant system decisions from renderer
adaptations:

| Contract field | Meaning |
| --- | --- |
| `intent` | The user or product goal shared by every renderer. |
| `requiredStates` | The state vocabulary every renderer must represent. |
| `stateTones` | Optional semantic tone mapping for status-bearing states. |
| `sharedOutcomes` | Behavior and recovery results that may not drift. |
| `accessibilityOutcomes` | Assistive-technology results, independent of platform API. |
| `motion` | Brand recipe required when parity is `recipe`. |
| `platformAdaptations.react` | Explicitly allowed web implementation differences. |
| `platformAdaptations.swiftUI` | Explicitly allowed native implementation differences. |

Renderer anatomy, geometry, and interaction primitives may differ only inside the
declared adaptation boundary. An undeclared difference is a conformance gap.

## Generated renderer metadata

Run:

```bash
pnpm --filter @atom63/ui-foundation generate:contracts
pnpm check:component-contracts
```

Generation writes:

- `packages/ui-foundation/src/conformance/cross-renderer-contracts.generated.ts`
- `packages/ui-ios/Sources/Atom63UI/Generated/AtomComponentContracts.generated.swift`

The generator rejects duplicate IDs, duplicate Catalog mappings, missing intent or
shared outcomes, missing renderer adaptation declarations, required states that are
absent from the Foundation component axis, state-tone mappings for unknown states or
tones, recipe parity without a motion contract, stale generated files, and missing
Skeleton motion recipe wiring.

React consumes the generated TypeScript registry. Atom63UI and the native Catalog
consume the generated Swift registry. Do not edit either generated file.

## Renderer evidence

A contract is `declared` when it exists in the canonical registry. It becomes
`verified` only after a renderer registers executable evidence for every required
state, shared outcome, accessibility outcome, and motion recipe.

All 27 canonical contracts now have renderer evidence. They cover Button, Alert,
Dialog/Sheet, AlertDialog/Alert, Field, DestinationLink, Input, Textarea, Switch,
Select/Picker, SegmentedControl/segmented Picker, RadioGroup/inline Picker,
Slider, DropdownMenu/Menu, Accordion/DisclosureGroup, Calendar/DatePicker,
SearchField/searchable, Tabs/TabView, Load More, Skeleton, Toggle/Chip, Card,
Badge, Avatar, Empty/ContentUnavailableView, Progress, and Toaster/AtomToast:

- React evidence:
  `packages/ui-react/src/conformance/renderer-conformance.ts`
- React executable harness:
  `packages/ui-react/src/conformance/renderer-conformance.test.tsx`
- SwiftUI evidence:
  `packages/ui-ios/Sources/Atom63UI/AtomRendererConformance.swift`
- SwiftUI executable harness:
  `packages/ui-ios/Tests/Atom63UITests/AtomRendererConformanceTests.swift`

Evidence arrays must exactly match generated contracts. Adding a required state or
outcome therefore fails renderer tests until the corresponding implementation and
evidence are updated. The native Catalog displays `declared` or `verified` beside
the parity level.

`Dialog`, `Select`, `AlertDialog`, `DestinationLink`, `Tabs`, `SegmentedControl`,
`RadioGroup`, `Slider`, `DropdownMenu`, `Accordion`, `Calendar`, and `SearchField`
demonstrate why verification is outcome-based rather than primitive-based. React
uses compound portal/focus, combobox/listbox, tab, radio, range-input, disclosure,
calendar-grid, and native search primitives. SwiftUI uses `.sheet`, `.alert`,
`NavigationLink`, `Link`, `TabView`, styled `Picker`, `Slider`, `Menu`,
`DisclosureGroup`, `DatePicker`, and `.searchable`. Their anatomy and geometry
remain platform-owned, while context, dismissal, destination, single-selection,
bounded value, action, disclosure, query, disabled behavior, accessible naming,
and selected-value outcomes remain shared.

## Authoring a cross-renderer component

1. Define or update the API vocabulary in the component's
   `packages/ui-foundation/src/components/*-contract.ts`.
2. Add the shared intent, required states, semantic state tones where status color
   communicates intent, shared outcomes, accessibility outcomes, parity level, and
   renderer-specific adaptations to the canonical JSON registry.
3. Add semantic CSS contract tokens when appearance or motion must be shared.
4. Regenerate TypeScript and Swift metadata.
5. Implement each renderer with native primitives.
6. Add renderer tests for the strict outcomes and recipe values.
7. Register renderer evidence only after those tests exercise the implementation.
8. Expose the generated contract and verification status in the native Catalog.

Motion-sensitive components must also provide a reduced-motion result. Continuous
loaders use linear timing; interaction feedback uses the semantic control timing
token; platform-native progress indicators may remain platform-adaptive.
