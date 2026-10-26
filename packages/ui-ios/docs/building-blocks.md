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
| Grouped inset lists (settings) and navigational value rows | `AtomListSection`, `AtomValueRow(showsDisclosure:)` |
| Carousel page indicator | `AtomPageDots` with `TabView(.page)` |
| Cards, rows, status, identity, and media | `AtomCard`, `AtomListRow`, `AtomBadge`, `AtomAvatar`, `AtomAsyncImage` |
| Compact filtering | `AtomChip` |
| Safe-area-aware page actions | `AtomActionBar` |
| Paginated collection feedback and retry | `AtomPaginationIntent`, `AtomLoadMoreView` |
| Empty/error recovery, synchronization, and transient success | `AtomContentStateView`, `AtomSyncStatusView`, `AtomToast` |

## Grouped inset lists

Settings-style screens built in a `ScrollView` use `AtomListSection`: its rows sit
on one rounded panel with a divider between them, under an optional header and
above an optional footer. A row that navigates is a `NavigationLink` whose label is
`AtomValueRow("Currency", value: "USD", showsDisclosure: true)`; add
`emphasizesValue: true` for a bold value.

The section does not pad its rows. Each row pads itself with
`atomListRowInsets()`, inside its own tap area, so a `NavigationLink` or `Button`
row is tappable edge to edge, padding included. `AtomValueRow`, `AtomListRow`,
`AtomSelectionRow` and `AtomToggle` do this already. Give a custom row the
modifier inside the link's label, not on the link:

```swift
NavigationLink(value: Route.profile) {
  ProfileSummary()
    .atomListRowInsets()
}
```

```swift
ScrollView {
  VStack(spacing: AtomTokens.Space.x6) {
    AtomListSection("General", footer: "Applies to every device.") {
      NavigationLink(value: Route.currency) {
        AtomValueRow("Currency", value: "USD", showsDisclosure: true)
      }
      AtomToggle("Notifications", isOn: $notifications)
    }
  }
  .padding(AtomTokens.Space.x4)
}
.background(theme.colors.surfacePage.resolve(for: colorScheme))
```

Inside a `List` or `Form`, use the native `Section`: the list draws the inset
group, and `NavigationLink` adds its own chevron, so leave `showsDisclosure` off.

## Carousel page dots

Page with `TabView` and `.tabViewStyle(.page(indexDisplayMode: .never))`, then
bind `AtomPageDots(count:selection:)` to the same selection. VoiceOver reads the
dots as one adjustable element.

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

### App tab bar

App-level sections use the native `TabView`, and each tab's root is its
`ScrollView` or `List`:

```swift
TabView(selection: $tab) {
  ScrollView {
    LazyVStack(spacing: AtomTokens.Space.x3) {
      // Rows
    }
  }
  .tabItem { Label("Home", systemImage: "house") }
  .tag(AppTab.home)
}
```

From iOS 26 the tab bar is a floating glass capsule drawn over the tab's
content. At rest, content scrolls under it and shows through the glass; that is
the platform design, not a clipped layout. `TabView` insets the scroll content,
so at the end of the scroll the last row sits fully above the bar. Keep that
inset:

- Do not add bottom padding sized for the bar.
- Do not draw the content in a `ZStack` or `overlay` above the `TabView`, or
  build a custom bar on top of it.
- Do not apply `ignoresSafeArea()` to the bottom edge of the tab's root; limit
  it to the top (`.ignoresSafeArea(edges: .top)`) for a hero behind the status
  bar.
- Put extra bottom chrome, such as a checkout bar, in
  `safeAreaInset(edge: .bottom)` on the tab's root so the scroll content keeps
  its inset.

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
42-entry executable Catalog. The cross-renderer registry declares 29 contracts;
all 29 have executable React and SwiftUI evidence.

## Next review slices

1. Context-menu outcomes when a real mobile long-press flow requires them.
2. Stepper outcomes after a reusable React number-stepper exists.
3. Permission, upload, and conflict intents.

Do not add an Atom63 wrapper when native SwiftUI already provides the complete
semantic behavior. `NavigationStack`, `NavigationSplitView`, `TabView`, `List`,
`Form`, `Picker`, `DatePicker`, `Slider`, `Stepper`, sheets, alerts, menus, and
swipe actions remain direct platform APIs. A canonical contract aligns their intent,
states, outcomes, and accessibility; it does not require a renaming wrapper.
