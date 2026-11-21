---
'@atom63/ui-foundation': minor
'@atom63/ui-react': minor
---

Add ArtPlate, a full-bleed picture that owns its crop and keeps a safe area for headline and product UI: art-directed phone source, focal point per breakpoint, `size` (viewport, band, card), `safeArea`, `tone`, `veil`, eager loading with `priority`, and a CSS scroll-driven `parallax` that is off under reduced motion. `Image` from `@atom63/ui-react/media` takes `srcSet`, `sizes` and art-directed `sources`, which render a native `<picture>` with native lazy loading, and `aspectRatio="fill"` for a box sized by its parent.
