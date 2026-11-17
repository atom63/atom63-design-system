---
'@atom63/styles': patch
'@atom63/ui-react': patch
---

`Sidebar` takes its background from `--a63-surface-sidebar` (muted in light mode, page in dark mode) instead of branching on dark mode in its recipe; it looks the same. The reverse shadcn bridge maps `--a63-surface-sidebar` to the host's `--sidebar`, falling back to `--muted`.
