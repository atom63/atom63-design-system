---
'@atom63/ui-react': minor
'@atom63/ui-foundation': patch
---

Sidebar's `side` is now logical: `left` is the inline start, so under `dir="rtl"` the desktop panel and its border sit on the right and the phone sheet opens from the right. The desktop panel pads its outer edge by the safe-area inset and reserves that width beside the content. Add `mobileTitle` and `mobileDescription` to `Sidebar` and `label` to `SidebarTrigger` for the built-in accessible names, and export `SidebarTriggerProps`.
