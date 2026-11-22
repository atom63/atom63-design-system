---
'@atom63/mdx': patch
---

The `@atom63/mdx` entries now tree-shake. Each module a public entry re-exports is built as its own file, and the entries are lists of re-exports over them, so a bundler drops the blocks an app does not import. One import now costs a consumer bundle 0.8 kB gzip for `isExternalMdxHref` (was 160.9 kB) and 19.7 kB for `Accordion` from `./blocks` (was 100.8 kB). The public exports are unchanged.

`createMdxComponents`, `mdxComponents` and `blockMdxComponents` now register every name in `portableBlockNames`: `KeyIdea`, `Compare`, `ImageCompare`, `LayerStack` and `MdxPageSkeleton` work in MDX without being passed in.

`KeyIdea`, `Steps` and `Timeline` draw one boundary: the tray keeps its fill and shadow, and the panel inside it has no ring, fill or shadow.
