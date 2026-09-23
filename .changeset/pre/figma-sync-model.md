---
"@atom63/styles": minor
---

Add the `@atom63/styles/tokens.json` and `@atom63/styles/figma-sync.json` exports. `tokens.json` is the token manifest every renderer reads; `figma-sync.json` is the Figma variable model: one single-mode collection per token layer, one collection per personalization axis with the axis values as modes, aliases where a token references another synced token, and browser-resolved literals everywhere else.
