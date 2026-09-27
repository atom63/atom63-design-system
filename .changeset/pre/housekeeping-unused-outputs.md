---
'@atom63/styles': patch
'@atom63/ui-react': patch
---

`@atom63/styles` no longer generates or ships `generated/atom63.figma-tokens.json`. It had no package export and no known consumer; the Figma plugin reads `@atom63/styles/figma-sync.json`, which is unchanged. `@atom63/ui-react` drops its unused direct `date-fns` dependency; `react-day-picker` still brings its own copy, so Calendar behavior does not change.
