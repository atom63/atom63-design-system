---
'@atom63/ui-react': patch
---

Generate custom (`auto`) brand ramps in OKLCH instead of HSL. Each step takes its lightness and chroma from the built-in b1 ramp, with chroma scaled by the input saturation and lowered to fit the sRGB gamut. Every hue now lands at the same perceived lightness per step, so white on step 600, step 600 as text on the light page, and step 400 as text on the dark page all meet WCAG AA. Yellow and green hues used to fall as low as 1.7:1. The `applyAutoColorRamp` signature does not change.
