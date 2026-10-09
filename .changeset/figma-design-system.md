---
'@atom63/figma': minor
---

Add `buildDesignSystem`, `checkDesignSystem` and `readDesignSystemTable`: build the whole Atom63 design system in process (the token set with its text and effect styles, then every component and its spec card) with progress and one outcome whose status is pass, pending (only property references Figma is still reconciling) or fail, or `blocked` (nothing written) when a template project's collections share Atom63's collection names and `allowCollisions` is not set; with it, the template's own variables and modes are never renamed or retired; check it read-only; and read what a file holds (the Atom63 table, another project's template table classified by collection, the colliding collection names, each component's set and card). `ComponentCounts` is now exported from the package root.
