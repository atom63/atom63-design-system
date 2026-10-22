---
'@atom63/ui-react': patch
---

`SidebarProvider` no longer takes Cmd/Ctrl+B from text fields and rich-text editors, accepts a `keyboardShortcut` prop (a key, or `false` to turn the shortcut off), and writes the `sidebar_state` cookie only when its open state is uncontrolled.
