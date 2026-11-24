---
'@atom63/ui-react': minor
'@atom63/ui-foundation': patch
'@atom63/cli': patch
---

Table, Pagination, Card and Chart reach readiness. The Table and Pagination scrollers pad their edges and take the padding back with a negative margin, so the 44px touch targets and focus rings of controls at the edge are no longer clipped. TableHead and TableCell take `align="end"`, which ends the column in tabular figures (the contract adds `aligns`); a selected row keeps the system selection colours in forced colors; an overflowing table without a caption or label stays focusable but no longer gets the English region name "Table". Previous and Next given `children` are named by them instead of an English `aria-label`, and their labels are visually hidden, not removed, on narrow screens. `CardMediaOverlayIconButton` is now a round overlay `Button` (it was a `span`), so it has a name, keyboard access and a touch target; `CardMediaOverlayTopEnd` is added and `CardMediaOverlayTopRight` is deprecated; interactive and overlay cards have a pressed state (`:active` or `data-pressed`). Chart removes the deprecated `stacked` boolean (use `layout="stacked"`), cuts long category labels with an ellipsis, and its contract lists the `chart-empty` slot and the `empty` state.
