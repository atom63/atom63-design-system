---
'@atom63/styles': patch
---

The radius and effects foundations, the space and motion intents, and the radius, font and type-scale axes are now generated from DTCG sources. Radius, font and type-scale are resolvers with one modifier each (`data-a63-radius`, `data-a63-font`, `data-a63-type-scale`); motion keeps its reduced-motion overrides as a resolver set under `@media (prefers-reduced-motion: reduce)`. Values and selectors do not change, and the token manifest and Figma sync model are byte-identical. The DTCG build now accepts the `fontWeight` type. Only the responsive type scale is still written in CSS.
