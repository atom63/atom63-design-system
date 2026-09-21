# Attribute runtime map

Canonical personalization paint is stamped by `applyPersonalization` /
`PersonalizationController` as **`data-a63-*`** (and `--a63-surface-tint`).
Other attributes exist as **bridges** for OS63-local CSS or Storybook preview
chrome. Do not invent a third theme id.

| Attribute | Status | Who sets it | Who reads it | Notes |
| --- | --- | --- | --- | --- |
| `data-a63-theme` | **Canonical** | `applyPersonalization`, scoped `UIProvider`, Storybook shell | `packages/styles/src/themes/*.css` | Values: `modern` · `aqua` · `retro` · `terminal`; stamp `modern` explicitly |
| `data-a63-os` | **Canonical** | `applyPersonalization` | `packages/styles/src/os/{macos,windows}.css` | Peer of theme; chrome structure (+ allowed chrome paint) |
| `data-a63-mode` | **Canonical** | `applyPersonalization` / `UIProvider` | Semantics + theme mode-split blocks | Also mirrored by `.light` / `.dark` classes |
| `data-a63-brand` / `surface` / `radius` / `font` / `type-scale` / `icon-theme` | **Canonical** | `applyPersonalization` | Matching token files under `packages/styles` | See [personalization-axes.md](./personalization-axes.md) |
| `data-os63-ui-theme` | **Bridge (live)** | `apps/os63` `root-attributes`, Storybook, `packages/os63` desktop scope | `apps/os63/src/styles/index.css` Tailwind variants + Sonner toast skins | Same theme ids as `data-a63-theme`; OS63-local only |
| `data-os63-system` | **Bridge (live)** | Same as above | OS63 Tailwind variants + constraint store observer | Parallel to `data-a63-os` until OS63 CSS migrates |
| `data-product-theme` | **Storybook only** | Storybook toolbar effect | `apps/storybook/.storybook/theme-previews.css` | Toolbar may use `default` (= modern); not a runtime app attr |
| `data-ui-theme` | **Dead** | — | Archived `archive/styles-skins/*` only | Do not stamp. Material theming is `[data-a63-theme]` |

## Rules

1. **Apps** call `applyPersonalization` (or mount Appearance / `UIProvider`). Never set `data-ui-theme`.
2. **Harness / visual audits** stamp and read `data-a63-theme` (+ `data-a63-mode` / `.light|.dark`) on matrix cells.
3. **OS63** may keep `data-os63-*` for app-local variants until a dedicated migration moves those selectors onto `data-a63-*`.
4. **Slides** use a separate `--theme-slide-*` contract — not this attribute map. See `@atom63/slides` README.

`createThemeProvider` is a color-mode provider despite its name: it writes the
root `.light` / `.dark` class and persists `light` / `dark` / `system`, but it
does not stamp `data-a63-theme` or choose a material skin. Current apps pair that
mode context with `applyPersonalization`. `UIProvider` is the scoped alternative;
it stamps only the axes explicitly supplied and lets the rest inherit.

## Related

- [personalization-axes.md](./personalization-axes.md)
- [../architecture/os63-theme-architecture.md](../architecture/os63-theme-architecture.md)
- `packages/ui-foundation/src/axes.ts` (SSOT for axis ids/values)
