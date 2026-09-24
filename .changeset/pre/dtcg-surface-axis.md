---
'@atom63/styles': patch
---

The surface palette axis (`[data-a63-surface='n1'..'n6']`) is now defined as a DTCG Resolver file and
its CSS is generated; every value is unchanged. The resolver is exported as
`@atom63/styles/tokens/surface.resolver.json`. `--a63-surface-tint` is now declared in
`tokens/semantics.css`, next to the tokens it tints, with the same default of `0%`.
