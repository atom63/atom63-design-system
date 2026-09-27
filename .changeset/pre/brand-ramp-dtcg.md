---
'@atom63/styles': patch
---

The brand ramp (`--a63-brand-50..950` for b1–b6 and `auto`) is now generated from the DTCG resolver `src/tokens/brand-ramp.resolver.json` into `brand-ramp.css`, which `brand.css` imports. Values and selectors do not change. The DTCG build supports `$extensions["io.atom63.derive"]` for tokens whose CSS value is computed, such as the `auto` ramp's runtime fallback.
