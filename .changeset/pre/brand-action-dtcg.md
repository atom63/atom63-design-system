---
'@atom63/styles': patch
---

The primary action block of the brand axis (`--a63-action-primary`, hover, foreground, text shadow, `--a63-brand-text`, `--a63-focus-ring`, and the b2 and b3 exceptions) is now generated from the DTCG resolver `src/tokens/brand-action.resolver.json` into `brand-action.css`. `brand.css` only imports the two generated files. Values and selectors do not change. The DTCG build supports resolver sets with their own selector, contexts with no tokens, token descriptions as CSS comments, and an empty shadow list as `none`.
