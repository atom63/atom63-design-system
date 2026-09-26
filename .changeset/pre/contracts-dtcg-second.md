---
'@atom63/styles': patch
---

The choice, control, field, marker, overlay, selection, surface, toggle, track and trigger contracts are now generated from DTCG token files in `src/contracts/`. Values and selectors do not change. Shadows are DTCG `shadow` values (layers with offsets, blur, spread and color), border styles are `strokeStyle`, and the exact CSS text is kept with `io.atom63.derive`. Image and gradient layers, backdrop filters, blend modes, transforms and an em-sized indicator stay in `*.native.css`, listed in `native-values.json`. The DTCG build writes shadow objects and stroke-style keywords.
