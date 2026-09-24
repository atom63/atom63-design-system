# @atom63/mdx Public API

This file is the source-level snapshot of the package contract. If an export is
added, removed, or reclassified, update this file in the same change.

## Stable Runtime Imports

| Import | Purpose |
|--------|---------|
| `@atom63/mdx` | Core prose provider, docs provider, and component maps |
| `@atom63/mdx/blocks` | Portable MDX block registry |
| `@atom63/mdx/blocks/credits-block` | Lightweight credits block import |
| `@atom63/mdx/blocks/media-caption` | Lightweight media caption import |
| `@atom63/mdx/article` | Article provider, component-map extension helper, article spacing helpers |
| `@atom63/mdx/editor` | Source editor, source view, and live preview components |
| `@atom63/mdx/lightbox` | Figure lightbox helpers and PhotoSwipe integration components |
| `@atom63/mdx/runtime` | Runtime MDX compiler hook and Shiki highlight helpers |

## Experimental Runtime Imports

| Import | Purpose |
|--------|---------|
| `@atom63/mdx/primitives` | Low-level layout, frame, motion, and slot authoring primitives |

## Stylesheet Imports

| Import | Purpose |
|--------|---------|
| `@atom63/mdx/styles/index.css` | Full raw stylesheet entry; expects canonical `--a63-*` variables and includes the Tailwind source scan |
| `@atom63/mdx/styles/a63.css` | Recommended Atom63 app stylesheet adapter; expects `@atom63/styles` and includes the MDX motion bridge |
| `@atom63/mdx/styles/shadcn.css` | External shadcn-token app adapter; derives canonical `--a63-*` variables from shadcn variables |
| `@atom63/mdx/styles/consumer.css` | Backward-compatible alias for `@atom63/mdx/styles/index.css` |
| `@atom63/mdx/styles/mdx-blocks.css` | Block CSS without the consumer Tailwind scan |

## Private Implementation

The following are not public API:

- `src/foundations/**`
- `src/test/**`
- `src/**/*.test.ts`
- `src/**/*.test.tsx`
- `src/**/*.stories.tsx`
- Any generated chunk filename under `dist/chunk-*.js`

Consumers should import only through the package export map. Published package
code is dist-only; source files are repository implementation detail.
