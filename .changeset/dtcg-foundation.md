---
'@atom63/styles': patch
---

Foundation primitives and the color palette are now defined in DTCG 2025.10 files, and their CSS is
generated from them. Every CSS custom property keeps its name and value. The DTCG sources are
exported as `@atom63/styles/tokens/foundation/primitives.tokens.json` and
`@atom63/styles/tokens/foundation/palette.tokens.json` for tools such as Style Dictionary and
Terrazzo.
