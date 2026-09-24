# Contributing to @atom63/mdx

This package owns reusable MDX prose, article providers, portable content blocks,
runtime preview helpers, and their CSS entrypoints.

## Public API rules

- Treat every package export in `package.json` as public.
- Add new public React blocks through a documented subpath or the `@atom63/mdx/blocks`
  barrel only when consumers should rely on it.
- Keep shared implementation foundations in `src/foundations/**`; do not import them
  from apps.
- Runtime/editor-only helpers belong in `@atom63/mdx/runtime` or `@atom63/mdx/editor`,
  not the root entry.
- Update `README.md` and the root `USAGE.md` when adding or removing public exports.

## Source layout

- `src/blocks/**` contains public MDX block components.
- `src/article/**` contains article provider helpers.
- `src/editor/**` contains editor/live-preview entrypoints.
- `src/runtime/**` contains runtime compile/highlight entrypoints.
- `src/primitives/**` contains public low-level authoring primitives exported from
  `@atom63/mdx/primitives`.
- `src/foundations/**` contains private intent foundations shared by blocks.
- `src/styles/**`, `src/blocks/**/*.css`, and `src/primitives/**/*.css` are copied
  into `dist` by `scripts/copy-css.mjs` during build.

Stories and package tests stay in source for local development, but the published
tarball is dist-only.

## Component standards

- Choose components by author intent first: notice, takeaway, comparison, media,
  example, or sequence.
- Prefer existing internal foundations before adding a new block-specific layout.
- Keep public props typed without `any`; prefer semantic HTML and keyboard behavior.
- Videos must have captions unless they are explicitly decorative.
- Motion must honor `prefers-reduced-motion`.

## Validation

Run the smallest checks that cover your change:

```bash
pnpm --filter @atom63/mdx build
pnpm --filter @atom63/mdx test
pnpm --filter @atom63/mdx typecheck
pnpm --filter @atom63/mdx lint
```

For release preparation, also run:

```bash
npm pack --dry-run --json --workspace packages/mdx
```

If lint warning count decreases, lower the package `--max-warnings` budget.
