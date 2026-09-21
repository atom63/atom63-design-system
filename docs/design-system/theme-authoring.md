# Theme Authoring

> **Current.** Themes are value overrides under `[data-a63-theme]` in
> `@atom63/styles` (`packages/styles/src/themes/`). Components consume
> `--a63-*` contracts from `packages/styles/src/contracts/` via recipes in
> `@atom63/ui-react`. Older `--theme-*` / `[data-ui-theme]` docs and skins are
> archived — see `archive/styles-skins/` and the migration banner on
> [component-theme-contract.md](./component-theme-contract.md).

## Themes (product skins)

| Id | File | Character |
| --- | --- | --- |
| `modern` | `themes/modern.css` | Default / identity — light tactile highlight on filled controls |
| `aqua` | `themes/aqua.css` | Glossy gel, tint, overlay texture (pinstripe) |
| `retro` | `themes/retro.css` | Win98 / early-web bevel, hard offset shadows |
| `terminal` | `themes/terminal.css` | CRT phosphor glow + scanline texture; mode-split palette |

**Not a product theme:** Windows 11 acrylic/taskbar chrome is an **OS** concern (`data-a63-os` / `data-os63-system`), not `[data-a63-theme="windows11"]`.

## Systems are not themes

- `macos` / `windows` — windowing + launcher geometry under `[data-a63-os]`
- Theme owns **skin character** (gloss, bevel, glow, texture) under `[data-a63-theme]`; foundation owns **shared** dictionaries. OS owns chrome structure (and may compose semantic paint for caption/launcher fills).

## Contract shape

1. Foundation + semantics define base `--a63-*` roles and shared scales.
2. Contracts (`control`, `field`, `overlay`, `surface`, `badge`, …) expose archetype hooks.
3. Theme files assign values under `[data-a63-theme='…']` — including theme-private material.
4. Recipes in `ui-react` consume contracts — no per-theme component branches.

Radius, type scale, and font are **separate personalization axes**, not theme CSS hardcodes (retro/terminal stay user-configurable via radius).

## Value ownership

**Shared scales** (palette, space, radius, type, blur ladder, generic shadow ladder)
live in foundation. **Theme-private material** (gel stacks, bevels, CRT glows,
gloss, scanlines, weather paints) may live in the theme file as scoped context.

Still assign **contracts** (`--a63-control-shadow`, …). Do not invent new
component-facing token trees. Promote a skin stop into foundation only when a
second theme, a contract default, or an adapter needs it.

Day-to-day lanes + promote rules:
[authoring-surfaces.md](./authoring-surfaces.md).
Shared-scale / contract drift (deferred):
[foundation-value-drift.md](./foundation-value-drift.md).

## Authoring guardrails

- **theme-selector-scope** — scope under `[data-a63-theme="<id>"]`.
- **no-fixed-nested-overlays** — no global `position: fixed` pseudos unless scoped to `html`/`body`.
- **light-dark-independent** — mode-dependent paint (aqua/terminal) must declare light and dark; material-only themes may inherit mode from semantics.
- **slot-geometry-through-variables** — shared slot radii/geometry via contract vars, not hardcoded one-offs.
- **no-new-shared-scales** — new palette/space/radius/type/blur **ladders** go in foundation; skin-private stacks in the theme are OK ([authoring-surfaces.md](./authoring-surfaces.md)).
- **brand-tinted material** — prefer declaring `var(--a63-action-primary)` mixes on the theme scope so phosphor tracks brand.
- **Storybook coverage** — ThemeMatrix / contact sheets stamp `data-a63-theme` × mode for manual craft review (not a CI gate).

Run `pnpm check:theme-authoring` after changing a theme or adding its file path to
`internal/harness` `harnessThemeCssFiles`.

## Checklist for a new theme or contract hook

1. Prefer remapping an existing contract; add a new contract hook only if the
   [growth rule](./authoring-surfaces.md#css-contract-growth-rule) passes
   (second component + theme/axis need). Skin-private material stays in the theme;
   shared stops go to foundation.
2. Override values in `packages/styles/src/themes/<id>.css`.
3. Ensure recipes already read the contract (or update the recipe).
4. Cover Storybook Themes matrix + harness scenario if app chrome is involved.
5. Update [personalization-axes.md](./personalization-axes.md) ownership notes if the axis checklist changes.

## Related

- [authoring-surfaces.md](./authoring-surfaces.md) — value ownership + design lanes
- [foundation-value-drift.md](./foundation-value-drift.md) — deferred shared-scale cleanup
- [attribute-runtime.md](./attribute-runtime.md) — who stamps which attributes
- [personalization-axes.md](./personalization-axes.md)
- `packages/styles/README.md`
