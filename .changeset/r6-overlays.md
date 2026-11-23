---
'@atom63/ui-react': patch
'@atom63/ui-foundation': patch
'@atom63/cli': patch
---

Menu rows (DropdownMenu, ContextMenu, Menubar, Select and Autocomplete) are at least 44px tall on touch, cap the popup at the available width and wrap long labels, and the submenu chevron mirrors in right-to-left. `DropdownMenuContent` and `DropdownMenuSubContent` honour `portalProps.container`. `PopoverAnchor` now positions the popup, `PopoverContent` takes `anchor`, `alignOffset` and `collisionPadding`, `PopoverPortal` falls back to `PortalContainerProvider`, and the popup scrolls and wraps long strings. The Dialog close button has a 44px touch target and a pressed state, and the Sheet header leaves room for its close button. Toaster stamps the `toast`, `toast-icon` and `toast-message` slots, takes its direction from the portal region, adds the safe-area insets to its offsets, draws an outline focus ring, gives its close and action buttons the touch floor, and mounts after hydration. The dropdown-menu and toaster contracts document `inset` and the tone functions.
