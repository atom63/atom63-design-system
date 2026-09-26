---
'@atom63/styles': patch
---

The mode-scoped semantic layer (`semantics.css`: surfaces, text, borders, the neutral and danger actions and status accents for light and dark mode, plus the mode-agnostic surface tint and scrim) is now generated from the DTCG resolver `src/tokens/semantics.resolver.json`. The surface-tint `color-mix()` formulas are declared as `io.atom63.derive` expressions over their inputs. Values and selectors do not change. The DTCG build lets a resolver name the selector of each context, which the mode axis uses for its `.light` / `.dark` classes.
