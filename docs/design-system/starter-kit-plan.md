# Starter kit plan: a minimal design system that code owns

Status: decided, 2026-09-28. Code is the source of truth; K1–K6 take their recommended options.
Steps 1 and 2 are done in `atom63/atom63-site-template` (tokens owned by the project, a landing
page, and Base UI idioms in place of Radix ones); step 3 is the plugin's Project mode.

## Goal

A minimal design system starter for people who know Tailwind and shadcn. The project owns its
tokens and does not depend on Atom63 at runtime or build time. Atom63 gives the kit and the tools
to start with:

- a site template (`atom63/atom63-site-template`): Vite, React, Tailwind, shadcn on Base UI and
  MDX, for landing pages, websites and portfolios;
- an initial token set with Atom63's structure (palettes, light and dark semantics,
  personalization axes) but none of its contract layer;
- the Figma plugin, which draws the project's tokens as Figma variables.

Atom63 itself stays the full design system with contracts, maintained separately (see
`figma-plugin-update-plan.md` for its Figma side).

## Principle: code is the source of truth

Agents edit code, so the tokens live in code and everything else is derived from them:

- The token source is plain CSS in the project. Tailwind v4 is configured in CSS (`@theme`), and
  shadcn's tokens are CSS variables, so CSS is what people and agents already read and edit. No
  JSON source and no generator: an extra layer invites edits to the generated file.
- Figma is a projection. The plugin reads the project's CSS and writes variables. Changes made in
  Figma go back as a change list that an agent applies to the CSS, never as an automatic write-back.

## What changes in the site template today

The template currently depends on `@atom63/styles` from npm, stamps `data-a63-*` attributes and
documents `--a63-*` tokens. All three go: the tokens become the project's own files, the
attributes lose the prefix, and the docs speak only Tailwind and shadcn.

## Decisions

### K1. Token files in the project

- **Proposal:** `src/styles/tokens/` with hand-written CSS, each file short enough to read:
  - `palette.css`: brand ramps and neutral ramps as literals (`--color-b1-500`,
    `--color-n1-light-3`), from Atom63's palette;
  - `semantic.css`: the shadcn vocabulary (`--background`, `--foreground`, `--primary`,
    `--muted-foreground`, `--border`, `--ring`, …) plus `--success`, `--warning`, `--info`, as
    aliases onto the palette, with light values at `:root` and dark values under `.dark`;
  - `axes.css`: the personalization axes as attribute scopes (K3);
  - `scale.css`: radius, type sizes, shadows and motion;
  - `theme.css`: the Tailwind `@theme inline` block that maps utilities onto the tokens.
- **Trade-offs:** fewer, larger files would be quicker to scan; the split keeps each concern in
  one place and matches the Figma collections (K4).
- **Recommendation: adopt.** The values are a snapshot of Atom63 `modern` at the version the kit
  is cut from; the project may change any of them.

### K2. Semantic vocabulary

- **Options:**
  - **A. shadcn names** (`--primary`, `--muted-foreground`), extended with `--success`,
    `--warning`, `--info`, and the sidebar and chart tokens shadcn defines.
  - **B. Atom63 names** (`--a63-surface-page`) with the shadcn names as a bridge.
- **Trade-offs:** A is what shadcn users and agents already know and what `npx shadcn add`
  expects, with no bridge. B keeps parity with Atom63 but exposes Atom63 in the project.
- **Recommendation: A.**

### K3. Personalization axes

- **Options:**
  - **A. Keep the axes without the prefix:** `data-brand` (`b1`–`b6`), `data-surface`
    (`n1`–`n6`), `data-radius`, `data-type-scale`, and the `dark` class for mode.
  - **B. Drop the axes:** one fixed palette; the project edits values to restyle.
- **Trade-offs:** A keeps what Atom63 adds over a plain shadcn setup: switching brand, surface,
  radius and type size without touching a component. B is smaller.
- **Recommendation: A**, with the site config panel kept as the way to try the axes.

### K4. Figma sync: the plugin reads the project's CSS

- **Background:** Atom63's generator resolves tokens in a real browser: it sets each axis on
  `<html>` and reads the computed values, and reads `var()` references to keep aliases. The
  plugin's UI is a browser iframe, so the same method can run inside the plugin.
- **Proposal:** a Project mode in the plugin:
  - the user picks or pastes the token CSS files (the plugin has no network access);
  - the plugin UI loads them into its iframe, walks the axis values, and builds the sync model:
    one collection per file role (Palette, Semantic with Light and Dark modes, Brand, Surface,
    Radius, Type Scale), variables named as in the CSS (`primary`, `muted-foreground`), aliases
    kept from `var()`, alpha mixes as composed colors, `codeSyntax` WEB = `var(--primary)`, and
    scopes by group;
  - the existing plan and apply code writes the model, so a second sync plans zero changes.
- **Trade-offs:** no script or dependency in the project, and one mechanism for both modes of the
  plugin. The parser must support the subset of CSS the kit writes (declarations under `:root`,
  `.dark` and `[data-*]` selectors, `var()`, `color-mix()`); the kit's files stay inside that
  subset, and the plugin reports anything it skips.
- **Recommendation: adopt.** Atom63 mode keeps its bundled model.

### K5. Figma to code

- **Options:**
  - **A. A change list:** the plugin compares the file's variables with the last synced model and
    exports the differences as text an agent applies ("in `.dark`, set `--primary` to
    `var(--color-b3-500)`").
  - **B. Write back files:** the plugin exports edited CSS.
  - **C. Nothing:** Figma is read-only.
- **Trade-offs:** A keeps code the only source and lets an agent place the change correctly
  (alias or literal, which file). B makes Figma a second source. C loses designer edits.
- **Recommendation: A.**

### K6. How the kit reaches users

- **Options:**
  - **A. GitHub template repository** (`atom63/atom63-site-template`, "Use this template").
  - **B. A `create` command** that copies the template.
- **Trade-offs:** A needs nothing published and is how the repository already works. B is one
  command, but it is a package to publish and maintain.
- **Recommendation: A now**, B only if people ask for it.

## Steps

1. **Template: own the tokens.** Write `src/styles/tokens/*` (K1–K3) from Atom63 `modern`, remove
   `@atom63/styles`, rename the attributes, and rewrite README and `AGENTS.md` in Tailwind and
   shadcn terms. Verify: `typecheck`, `build`, the old and new builds render the same colors in
   light and dark for every brand and surface (computed-style comparison in the browser).
2. **Template: landing page and cleanup.** A real landing page from shadcn components; remove the
   unused React Query provider.
3. **Plugin: Project mode** (K4, K5) in `apps/figma-plugin`, sharing the plan and apply code with
   Atom63 mode, with tests that parse the kit's CSS and plan zero changes on a second sync.
4. **Plugin release** (with `figma-plugin-update-plan.md` F1–F4, F7).
5. **Template: Figma section** in the README, linking the published plugin.
