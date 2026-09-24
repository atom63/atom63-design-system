---
'@atom63/styles': patch
---

The foundation surface aliases, font families and motion tokens are now defined in DTCG files and
generated, and are exported as `@atom63/styles/tokens/foundation/{aliases,fonts,motion}.tokens.json`.
Values are unchanged, except that `--font-family-serif` and `--font-family-mono` now quote every
non-generic family name (for example `'Georgia'`, `'Menlo'`), which CSS treats the same.
