---
'@atom63/figma': minor
---

Compute `oklch()` colors in Node, absolute and relative (`oklch(from var(--primary) … )`), so `atom63-figma sync` writes the site template's whole token set, the foreground colors included. The Figma plugin computes them with the same code, so the plugin and the CLI write the same values.
