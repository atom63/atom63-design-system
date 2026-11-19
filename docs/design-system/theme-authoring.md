# Theme Authoring

> **Current.** Themes are value overrides under `[data-a63-theme]` in
> `@atom63/styles` (`packages/styles/src/themes/`). Each theme is a DTCG resolver
> (`<id>.resolver.json`, one context per mode); `<id>.css` is generated from it, and
> values DTCG cannot type sit in `<id>.native.css`. Components consume
> `--a63-*` contracts from `packages/styles/src/contracts/` via recipes in
> `@atom63/ui-react`. Older `--theme-*` / `[data-ui-theme]` docs and skins are
> archived — see `archive/styles-skins/` and the migration banner on
> [component-theme-contract.md](./component-theme-contract.md).

## Themes (product skins)

| Id | File | Character |
| --- | --- | --- |
| `modern` | `themes/modern.resolver.json` | Default / identity — light tactile highlight on filled controls |
| `aqua` | `themes/aqua.resolver.json` | Glossy gel, tint, overlay texture (pinstripe) |
| `retro` | `themes/retro.resolver.json` | Win98 / early-web bevel, hard offset shadows |
| `terminal` | `themes/terminal.resolver.json` | CRT phosphor glow + scanline texture; mode-split palette |

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
- **neutral mixes in oklab** — a `color-mix()` that takes a surface, text or border color (the n2–n6 neutrals are slightly tinted) mixes `in oklab`, not `in oklch`. Browsers disagree on the hue of a near-gray color, so an oklch mix renders differently in Chrome than in Safari and Firefox. `color-mix-space.browser.test.ts` fails on a tinted neutral in an oklch mix.
- **Storybook coverage** — ThemeMatrix / contact sheets stamp `data-a63-theme` × mode for manual craft review (not a CI gate).

Run `pnpm --filter @atom63/styles generate:tokens` and then `pnpm check:theme-authoring`
after changing a theme. A new theme also needs its generated CSS path added to
`scripts/design-system/check-theme-authoring.mjs`.

## Checklist for a new theme or contract hook

1. Prefer remapping an existing contract; add a new contract hook only if the
   [growth rule](./authoring-surfaces.md#css-contract-growth-rule) passes
   (second component + theme/axis need). Skin-private material stays in the theme;
   shared stops go to foundation.
2. Override values in `packages/styles/src/themes/<id>.resolver.json` and regenerate.
3. Ensure recipes already read the contract (or update the recipe).
4. Cover Storybook Themes matrix + harness scenario if app chrome is involved.
5. Update [personalization-axes.md](./personalization-axes.md) ownership notes if the axis checklist changes.

## Adding a brand

A brand is one tonal ramp (`--a63-brand-50` … `--a63-brand-950`) selected by
`[data-a63-brand="<id>"]`. Ids are `b` plus a number; the next one is `b7`. The source of
the brand list is `packages/styles/src/tokens/brand-ramp.resolver.json`. Every other list
below is written by hand, and `pnpm check:theme-authoring` fails while any of them
disagrees with the resolver.

1. **Palette.** Add `color.b7.50` … `color.b7.950` (11 steps) to
   `packages/styles/src/tokens/foundation/primitives.tokens.json`.
2. **Ramp.** Add a `b7` context to `packages/styles/src/tokens/brand-ramp.resolver.json`
   that maps `a63.brand.<step>` to `{color.b7.<step>}`, like `b1`.
3. **Contrast exceptions.** The base set in `brand-action.resolver.json` fills the primary
   action with step 600 and draws brand text in 600. If white on the new 600 is below 4.5:1,
   or 600 as text on the selected wash is, add a `b7` context there that moves the fill
   and the text to 700, as `b3` does (or only the text, as `b2`, `b4` and `b6` do).
4. **Hand-written lists.** Add `b7` to each:
   - `packages/ui-foundation/src/axes.ts` (the brand axis `values`)
   - `packages/styles/scripts/generate-figma-sync.mjs` (the Brand collection `modes`; its
     `pattern` reads one digit, so a `b10` needs the pattern widened)
   - `packages/ui-ios/Scripts/lib/theme-graph.mjs` (`brands`)
   - `packages/styles/src/tokens/contrast.browser.test.ts` (`brands`)
   - `packages/styles/src/tokens/figma-parity.browser.test.ts` (the color contexts loop)
   - `apps/storybook/stories/tokens/color-primitives.stories.tsx` (`BRAND_SCALES`)
   - `apps/docs/src/foundation/token-meta.ts` (`BRAND_SCALES`, with its label) and
     `apps/docs/src/components/foundation/brand-scale-row.tsx` (`BRAND_500`)
5. **Regenerate.** `pnpm --filter @atom63/styles generate:tokens` (brand CSS, manifest,
   Figma model), then `pnpm --filter @atom63/ui-ios generate:swift` (the Swift token graph).
6. **Check.** `pnpm check:theme-authoring`, `pnpm --filter @atom63/styles test` (the contrast,
   Figma and Swift parity tests run every brand), and
   `pnpm --filter @atom63/ui-ios check:swift-tokens`. Update the prose that names the
   range (`b1`–`b6`) in [personalization-axes.md](./personalization-axes.md) and the docs
   pages on foundation colors and personalization.
7. **Changeset.** A patch or minor changeset for `@atom63/styles` and
   `@atom63/ui-foundation`.

## Related

- [authoring-surfaces.md](./authoring-surfaces.md) — value ownership + design lanes
- [foundation-value-drift.md](./foundation-value-drift.md) — deferred shared-scale cleanup
- [attribute-runtime.md](./attribute-runtime.md) — who stamps which attributes
- [personalization-axes.md](./personalization-axes.md)
- `packages/styles/README.md`
