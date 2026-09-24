---
'@atom63/styles': patch
---

`@atom63/styles` generates `atom63.computed-values.json`: the browser-resolved values of the variables in the Figma sync model's `computed` list, for every combination of the axes they vary on. The iOS package reads it so that `AtomTheme(skin:brand:surface:)` follows the web's skin, brand and surface axes; the file is not part of the npm package.
