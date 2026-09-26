---
'@atom63/styles': patch
---

The Figma sync model (`@atom63/styles/figma-sync.json`) now places a computed token by the axes its value actually varies on, measured in the browser under every theme and mode. Twenty-nine variables that were frozen at their default move to the axis they follow: nine space steps to Density, twelve radius steps to Radius, six type steps to Type Scale, and the primary foreground and focus ring to Brand. The companion plugin moves them and keeps their bindings. Fifty-nine variables vary on more axes than one Figma collection can hold; they keep their default value and are listed in the new `computed` array with the axes they vary on and their CSS expression.
