---
'@atom63/ui-foundation': minor
'@atom63/ui-react': minor
---

Add AppView to `@atom63/ui-react/layout`: the full-window frame of a product view, for a window or a phone screen. Only the main region scrolls, each safe-area inset has one owner, `chrome="flush"` runs a window's columns to its edges, and `overlay` floats content over the main region. Its contract (layouts, chromes, slots) ships from `@atom63/ui-foundation`.
