---
'@atom63/styles': patch
---

The four themes (modern, aqua, retro, terminal) are now generated from DTCG resolvers in `src/themes/`. Each theme scope (the theme itself, and the theme in light or dark mode) is a resolver set with its own selector, and the sets keep source order. Values and selectors do not change. A theme's shadows are typed DTCG shadows, its border styles are `strokeStyle`, and its private helpers such as `--retro-bevel-drop` are tokens. Image and gradient layers, backdrop filters and blend modes stay in `*.native.css`, listed in `native-values.json`. The DTCG build and `tokens:apply` read `src/themes/`.
