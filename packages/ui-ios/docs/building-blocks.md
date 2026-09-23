# Mobile UI building blocks

Atom63UI accelerates product development by owning reusable visual semantics,
interaction states, accessibility, and token usage. Native SwiftUI continues to
own navigation, collections, presentation, and platform controls.

## Implemented acceleration slice

| Need | Atom63UI |
| --- | --- |
| Primary, secondary, destructive, loading, and icon actions | `AtomButton`, `AtomIconButton` |
| Validated single-line and multiline entry | `AtomFormField`, `AtomTextField`, `AtomTextEditor`, `AtomFormMessage` |
| Labeled boolean settings | `AtomToggle` |
| Inline product feedback | `AtomNotice` |
| Determinate and indeterminate work | `AtomProgressView` |
| Loading placeholders | `atomSkeleton(_:)`, `AtomSkeletonRow` |
| Page and card section anatomy | `AtomSectionHeader` |
| Read-only metadata and selectable options | `AtomValueRow`, `AtomSelectionRow` |
| Cards, rows, status, identity, and media | `AtomCard`, `AtomListRow`, `AtomBadge`, `AtomAvatar`, `AtomAsyncImage` |
| Compact filtering | `AtomChip` |
| Safe-area-aware page actions | `AtomActionBar` |
| Paginated collection feedback and retry | `AtomPaginationIntent`, `AtomLoadMoreView` |
| Empty/error recovery, synchronization, and transient success | `AtomContentStateView`, `AtomSyncStatusView`, `AtomToast` |

## Form presentation ownership

`AtomFormField`, `AtomTextField`, and `AtomTextEditor` default to
`AtomFormPresentation.standalone`, where the field owns its control surface and
border. Native containers should declare when they already own that chrome:

```swift
Form {
  AtomTextField("Name", text: $name)
}
.atomFormPresentation(.grouped)
```

Use `.sheet` for forms inside modal sheets. Grouped and sheet contexts preserve
the same labels, values, supporting text, validation, focus, disabled behavior,
and 44-point minimum target while removing the nested resting border. Focus and
invalid states retain a visible semantic emphasis line.

## Scroll-edge ownership

Native containers own the geometry of tab bars, home indicators, sheet edges,
and keyboards. Do not encode those device heights in Atom63 components. A
scrolling consumer should instead:

```swift
Form {
  // Fields and in-flow actions
}
.scrollDismissesKeyboard(.interactively)
.contentMargins(.bottom, AtomTokens.Space.x4, for: .scrollContent)
```

The system safe area keeps content reachable above current chrome; the tokenized
scroll-content margin adds breathing room after the final row. Persistent page
or sheet actions should use `safeAreaInset(edge: .bottom)` at the container root,
not internal padding inside `AtomActionBar`.

## Accessibility interaction outcomes

- Buttons, chips, selection rows, retry actions, and pagination controls expose a
  minimum 44-point hit target.
- Transient toasts and inserted success/error form summaries post VoiceOver
  announcements without moving or trapping focus.
- Indeterminate progress, synchronization, and loading controls expose
  frequently-updating accessibility values.
- Native sheets retain system focus containment and restoration. Cancellation
  actions also support the platform Escape shortcut.
- Semantic fonts, adaptive stacks, token colors, and reduced-motion branches
  remain active under Bold Text, accessibility Dynamic Type, increased contrast,
  and Reduce Motion settings.

The reference app exercises these APIs in the dashboard, project filters, loading
state, paginated project list, project detail actions, validated forms, and a
38-entry executable Catalog. The cross-renderer registry declares 27 contracts;
all 27 have executable React and SwiftUI evidence.

## Next review slices

1. Context-menu outcomes when a real mobile long-press flow requires them.
2. Stepper outcomes after a reusable React number-stepper exists.
3. Permission, upload, and conflict intents.

Do not add an Atom63 wrapper when native SwiftUI already provides the complete
semantic behavior. `NavigationStack`, `NavigationSplitView`, `TabView`, `List`,
`Form`, `Picker`, `DatePicker`, `Slider`, `Stepper`, sheets, alerts, menus, and
swipe actions remain direct platform APIs. A canonical contract aligns their intent,
states, outcomes, and accessibility; it does not require a renaming wrapper.
