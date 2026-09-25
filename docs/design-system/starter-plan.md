# Starter plan: create a project with Atom63

Status: decided, 2026-09-25. S1 A; S2 A (Tailwind, and the starter doubles as the "Tailwind +
shadcn starter kit"); S3 A; S4 A; S5 adopted. S6–S8 were added after review and take their
recommended options. This plan replaces the template library as the next phase C step; the
template library is deferred (see `template-library-plan.md`).

## Goal

One command creates a new app that is already wired the way the quickstart describes, so a person
or an agent starts from a correct setup instead of assembling it:

```bash
pnpm create @atom63 my-app        # once published; in this repo: pnpm create:app my-app
cd my-app && pnpm install && pnpm dev
```

The generated app follows `docs/design-system/quickstart.md`:

- it depends on `@atom63/styles` and `@atom63/ui-react` from npm;
- it imports `@atom63/ui-react/styles.css` once;
- `Atom63Theme` wraps the app.

It also starts with a small, real page built only from system components, and with guidance for
coding agents.

## What exists

- **`examples/vite-basic`** is the minimal consumer, but it is a feature demo (a 226-line `App`
  and 383 lines of custom CSS) that resolves workspace sources. It is not a clean starting point.
- **`scripts/design-system/smoke-packed-ui-react.mjs`** already packs the packages into tarballs,
  installs them into a temporary consumer, and runs `tsc` and `vite build`. The starter's CI check
  can use the same method.
- **`create-atom63` in atom63-vite** is a private starter for client handoff sites. It copies UI
  primitives and token CSS into the project instead of depending on the packages. It serves a
  different purpose, and this plan leaves it alone.

## Decisions

### S1. Name and home

- **Options:**
  - **A. `@atom63/create` in this repo** (`packages/create`). npm maps `npm create @atom63` and
    `pnpm create @atom63` to it. Until it is published, the root script `pnpm create:app <name>`
    runs it.
  - **B. Reuse the name `create-atom63`.**
- **Trade-offs:** A has no clash with the atom63-vite starter and matches npm's scoped create
  convention. B collides with a package that already exists and does something else.
- **Recommendation: A**, private until release work resumes. The first publish is manual, as for
  `@atom63/mdx`.

### S2. What the app contains

- **Stack:** Vite, React 19 and TypeScript, with `dev`, `build` and `typecheck` scripts.
- **Setup:** exactly the quickstart: the package CSS import and `Atom63Theme`, plus a mode switch
  (light and dark) and a theme picker, so the axes are visible from the first run.
- **One starter page:**
  - `Page`, `Section` and `SectionHeader`;
  - a card with a small form (`Field`, `Input`, `Button`);
  - a `Badge` and an `Empty` state.

  It uses only system components and tokens, and it passes `check:craft`'s rules.
- **Tailwind (the one real choice):**
  - **A. Include Tailwind v4** wired to `@atom63/styles/tailwind`, so utilities such as
    `bg-background` and `text-muted-foreground` resolve to tokens. This matches the goal of
    "familiar to Tailwind and shadcn users".
  - **B. No Tailwind:** plain CSS with `--a63-*` variables only, as in the quickstart.

  A costs one plugin and one CSS import, and teams will add Tailwind anyway; wiring it to the
  tokens up front stops them from wiring it to the default palette. B is the smallest possible
  app.
  **Recommendation: A.**

### S3. Package versions

- **Options:**
  - **A. The versions in this repo at generation time.** They are the published betas, because
    only the Version Packages release bumps them, and that release publishes.
  - **B. The `beta` dist-tag.**
- **Trade-offs:** A gives a reproducible app that matches the docs it was generated beside. B
  drifts to whatever is newest at install time.
- **Recommendation: A.** When the starter is published, it bakes the versions in at pack time.

### S4. Agent guidance in the app

- **Background:** `@atom63/cli` is not published yet, so a generated app cannot run `atom63` or
  its MCP server.
- **Options:**
  - **A. Ship `AGENTS.md` with the rules block** from the shared rule table. It points agents at
    the published docs (`https://system.atom63.io/llms.txt` and the per-page `.md`), which work
    today. Swap in the `atom63` commands and a `.mcp.json` once the CLI is published.
  - **B. No agent files** until the CLI ships.
- **Trade-offs:** A gives agents the rules and a working source of truth from the first commit.
  B leaves them to guess.
- **Recommendation: A.** `atom63 agents` gains a variant for projects without the CLI, and both
  come from the same table.

### S5. Verification

- **Proposal:** a CI check (`check:starter`) that:
  1. generates an app into a temporary directory;
  2. points its `@atom63/*` dependencies at freshly packed tarballs (the pack-smoke method);
  3. installs;
  4. runs `typecheck` and `build`;
  5. runs `check:craft`'s rules over the generated source.

  Unit tests cover the generator itself: file list, names, versions, and refusing a non-empty
  directory.
- **Recommendation:** adopt it. A starter that silently breaks is worse than none.

### S6. MDX content

- **Background:** every kind of site (documentation, portfolio, landing page) sooner or later
  needs long-form content such as a blog, changelog or case studies. `@atom63/mdx` already
  renders that with system typography. It has an article variant (narrow reading column) and a
  docs variant.
- **Proposal:** every starter includes the MDX pipeline:
  - `@mdx-js/rollup` in Vite;
  - `@atom63/mdx` with its stylesheet and provider;
  - a `content/` folder of `.mdx` files with frontmatter;
  - a list page and a post page generated from the folder.
- **Dependency:** `@atom63/mdx` is not on npm yet. A generated app can install it only after its
  first publish (the manual step already pending). Until then the CI check installs it from a
  local tarball.
- **Recommendation:** include it in every kind.

### S7. Kinds of starter

- **Background:** the sites people start differ mostly in their pages. The setup (Vite, Tailwind,
  tokens, theme, MDX, agent guidance) is the same.
- **Proposal:** one shared base plus a small overlay per kind, chosen with `--kind`:
  - **`site` (default):** a landing page (hero, features, call to action) and an MDX blog. This
    covers landing pages and simple portfolios.
  - **`docs`:** MDX documentation with a sidebar built from the content folder and the docs
    typography variant.
  - **Later kinds:** `portfolio` (site plus a work grid and case studies) and `app` (a product
    shell), added as further overlays when needed.
- **Routing:** TanStack Router with code-based routes, the router the docs site already uses. It
  is type-safe and needs no build plugin.
- **Recommendation:** build the base with `site` first, then `docs`.

### S8. shadcn compatibility

- **Background:** the starter is also the "Tailwind + shadcn" kit. `@atom63/styles/compat/shadcn`
  maps shadcn's variable names (`--background`, `--primary`, …) onto the `--a63-*` tokens.
- **Proposal:** the generated app imports the shadcn bridge and ships a `components.json` and the
  `cn` helper that shadcn's CLI expects. `npx shadcn add <component>` then works, and the added
  component takes the system's colors, radius and modes. The starter's own UI stays on
  `@atom63/ui-react`. shadcn is the escape hatch for anything the system lacks, and the README
  says to prefer system components.
- **Recommendation:** include it, and add a CI step that adds one shadcn component to the
  generated app and builds it.

## Implementation steps

1. **`@atom63/create` with the base and the `site` kind.** The generator, `pnpm create:app`,
   Tailwind wired to the tokens, the shadcn bridge, the MDX pipeline with a sample post, the
   landing page, the project-variant `AGENTS.md`, and unit tests.
   *Verify:* generate an app, install it against the local packages, then `dev`, `typecheck` and
   `build`. Check it in the browser in both modes and all four themes.
2. **`check:starter` in CI** (S5, S8). Landed with step 1, because it is how step 1 was verified.
   *Verify:* the check fails when the starter imports something the packages do not export.
3. **The `docs` kind.**

## Out of scope

- A SwiftUI starter. The iOS side ships as a Swift package, and a starter Xcode project can follow
  the same pattern later.
- Page templates, routing presets and data fetching. These come with the deferred template
  library.
- Publishing `@atom63/create`.
