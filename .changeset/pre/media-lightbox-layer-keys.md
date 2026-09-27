---
'@atom63/ui-react': patch
---

Fix two `MediaLightbox` issues. The backdrop now sits on the same fixed `z-50` layer as the content. Before, it was `absolute` with no z-index, so a positioned page header with a z-index painted above it. `Lightbox.Portal` now keys its children, which removes the React duplicate-key warning that every open raised.
