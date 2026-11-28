---
'@atom63/ui-react': patch
---

Readiness fixes from round 3:

- AppView's side panel and docked bar default to the neutral names "Sidebar" and "Bottom bar" instead of "Library" and "Player". Pass `panelLabel` and `bottomBarLabel` to name them after what they hold.
- EmptyErrorDetail can be controlled: `expanded`, `defaultExpanded` and `onExpandedChange`.
- Separator, the Resizable handle and inset ItemGroup dividers stay drawn in forced-colors mode.
- ScrollArea's `scrollFade` fades the correct horizontal edges in right-to-left scopes.
- Input keeps its own fill, text and caret colours when the browser autofills it.
- A horizontal ButtonGroup no longer clips its members' 44px touch targets on coarse pointers.
