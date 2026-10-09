---
'@atom63/figma': minor
---

Add `buildDesignSystem`, `checkDesignSystem` and `readDesignSystemTable`: build the whole Atom63 design system in process (the token set with its text and effect styles, then every component and its spec card) with progress and one outcome whose status is pass, pending (only property references Figma is still reconciling) or fail; check it read-only; and read what a file holds (the Atom63 table, another project's template table, each component's set and card). `ComponentCounts` is now exported from the package root.
