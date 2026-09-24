---
'@atom63/styles': minor
---

Themes reach the token manifest and the Figma sync model. The manifest now includes `src/themes/` with a `theme` layer. The Figma model gains an **Atom63 Theme** collection with eight modes, one per theme × mode (`modern-light` … `terminal-dark`). Every token a theme overrides moves there, and each mode holds the value the browser resolves for that theme and mode. That is 31 variables from Contract, 8 from Mode, and theme-only hooks. A theme value Figma cannot hold, such as retro's four-sided rim border color, keeps its token in its own collection with the default value, with the reason listed in `skipped`. Variable modes need a Figma Professional plan or higher (up to 10 modes per collection). The Atom63 Figma plugin moves the affected variables on the next sync and keeps existing designs bound.
