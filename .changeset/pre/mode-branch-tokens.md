---
'@atom63/styles': minor
'@atom63/ui-react': patch
---

Add seven semantic tokens with light and dark values: `--a63-control-outline-background`, `--a63-control-outline-hover-background` and `--a63-control-outline-hover-border` (outline Button and the button-group ConnectedPanel), `--a63-alert-background` (default Alert), `--a63-choice-card-checked-border` and `--a63-choice-card-checked-background` (a checked FieldLabel) and `--a63-surface-recessed` (the Command panel). Those recipes read the tokens instead of branching on dark mode, and look the same.
