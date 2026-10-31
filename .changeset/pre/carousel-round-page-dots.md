---
'@atom63/ui-foundation': minor
'@atom63/ui-react': minor
---

CarouselDots takes `shape` (`dot` or `pill`) and `tone` (`neutral`, `accent` or `on-media`) from the new `dotShapes` and `dotTones` axes of the carousel contract. The default is now round dots that mark the current page by colour and sit 24px apart; pass `shape="pill"` for the previous look, where the current dot stretches into a pill. `tone="accent"` draws the current dot in the primary action colour, and `tone="on-media"` draws white dots from the `--a63-on-media-*` tokens for carousels of photos or video.
