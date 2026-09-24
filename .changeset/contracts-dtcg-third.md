---
'@atom63/styles': patch
---

The menu, environment and widget contracts are now generated from DTCG resolvers in `src/contracts/`, so every contract is generated. Their scopes are resolver sets with their own selectors, including the density, design-language and input axes, the radius override, the weather tones, and `@media` / `@supports` conditions. Values, selectors and source order do not change. Safe-area `env()` values, viewport heights, image layers, backdrop filters, blend modes and the iOS press transform stay in `*.native.css`, listed in `native-values.json`. The DTCG build accepts resolvers made of sets only and wraps a set in its `atRule`. `tokens:apply` only writes a single-mode change into an unconditional `:root` set, and explains when a token is declared only in conditional scopes.
