---
'@atom63/styles': minor
'@atom63/ui-react': patch
---

Add media and on-media color tokens for controls over photos and video. Media colors are unknowable, so these tokens hold in every theme:

- `--a63-media-stage` (black) and `--a63-media-scrim` (black 70%) for the area behind full-screen media.
- `--a63-on-media-foreground`, `--a63-on-media-surface` (+ `-strong`), `--a63-on-media-border`, `--a63-on-media-ring` and `--a63-on-media-veil` (+ `-strong`) for controls that sit on it.

They alias the black and white alpha steps. `compat/a63-from-shadcn` defines them too.

ui-react's MediaLightbox, VideoDialog and VideoModal now read these tokens instead of literal colors. The lightbox's `--a63-lightbox-on-media-*` hooks stay and point at them. Snapping to the alpha steps moves the lightbox control backplate from 55% to 60% black, its border from 16% to 20% white and its focus ring from 85% to 90% white. VideoModal's "No video available" placeholder follows the theme's muted surface and secondary text.
