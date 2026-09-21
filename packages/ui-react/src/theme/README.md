# `@atom63/ui-react/theme`

Personalization state, apply logic, React providers, and Appearance UI for Atom63 apps. This submodule replaces the appearance concerns that lived in archived `@atom63/theme` (now `archive/theme/`); `@atom63/styles` owns CSS contracts; apps own persistence and wallpaper catalogs.

**Import only from the public entry** — apps and packages must use `@atom63/ui-react/theme`. Do not deep-import from `packages/ui-react/src/theme/*` (paths are internal and may change).

## Folder map

| Folder | Change here when… |
|--------|-------------------|
| **`core/`** | Adding or renaming personalization axes, option lists, types, `applyPersonalization`, auto brand ramp extraction (`auto-primary.ts`), or auto-contrast JS helpers (`auto-contrast.ts`). |
| **`providers/`** | Wiring React context: `createThemeProvider` (light/dark/system) or `createPersonalizationController` (full axis state + apply + optional `auto` brand from wallpaper). |
| **`appearance/`** | Appearance UI: `AppearanceMenu`, `AppearancePanel`, sections, previews, keyboard shortcut, reset. |
| **`controls/`** | Reusable token pickers used by Appearance (`SegmentedTokenControl`, `SwatchTokenControl`, `RangeTokenControl`, `VisualChoiceControl`). |

Public exports are re-exported from [`index.ts`](./index.ts).

## Apply contract

Personalization reaches the design system through **attributes and one tint token only**:

- `applyPersonalization(state, root)` sets `data-a63-*` attributes and `--a63-surface-tint` on the root element.
- CSS in `@atom63/styles` maps those attributes to semantic tokens (`--a63-brand-*`, `--a63-surface-*`, etc.).

**Never** write inline `--primary`, `--surface-*`, or other semantic color vars from JS — that shadows the `data-a63-*` contract and breaks theme/brand switching.

Attributes set by apply:

- `.dark` / `.light` + `data-a63-mode`
- `data-a63-theme`, `data-a63-brand`, `data-a63-surface`
- `--a63-surface-tint` (inline; the one allowed exception)
- `data-a63-type-scale`, `data-a63-radius`, `data-a63-font`, `data-a63-os`, `data-a63-icon-theme`

## Auto brand

When `brand === 'auto'`:

1. The personalization controller resolves wallpaper → dominant hue/sat (async).
2. `applyAutoColorRamp` writes `--color-auto-50` … `--color-auto-950` (plus legacy `--color-auto-foreground`) on the root.
3. CSS `[data-a63-brand="auto"]` maps `--a63-brand-*` to those `--color-auto-*` vars.

Apply itself does not compute the ramp; the controller’s async effect owns `--color-auto-*`.

## Auto contrast

Primary-on-fill text and icons use **`--a63-action-primary-foreground`** (defined in CSS), not ad hoc `--color-auto-foreground` in components.

Keep JS and CSS thresholds aligned when tuning:

| Layer | Location | Threshold |
|-------|----------|-----------|
| JS (WCAG relative luminance **Y**) | `core/auto-contrast.ts` → `AUTO_CONTRAST_WCAG_Y_THRESHOLD` | **0.30** — light foreground only when Y is below this |
| CSS (oklch **l** step) | `packages/styles/src/tokens/brand.css` → `--a63-action-primary-foreground` clamp | **0.665** — `(0.665 - l) * 1000` step between near-black and near-white |

Mustard/gold brand picks (~L 0.69, Y ≈ 0.33) must render **dark text** on the primary fill. If mid-golds look washed out, check both values before changing either alone. Regression cases live in [`core/auto-contrast.test.ts`](./core/auto-contrast.test.ts) (mustard/gold + b1 blue).

## Related

- [Personalization architecture](../../../../docs/architecture/personalization.md)
- [USAGE.md](../../../../USAGE.md) — consumer import and Appearance mounting
- [Theme module reorg design](../../../../docs/superpowers/specs/2026-07-21-ui-react-theme-module-reorg-design.md)
