# @atom63/mdx

Single source of truth for MDX documentation and article content across atom63 apps.

## Public contract

Published package contents are dist-only. Runtime code, declaration files, and CSS
assets are emitted under `dist/`; `src/foundations/**`, tests, stories, and authoring
fixtures are repository-only implementation detail.

See `API.md` for the maintained public export snapshot.

Public import paths:

| Subpath | Stability | Use |
|---------|-----------|-----|
| `@atom63/mdx` | Stable | Core prose provider and default component maps |
| `@atom63/mdx/blocks` | Stable | Portable block component registry |
| `@atom63/mdx/blocks/credits-block` | Stable | Lightweight credits-only import |
| `@atom63/mdx/blocks/media-caption` | Stable | Lightweight caption-only import |
| `@atom63/mdx/article` | Stable | Article provider and app extension helpers |
| `@atom63/mdx/editor` | Stable | Source editor and live preview surfaces |
| `@atom63/mdx/runtime` | Stable | Runtime MDX compilation and Shiki helpers |
| `@atom63/mdx/lightbox` | Stable | Figure lightbox integration |
| `@atom63/mdx/primitives` | Experimental | Low-level layout, frame, motion, and slot authoring primitives |
| `@atom63/mdx/styles/index.css` | Stable | Full raw stylesheet entry for hosts that already provide `--a63-*` |
| `@atom63/mdx/styles/a63.css` | Stable | Atom63 app stylesheet adapter |
| `@atom63/mdx/styles/shadcn.css` | Stable | shadcn-token stylesheet adapter |
| `@atom63/mdx/styles/consumer.css` | Stable | Backward-compatible alias for `styles/index.css` |
| `@atom63/mdx/styles/mdx-blocks.css` | Stable | Block CSS without the consumer Tailwind scan |

Anything under `src/foundations/**` is private and can change without a release note.

## Package layout

```
@atom63/mdx                 Core prose, MDXContentProvider, DocsMDXContentProvider
@atom63/mdx/blocks          Callout, ColorSwatchItem, CreditsBlock, FigureBlock, VideoBlock, MediaCaption, ExampleContainer
@atom63/mdx/article         ArticleMDXContentProvider, createMdxComponents(), mediaSpacingStyles
@atom63/mdx/editor          MdxLivePreview, MdxSourceEditor, MdxSourceView
@atom63/mdx/runtime         Runtime MDX compile hooks and Shiki helpers
@atom63/mdx/primitives      Experimental layout, frame, motion, and slot authoring primitives
@atom63/mdx/styles/index.css        Full raw stylesheet entry + Tailwind scan
@atom63/mdx/styles/a63.css          Atom63 app adapter (prefer this in Atom63 apps)
@atom63/mdx/styles/shadcn.css       External shadcn-token adapter
@atom63/mdx/styles/consumer.css     Back-compat alias for styles/index.css
@atom63/mdx/styles/mdx-blocks.css   Block recipes without the consumer scan
```

Stylesheet internals are split by responsibility:

- `a63.css` and `shadcn.css` are adapters.
- `index.css` is the raw runtime bundle with the package Tailwind `@source`.
- `consumer.css` is a backward-compatible alias for `index.css`.
- `mdx-blocks.css` is the no-scan public bundle.
- `base.css` and `block-recipes.css` are private implementation imports copied to
  `dist` so the public CSS files resolve after publish.

## Provider variants

| Variant | Layout | Default preset |
|---------|--------|----------------|
| `article` | Full-width prose root | `MDXContentProvider` |
| `narrow` | Text `max-w-xl`, media full width | `ArticleMDXContentProvider` |
| `docs` | Doc rhythm + wider code | `DocsMDXContentProvider` |

Presets live in the package — apps re-export rather than hard-code defaults:

```tsx
// apps/atom63.io/src/components/common/mdx/mdx-provider.tsx
export { ArticleMDXContentProvider as MDXContentProvider } from '@atom63/mdx/article'

// apps/docs/src/mdx/mdx-provider.tsx (atom63-design-system)
export { DocsMDXContentProvider as MDXContentProvider } from '@atom63/mdx'
```

## App setup (Tailwind v4)

Atom63 apps should import the Atom63 adapter after `@atom63/styles`, Tailwind, and any shadcn bridge. It includes block CSS and `@source` for this package so `narrow` / `docs` variant classes compile:

```css
@import "tailwindcss";
@import "@atom63/styles";
@import "@atom63/styles/tailwind";
@import "@atom63/styles/compat/shadcn";
@import "@atom63/mdx/styles/a63.css";
@source "../../node_modules/@atom63/ui-react/dist/**/*.js"; /* your UI scan */
```

Do **not** duplicate `@source` paths to `packages/mdx` in app CSS — the consumer owns that.

The figure lightbox is `MediaLightbox` from `@atom63/ui-react`, so the app also needs its recipe: `@atom63/ui-react/recipes.css` (or `@atom63/ui-react/recipes/media-lightbox.css` on its own).

The stylesheets ship from `src/` and scan both the TS/TSX source (workspace) and the emitted `dist/` JS (installed package).
That keeps linked local apps and installed consumers on the same CSS entrypoint.

External shadcn apps that do not load `@atom63/styles` can use
`@atom63/mdx/styles/shadcn.css` after their shadcn variables are defined. Hosts
that already provide canonical `--a63-*` tokens can import
`@atom63/mdx/styles/index.css`; `consumer.css` is kept as a compatibility alias.

## Article / portfolio MDX

```tsx
import { ArticleMDXContentProvider } from '@atom63/mdx/article'
import { createMdxComponents } from '@atom63/mdx/article'

const components = createMdxComponents({ MediaBlock, ImageBlock /* site media */ })

<ArticleMDXContentProvider components={components}>
  <Article />
</ArticleMDXContentProvider>
```

## Design-system MDX

```tsx
import { DocsMDXContentProvider, mdxComponents } from '@atom63/mdx'

<DocsMDXContentProvider components={{ ...mdxComponents, DocExample }}>
  <Page />
</DocsMDXContentProvider>
```

Site-specific media (`MediaBlock`, carousels, Compare) stays in atom63.io — see `apps/atom63.io/src/content/work/project-mdx-components.tsx`.

## Block inventory

Registered on `mdxComponents` / `blockMdxComponents`:

| Component | Purpose |
|-----------|---------|
| `Callout` | Info, warning, error, success callouts |
| `ColorSwatchItem` | Token swatch with checkerboard preview |
| `CreditsBlock` | Collapsible project credits |
| `DemoStage` | Framed surface for live demos or centerpiece visuals |
| `ExampleContainer` | Live demo frame with dot grid |
| `FigureBlock` | Captioned image figure with a connected `MediaLightbox` gallery (default on) |
| `MediaCaption` | Centered figure caption |
| `VideoBlock` | Captioned or explicitly decorative video figure |

Article-only components (atom63.io): `MediaBlock`, `ImageBlock`, `ImageCarousel`, `ImageGrid`, `BeforeAfter`, `LinkCard`.

## Intent taxonomy

Choose blocks by author intent before visual shape:

| Intent | Component |
|--------|-----------|
| Reader notice, caveat, success state | `Callout` |
| One prominent takeaway | `KeyIdea` |
| Conceptual before/after or option comparison | `Compare` |
| Live/demo before-after comparison | `ComparisonPair` |
| Draggable media before-after comparison | `ImageCompare` |
| Captioned media figure | `FigureBlock`, `VideoBlock` |
| Centerpiece live demo or visual stage | `DemoStage` |
| Live demo surface | `ExampleContainer` |
| Reference demo with preview/code tabs | `DocExample` |
| Ordered sequence or dated history | `Steps`, `Timeline` |

## Dependency intent

The base provider and block registry are normal React UI, but several features lazy-load
heavier libraries behind narrower user actions:

| Dependency | Why it exists |
|------------|---------------|
| `@mdx-js/mdx` | Runtime compilation in `@atom63/mdx/runtime` and live preview |
| `react-simple-code-editor` | `@atom63/mdx/editor` source editing |
| `shiki` | Code block/source highlighting, loaded on demand |
| `react-compare-slider` | `ImageCompare` block |
| `beautiful-mermaid` | Mermaid diagram block |

Keep new runtime dependencies explicit in `dependencies`; keep only `react` and
`react-dom` as peers so consumers get one shared React copy.

## Release checks

Before publishing or preparing an open-source release:

```bash
pnpm --filter @atom63/mdx build
pnpm --filter @atom63/mdx test
pnpm --filter @atom63/mdx typecheck
pnpm --filter @atom63/mdx lint
npm pack --dry-run --json --workspace packages/mdx
```

The package tests assert the public export map and packed file list so accidental
source/test/story publication fails locally.
