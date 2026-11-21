---
'@atom63/ui-react': minor
---

Add `actions` and `toolbar` to `MediaLightbox`. `actions(item, index)` renders the caller's buttons in a row in the bottom dock, above the thumbnails; `toolbar(item, index)` adds controls at the start of the top-right cluster beside Close. Both are chosen per item, fade with the rest of the chrome, clear the safe areas, stay inside the focus trap, and never page, zoom or close on a press. The `Carousel` docs now point full-screen viewers to `MediaLightbox`, and the package README lists it.
