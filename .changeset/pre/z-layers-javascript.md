---
'@atom63/styles': patch
---

`@atom63/styles/z-layers` now ships compiled JavaScript with a type declaration instead of a
TypeScript source file, so plain JavaScript projects, Node and bundlers that do not transpile
`node_modules` can import `Z_LAYERS`. The values are generated from the `--z-layer-*` tokens in
`primitives.css` and are unchanged; the object is now frozen.
