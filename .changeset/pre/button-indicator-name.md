---
'@atom63/ui-react': patch
---

Button's default indicator name uses the count as drawn ("99+ new" above 99), so the visible count is part of the accessible name.

Button `destructive-outline` draws its text in `--a63-action-danger-subtle-foreground`, which keeps AA contrast on its tint in dark mode.
