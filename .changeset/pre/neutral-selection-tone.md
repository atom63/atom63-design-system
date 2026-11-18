---
'@atom63/styles': minor
'@atom63/ui-foundation': minor
'@atom63/ui-react': minor
---

Selection is neutral by default. `--a63-selected-background` is now the muted surface and `--a63-selected-foreground` the primary text color; the previous primary wash and accent text move to the new `--a63-selected-accent-background` and `--a63-selected-accent-foreground` (Tailwind `selected-accent` and `selected-accent-foreground`). Item, Table (on the container, for selected rows), SidebarMenuButton, SidebarMenuSubButton and the SidebarNavTree items take `tone` (`neutral` by default, or `accent`). SidebarNavTree's active row is now a neutral plate with primary text; `tone="accent"` keeps the accent text. Slider and Progress take `tone` (`accent` by default, or `neutral` for a primary-text fill on the muted track). Progress exports `ProgressProps`.
