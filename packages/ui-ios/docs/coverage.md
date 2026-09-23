# Atom63UI iOS coverage

Atom63UI shares semantic values and reusable presentation patterns while keeping
application structure on native SwiftUI APIs.

## Ownership

| Concern | Use |
| --- | --- |
| Navigation and routing | `NavigationStack`, `NavigationSplitView`, typed destinations |
| App tabs | `TabView` |
| Collections and settings | `List`, `Form`, `Section` |
| Presentation | `sheet`, `fullScreenCover`, `popover`, `alert`, `confirmationDialog` |
| Atom63 controls | `AtomButton`, `AtomIconButton`, `AtomChip`, `AtomTextField`, `AtomTextEditor`, `AtomToggle` |
| Atom63 form patterns | `AtomFormField`, `AtomFormMessage` |
| Atom63 content patterns | `AtomCard`, `AtomListRow`, `AtomValueRow`, `AtomSelectionRow`, `AtomSectionHeader`, `AtomActionBar`, `AtomBadge`, `AtomAvatar`, `AtomAsyncImage` |
| Atom63 feedback | `AtomResourceIntent`, `AtomPaginationIntent`, `AtomLoadMoreView`, `AtomSyncStatusView`, `AtomContentStateView`, `AtomNotice`, `AtomProgressView`, `AtomSkeletonRow`, `AtomToast` |
| Networking and persistence | App-owned `URLSession`, SwiftData, and repositories mapped into Atom63 intents |

Do not wrap native containers only to rename them. Add an Atom63 component when
the system provides reusable visual semantics, behavior, accessibility, or a
cross-product pattern.

## Current reference flows

`examples/ios-demo` exercises:

- authenticated and signed-out roots
- four-tab application shell with an executable component catalog
- adaptive iPad `NavigationSplitView` shell
- searchable coverage for every current Atom63UI foundation, component, and intent
- 38 native Catalog entries backed by 27 generated cross-renderer contracts
- executable React and SwiftUI renderer evidence for all 27 contracts
- root SwiftPM distribution manifest, frozen public API, and isolated consumer build
- per-component light/dark and Dynamic Type preview overrides
- interactive state matrices and selectable Swift usage snippets
- searchable, refreshable project list
- paginated loading with automatic continuation, retry, and exhausted feedback
- typed detail navigation
- validated project-creation sheet with native status selection and persisted outcome
- destructive confirmation alert
- generated loading, empty, and error states
- real remote loading with cached, stale, offline, and failed-sync feedback
- inline notices, determinate progress, and reusable skeleton loading
- filter chips, value/selection rows, section headers, and safe-area action bars
- SwiftData persistence for project reads and a compacted local mutation outbox
- deterministic remote snapshot merging that preserves pending local upserts and deletes
- transient toast feedback
- editable settings form
- validated form with keyboard focus progression, multiline input, pickers,
  segmented selection, date, slider, and stepper controls
- native menu, disclosure, date-selection, and searchable collection behavior
- hardware keyboard shortcuts for create and save actions
- UI tests for project navigation, confirmation cancellation, tab selection,
  project creation and editing, invalid form submission, native selection and
  slider controls, and Catalog previews
- remote image loading and failure placeholders
- standard and accessibility Dynamic Type layouts

## Remaining production work

- choose and publish the repository/package license before public distribution
- localization resources instead of demo strings
- authentication and writable remote upload/conflict resolution
- image caching/downsampling for media-heavy products
- permission education screens and system permission requests
- deep-link parsing and state restoration
- snapshot baselines for the reference flows
