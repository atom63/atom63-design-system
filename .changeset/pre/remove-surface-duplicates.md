---
'@atom63/styles': minor
---

Remove the duplicate default surface ramp. `tokens/foundation/aliases.css` and `aliases.tokens.json` declared the 24 `--surface-light-*` / `--surface-dark-*` defaults a second time; `surface.resolver.json` already provides them at `:root` through its default n1 context. The exports `@atom63/styles/tokens/foundation/aliases` and `@atom63/styles/tokens/foundation/aliases.tokens.json` are removed. Values do not change for anyone importing `@atom63/styles` or `@atom63/styles/tokens`. A stylesheet that imports only `tokens/foundation` must also import `tokens/surface` for the surface ramp. The Figma sync model does not change: it already listed these variables once, in the Surface collection.
