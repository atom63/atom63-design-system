---
'@atom63/styles': minor
'@atom63/ui-react': patch
---

Add `--a63-shadow-color`, the ink of drop shadows (black in every theme). The Card, Slider, Switch and ToggleGroup recipes take their shadow and edge colors from it, and the Card media overlay takes its scrim and icon button colors from `--a63-media-stage` and `--a63-on-media-foreground`, with no visual change. The overlay's top-end corner is now logical, so it mirrors in right-to-left layouts. The reverse shadcn bridge defines the shadow, media and on-media tokens for hosts that skip the foundation.
