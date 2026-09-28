---
'@atom63/styles': minor
'@atom63/ui-ios': patch
---

The Figma sync model (`@atom63/styles/figma-sync.json`) writes a color at an opacity, `color-mix(… var(--x) N%, transparent)`, as a composed value `{ "composed": { "alias": "--x", "opacity": N } }`, so it keeps its alias in every mode. `--a63-focus-ring` moves back to the Semantic collection this way. Every variable also carries `codeSyntax` (`var(--token)`) and Figma `scopes` from the rules in `scripts/lib/figma-sync-rules.mjs`. The iOS token graph resolves composed values the same way.
