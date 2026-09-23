# @atom63/docs

The design-system documentation site — the public, browsable source of truth for the Atom63 foundation (`--a63-*` tokens, the personalization axes, components, patterns). It resolves the workspace packages to source through the `@atom63/source` condition, so edits to components show up live.

```bash
pnpm dev:docs     # dev server on port 6200
pnpm build:docs   # build (also the fastest way to verify a page compiles)
```

## Authoring doc pages

Pages are **auto-discovered** — there is no central page registry to edit. The nav builds itself from the files. Mechanics live in [`src/lib/doc-pages.ts`](src/lib/doc-pages.ts). MDX rendering components live in `src/mdx-kit`, a copy of the parts of `@atom63/mdx` the site uses, so the site depends only on the design system.

- **A prose page is** `src/pages/<slug>.mdx` — plain MDX: `# Title`, prose, `##` sections, tables, and any imported DS components. **No frontmatter.**
- **Its nav group comes from the filename PREFIX:** `architecture-*` → Architecture; `foundation-*` → Foundations; `theme-*` → Themes; `component-*` → Components; `pattern-*` → Patterns. Legacy slugs from before the move redirect through `LEGACY_DOC_SLUG_ALIASES`.
- **Its nav label is derived** from the slug (prefix stripped + humanized: `foundation-personalization` → "Personalization"). Override in `NAV_LABEL_OVERRIDES` only when that inference is wrong.
- **Its order within a section** comes from the `SECTION_ORDER` map in `doc-pages.ts`. Listed slugs sort first, in array order; unlisted slugs sort alphabetically after. Add a slug there to place a new page deliberately.

**To add a page:** drop the `.mdx` in `src/pages/`, (optionally) add its slug to the right `SECTION_ORDER` array, and run the build to confirm it compiles and emits a per-page chunk.

> Note: `.md`/`.mdx` are excluded from Prettier — do not run the formatter on doc pages.

The public Components catalog and its reference routes are generated from `src/lib/component-catalog.ts`. Keep one entry for every `src/components/*` family exported from the root `@atom63/ui-react` barrel; the public `/layout`, `/media`, `/theme`, and provider surfaces stay in their dedicated documentation areas. `component-catalog.test.ts` guards inventory parity, root exports, recipe targets, representative stories, and focused-test status. A co-located MDX page such as `component-button.mdx` overrides the generated reference when a component needs deeper decision documentation. Storybook remains the internal exhaustive state and regression environment; the public site gives every catalog family a representative preview, correct import, actual root export surface, concise guidance, and related components.

`architecture-changelog.mdx` is a generated-data page. `vite-plugins/changelog-data.ts` reads pending `.changeset/*.md` files and released package `CHANGELOG.md` files into a virtual module; the page must not duplicate release entries by hand. Its Markdown twin is expanded from the same data so Copy Markdown, per-page `.md`, and `llms.txt` stay useful.

The header intentionally exposes only two navigation domains: **System** and **Components**. The five canonical content areas and routes remain intact underneath them. `DOC_NAV_DOMAINS` controls this global grouping; do not add every content area back to the horizontal header.

## Content conventions

Follow [`docs/DOCUMENTATION_GUIDE.md`](../../docs/DOCUMENTATION_GUIDE.md) for page archetypes, copy craft, the authored/generated boundary, change triggers, and focused checks. Do not duplicate that guidance here.

**Current model:** the docs describe the DS-native `--a63-*` semantic layer, `@atom63/styles` contracts, `@atom63/ui-foundation` typed vocabulary, and `@atom63/ui-react` renderer. Treat references to archived packages or old namespaces (`@atom63/tokens`, `@atom63/ui`, `data-ui-theme`, broad `--theme-*` component variables) as migration residue to remove when touched. The target information architecture is **Foundation** (token and axis architecture) → **Components** → **Patterns** → **Products** (OS63/Atom63 as consumers, not owners).
