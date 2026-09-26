---
'@atom63/styles': patch
---

The responsive type scale is now generated from `src/tokens/foundation/typography.resolver.json`. Its breakpoints are one Viewport modifier (xs, sm, md), written from the same values both as the `@media (min-width: …)` blocks on `:root` and as the `[data-window-size]` rules, so the two can no longer drift apart. Each step is a DTCG dimension with the formula `calc({$value} * var(--typography-scale, 1))`. The `.text-scale-*` classes are resolver sets under `@layer base`, and the `small` element style moves to `typography.native.css`. Declarations, values and selectors do not change. The DTCG build gains `{$value}` in derive expressions and explicit `emit` targets for a modifier. Every token in the manifest is now generated from DTCG or listed as a CSS-native value.
