---
'@atom63/styles': minor
---

Adds `--a63-gradient-brand-fade`, a vertical hero gradient that fades from the brand into the page (brand 800 at the top, brand 700 at the end of the dark zone, then `--a63-surface-page`), declared per mode so it follows theme, brand and mode. `--a63-gradient-brand-fade-dark-zone` (50%) is the top share of the hero where white on-media text and overlay controls reach WCAG AA on every brand; content over the faded part uses the page tokens. The contrast tests check white on brand 700 and 800 for every brand.
