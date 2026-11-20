---
'@atom63/ui-react': patch
---

`Dialog`, `AlertDialog`, `Drawer`, `CommandDialog`, `ContextMenu`, `NavigationMenu` and `Autocomplete` now portal into the node from `PortalContainerProvider` when one is set, as the other overlays already did; an explicit portal `container` (or `portalContainer`) still wins. `CommandDialogPortal` is now a component instead of an alias of the Base UI part.
