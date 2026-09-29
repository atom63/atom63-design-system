---
'@atom63/ui-react': patch
---

Clear the last craft-baseline violations: the ScrollableList glass control uses the overlay shadow tokens and follows the theme, the Calendar dropdown draws its focus ring on `:focus-visible` only, and the appearance swatches use the `border` token ring instead of palette colors and a `dark:` variant.
