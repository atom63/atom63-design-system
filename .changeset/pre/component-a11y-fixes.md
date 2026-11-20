---
'@atom63/ui-react': minor
'@atom63/styles': patch
---

Fix component behaviour and accessibility gaps from the readiness review:

- `SearchField` forwards a consumer `ref` to its input and draws `size` and `invalid` on its chrome.
- `Field` links its `FieldDescription` and `FieldError` to the control with `aria-describedby` (and sets `aria-invalid` while an error shows), keeping any ids the control already lists.
- `SegmentedControl` spreads extra props onto its root, forwards a `ref`, and works uncontrolled with `defaultValue`; `value` and `onValueChange` are now optional.
- `ScrollableList` keeps both chevron controls mounted (hidden and inert at an edge) and moves focus to the other control when the focused one reaches its edge; it takes `scrollStartLabel` and `scrollEndLabel`, and spreads extra props onto its root, so `aria-label` names the list.
- A collapsed `offcanvas` `Sidebar` is inert, so its links leave the tab order and the accessibility tree.
- An active `SidebarMenuButton` or `SidebarMenuSubButton` (and so an active `SidebarNavTree` link) sets `aria-current="page"`.
- `LoadMoreTrigger` keeps one live region mounted in every state (empty while hidden), so a change of state is announced.
- `DestinationLink` gets a recipe (`.a63-DestinationLink`, also at `@atom63/ui-react/recipes/destination-link.css`): primary text, underline, accent on hover, an outline focus ring and a gap before the indicator.
- `--a63-skeleton-base` is declared on every light and dark scope, so a Skeleton inside a dark-scoped `UIProvider` uses the dark muted surface.
