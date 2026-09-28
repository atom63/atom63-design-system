# Figma plugin update plan

Status: F8 (two modes) agreed and built on 2026-09-28, together with the sync engine's support
for composed colors, code syntax and scopes that Project mode needs (Figma plugin typings 1.139).
F1–F7 for Atom63 mode wait for review.

## Goal

Bring the Figma plugin (Cipher, `apps/figma-plugin`) up to date and publish it again, so the
variables it creates in Figma match `@atom63/styles` one to one, including the tokens that are a
color at an opacity. The same plugin also serves projects started from the Atom63 site template
(`atom63/atom63-site-template`), which own their tokens as CSS (F8, `starter-kit-plan.md`).

## What exists

- **The published plugin is version 13 (April 14, 2026).** It predates the move into this
  repository, so it has none of the token sync: variables from `atom63.figma-sync.json` (#1 on
  2026-09-23), the export back to DTCG (#9, #28) and the Theme collection (#32).
- **The sync model** (`packages/styles/generated/atom63.figma-sync.json`): 14 collections, 1,009
  variables, 59 computed values and 183 skipped tokens. The plugin bundles the model at build time
  from the workspace, and its UI does not show which `@atom63/styles` version it carries.
- **Alpha mixes lose their alias.** Tokens written as
  `color-mix(in oklch, var(--x) N%, transparent)` (about 38 declarations, for example
  `--a63-focus-ring`, `--a63-border-subtle`, `--a63-action-primary-hover`,
  `--a63-widget-background-color`) are measured in the browser and written as literal colors. The
  generator then moves each literal to the collection of the one axis it varies on, with one value
  per mode, and a literal that varies on more axes is frozen or skipped.
- **Variables carry no `codeSyntax` and no `scopes`.** Dev Mode shows no CSS name, and every
  variable appears in every picker.
- **Motion tokens** sync as FLOAT (durations) and STRING (easings).

## What Figma added (official sources, checked 2026-09-28)

- **Composed colors** ("Control opacity at scale", release notes, 2026-09-03): a COLOR variable
  aliases another color variable and keeps its own opacity, a number or a FLOAT variable. Plugin
  API Update 139 (2026-09-17), `@figma/plugin-typings@1.139.0`:
  `type VariableComposedColor = { color: RGB | RGBA; opacity: VariableAlias } | { color: VariableAlias; opacity: number | VariableAlias }`,
  written with `setValueForMode(modeId, { color: alias, opacity: 60 })`. Opacity runs 0–100. At
  least one side must be an alias. New scope `COLOR_OPACITY` for FLOAT variables. The REST
  Variables API supports it too (Enterprise only).
- **Extended collections** (Update 121, 2025-11-20): a collection that inherits a parent's
  variables and overrides values, for brands and themes. Enterprise plan only; `extend()` throws
  on other plans.
- **EASING and TIMING variable types** (Update 133, 2026-08-05). The API documents TIMING in
  seconds; the Help Center says milliseconds.
- **Scopes** `FONT_WEIGHT` and `COLOR_OPACITY`; `codeSyntax` platforms remain WEB, ANDROID, iOS.
- **Mode limits per collection:** Starter none, Professional 10, Organization 20. The Theme
  collection has 8 modes, so the sync needs a Professional plan or higher.

Sources: https://developers.figma.com/docs/plugins/updates/2026/09/17/version-1-update-139/,
https://developers.figma.com/docs/plugins/working-with-variables/,
https://developers.figma.com/docs/plugins/api/ExtendedVariableCollection/,
https://help.figma.com/hc/en-us/articles/14506821864087-Overview-of-variables-collections-and-modes

Not confirmed by an official source: how Dev Mode and `codeSyntax` show a composed color.

## Decisions

### F1. Alpha mixes become composed colors

- **Background:** the literal fallback loses the alias and forces the per-axis relocation.
- **Options:**
  - **A. Composed colors.** The generator recognizes `color-mix(in <space>, var(--x) N%, transparent)`
    (either operand order) and writes `{ "composed": { "alias": "--x", "opacity": N } }`; the plugin
    writes `{ color: alias, opacity: N }`, reads it back for the snapshot and the DTCG export.
    Mixes of two literals (`black 6%, transparent`) stay literals, because Figma needs one side to
    be an alias.
  - **B. Keep literals.**
- **Trade-offs:** A keeps the mapping, follows every axis without relocation, and removes most of
  the computed and skipped alpha tokens. It needs typings 1.139 and a Figma client with Update
  139. The mix is exact: mixing a color with `transparent` at N% gives that color at alpha N in
  any interpolation space.
- **Recommendation: A.** A composed variable sits in the collection where its token is declared,
  and the relocation pass skips it.

### F2. `codeSyntax` on every variable

- **Options:**
  - **A. WEB = `var(--a63-…)`**, the token's CSS name, for every variable.
  - **B. WEB = the Tailwind or shadcn name** where one exists (`bg-primary`).
- **Trade-offs:** A is one rule, exact, and names the token the design system documents. B reads
  better for Tailwind users, but one variable backs several utilities (`bg-`, `text-`, `border-`),
  and most variables have no shadcn name.
- **Recommendation: A** in Atom63 mode. Project mode uses the project's own CSS names (F8). iOS syntax (`AtomTokens…`) can follow
  later from the Swift names the CLI already knows.

### F3. Scopes

- **Options:**
  - **A. Scopes by token group:** foundation primitives get no scopes (hidden from pickers,
    still aliasable); surfaces `FRAME_FILL`, `SHAPE_FILL`; text `TEXT_FILL`; borders
    `STROKE_COLOR`; radius `CORNER_RADIUS`; space `GAP`, `WIDTH_HEIGHT`; type size, line height,
    weight and font `FONT_SIZE`, `LINE_HEIGHT`, `FONT_WEIGHT`, `FONT_FAMILY`; the rest
    `ALL_SCOPES`. The generator writes the scopes into the model from a table, so they are
    reviewed in one place.
  - **B. Leave `ALL_SCOPES`.**
- **Trade-offs:** A makes the pickers show the semantic tokens a designer should use, which is
  the Figma side of the "take values from semantic tokens" rule. A wrong scope hides a variable
  from a picker, so the table needs a test that every synced variable matches one group.
- **Recommendation: A.**

### F4. Show the model version in the plugin

- **Proposal:** the generator writes the `@atom63/styles` version into the model, and the Sync page
  shows it next to the plan in Atom63 mode, so a sync can be traced to a release. Project mode
  does not need it: the tokens come from the project.
- **Recommendation: adopt.**

### F5. Motion as EASING and TIMING variables

- **Options:**
  - **A. Now:** durations become TIMING, easings become EASING.
  - **B. Later**, in its own step.
- **Trade-offs:** A uses the right types, but the API and Help Center disagree on the TIMING unit,
  and EASING takes a `MotionEasing` value the plugin would have to build from `cubic-bezier()`.
- **Recommendation: B.** Keep FLOAT and STRING until the unit is verified in a real file.

### F6. Extended collections

- **Options:**
  - **A. Keep one collection per axis** (Brand, Surface, Mode, Theme, …).
  - **B. Brands and themes as extended collections.**
- **Trade-offs:** B is closer to how Figma now models brands, but it works only on Enterprise and
  an extension cannot add variables. The template's users are mostly on Professional plans.
- **Recommendation: A.** Revisit if an Enterprise user asks.

### F7. Release

- **Proposal:** version 14 in `CHANGELOG.md` with the sync, composed colors, code syntax and
  scopes; fix `PUBLISH.md` (it still describes the old repository layout and an unset plugin ID);
  bump `@figma/plugin-typings` to 1.139. Publishing to the Community is done by the user in
  Figma, with the build from this repository.
- **Recommendation: adopt.**

### F8. Two modes

- **Background:** the plugin serves two kinds of project. Atom63 is the full design system with
  contracts, and its tokens come from `@atom63/styles`. A project started from the site template
  owns its tokens as plain CSS and does not depend on Atom63 (`starter-kit-plan.md`). In both,
  code is the source of truth and Figma is a projection.
- **Proposal:** a mode switch on the Sync page.
  - **Atom63 mode:** syncs the model bundled from `@atom63/styles` at build time (14 collections),
    with F1–F4. Edits made in Figma still export back to the DTCG sources, as today.
  - **Project mode:** the user picks or pastes the project's token CSS. The plugin UI loads it into
    its iframe, walks the axis attributes and reads the computed values and `var()` references, and
    builds a model in the same shape as Atom63's: collections per file role (Palette, Semantic with
    Light and Dark, Brand, Surface, Radius, Type Scale), variables named as in the CSS
    (`primary`, `muted-foreground`), aliases kept, alpha mixes as composed colors (F1),
    `codeSyntax` WEB = `var(--primary)` and scopes by group (F3). Figma edits come back as a change
    list for an agent to apply to the CSS (`starter-kit-plan.md` K5).
  - Both modes share the plan and apply code, so each keeps the zero-change second sync and the
    retire-not-delete handling of removed variables.
- **Trade-offs:** one plugin to publish and one sync engine; the CSS parser supports the subset the
  kit writes (`:root`, `.dark`, `[data-*]` scopes, `var()`, `color-mix()`) and reports what it
  skips. Two plugins would keep each UI simpler but duplicate the engine.
- **Recommendation: adopt.** The site template's README gets a Figma section for Project mode once
  the plugin is published.

## Steps

1. **Generator:** composed colors (F1), scopes (F3) and the version stamp (F4) in
   `generate-figma-sync.mjs`, with tests; regenerate the model.
2. **Plugin, Atom63 mode:** typings 1.139; write and read composed colors, `codeSyntax` and scopes;
   the plan and apply include them, and a second sync plans zero changes (existing fake-API
   tests); the DTCG export reads composed colors back; the Sync page shows the version.
3. **Plugin, Project mode (F8):** the mode switch, the in-iframe CSS reader that builds the model,
   and the change-list export, with tests on the site template's token files.
4. **Release:** CHANGELOG version 14, `PUBLISH.md`, build. The user publishes and checks the
   variables in a real file.

## Verification

- Unit tests on the fake variables API: composed values round-trip, scopes and `codeSyntax` are
  written, and a second sync is a no-op.
- `pnpm check:*` and the Figma parity browser test for the regenerated model.
- In Figma (the user, or an agent once the Figma connection is authorized): run Sync on an empty
  file, switch Brand and Mode, and check that `focus-ring` and `border-subtle` follow the brand and
  still show their alias.
