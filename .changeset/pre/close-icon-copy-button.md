---
'@atom63/ui-react': patch
---

`DialogPopup` and `SheetPopup` use `closeProps.children` as the close button's content when given, so the close icon can be replaced. `CopyButton` forwards other button props (including `onClick`, which runs before the copy), clears its reset timer on unmount, and no longer puts the copied value in its `title`, which showed it on hover; the title is the label.
