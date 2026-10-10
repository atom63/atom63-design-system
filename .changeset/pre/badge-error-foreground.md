---
'@atom63/styles': patch
'@atom63/ui-react': patch
---

Add `--a63-badge-error-foreground` (danger 700 in light mode, danger 400 in dark mode) and use it for the `error` Badge text. The badge used the danger action fill as its text color, which fell to about 2.5:1 contrast on its tint in every dark theme.
