---
'@atom63/ui-react': patch
'@atom63/mdx': patch
---

Keyboard focus rings are visible again where a component's own box-shadow used to replace them.

- `Button` draws its focus ring as an `outline` instead of an extra box-shadow layer, so recipes
  that set a Button's shadow no longer drop the ring. This fixes `ButtonGroup` members,
  `ScrollableList` scroll buttons, `ConnectedPanel` triggers and `CopyButton`. Forced-colors mode
  now shows the ring too.
- `ButtonGroup` members draw the ring inside their own edge, since a horizontal group scrolls and
  would clip an outer ring; on filled variants (primary, destructive, …) the ring takes the label
  colour. `ConnectedPanel` triggers also draw it inside.
- `ToggleGroup` items, pressed ones included, keep the standalone `Toggle` outline, and the focused
  item sits above its neighbours.
- `Tabs`: tabs draw the ring as an inset outline, so the active `attached` tab keeps it; on that
  tab it takes the label colour. Tab panels, which are tab stops, now show a ring.
- `CommandInput`: the search row rings while the input has keyboard focus.
- `@atom63/mdx`: `DocExample` tabs keep their ring when active, and `ImageCompare` rings the stage
  and the handle while the slider has keyboard focus.
