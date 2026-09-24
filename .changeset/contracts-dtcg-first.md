---
'@atom63/styles': patch
---

The action, segment, badge and skeleton contracts are now generated from DTCG sources in `src/contracts/` (`action.tokens.json`, `segment.tokens.json`, `badge.resolver.json`, `skeleton.resolver.json`). Values and selectors do not change. Contract values with no DTCG type stay in hand-written `*.native.css` files, which the generated contract CSS imports. Every such value is listed with a reason in `src/tokens/native-values.json`, and `check:dtcg` fails on an unlisted one. The DTCG build also reads `src/contracts/`, accepts aliases to custom properties that the package's CSS still declares by hand, and supports `$extensions["io.atom63.css"].imports`.
