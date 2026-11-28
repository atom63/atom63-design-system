---
'@atom63/ui-react': patch
'@atom63/mdx': patch
---

Built files keep `'use client'`. A post-build step puts the directive back at the top of every built file that holds a `'use client'` source module, including the `provider`, `atom63-theme` and lightbox parts entries, so React Server Components bundlers see the client boundary. Three ui-react files that also carry server-safe exports (the `theme` and `media` entries and the lightbox internals) stay unmarked.
