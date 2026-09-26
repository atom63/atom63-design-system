---
'@atom63/styles': patch
---

Color mixes that take a surface, text or border color now interpolate in oklab instead of oklch. The n2–n6 surface palettes are slightly tinted, and browsers disagree on the hue of a color that close to gray: Chrome took the brand's hue even at a 0% tint, so n2–n6 surfaces were tinted toward the brand in Chrome only, and the aqua, terminal and retro themes rendered differently in Chrome than in Safari and Firefox. With oklab every browser renders the same color. The default n1 surfaces do not change; Chrome's n2–n6 surfaces return to their palette hue, and the aqua, terminal and retro themes in Safari and Firefox now match Chrome. Mixes of two chromatic colors are unchanged.
