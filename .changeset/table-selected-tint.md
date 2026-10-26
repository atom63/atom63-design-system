---
'@atom63/ui-react': patch
---

A selected `Table` row (`data-state="selected"`) uses the selection tint, `--a63-selected-background` and `--a63-selected-foreground`, the same as a selected `Item`, instead of a solid `--a63-action-primary` fill with its foreground. Sticky cells and the cells of a framed table lay the translucent tint over their page surface. Tables that relied on the solid accent bar now show a subtle accent wash with accent text.
