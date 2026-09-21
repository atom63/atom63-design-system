# Atom63 DS Package Metadata Audit

**Status:** Audit refreshed for approved beta preparation / no publish
**Scope:** First-wave public beta candidates from [publish-boundary-rfc.md](./publish-boundary-rfc.md), plus `@atom63/icons` as an explicit dependency-risk audit item.
**Generated:** local audit of current manifests and `npm pack --dry-run --json --ignore-scripts` output.

This report records first-wave metadata evidence. YZ subsequently approved explicit public package access for the three first-wave packages; it remains evidence for preparation, not approval to run versioning or publish commands.

## Summary

| Package | Current private | Version | README | `files` | Exports | Side effects | Peer deps | Repo directory | Dry-run pack | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `@atom63/styles` | no | `0.0.1` | yes | yes | yes | yes | none | yes | 74 files | metadata mostly ready; verify API promise |
| `@atom63/ui-foundation` | no | `0.1.0` | yes | yes | yes | yes | none | yes | 5 files | metadata mostly ready; verify API promise |
| `@atom63/ui-react` | no | `0.1.1` | yes | yes | yes | yes | `react`, `react-dom` | yes | 92 files | metadata mostly ready; verify API promise |
| `@atom63/icons` | no | `0.0.1` | no | yes | yes | yes | `react`, `react-dom` | no | 86 files | dependency-risk item; do not publish by default |

## `@atom63/styles`

- Path: `packages/styles`
- Version: `0.0.1`
- Private: `false`
- License: `MIT`
- Repository: `git+https://github.com/ATOM63/atom63-design-system.git`; directory: `packages/styles`
- `files`: `["generated", "src"]`
- `sideEffects`: `["*.css"]`
- Runtime dependencies: `tw-animate-css`
- Peer dependencies: none
- Export keys: `.`, `./compat`, `./compat/a63-from-shadcn`, `./animations`, `./compat/mdx`, `./compat/shadcn`, `./contracts`, `./contracts/action`, `./contracts/choice`, `./contracts/control`, `./contracts/environment`, `./contracts/field`, `./contracts/marker`, `./contracts/menu`, `./contracts/overlay`, `./contracts/segment`, `./contracts/selection`, `./contracts/surface`, `./contracts/toggle`, `./contracts/track`, `./contracts/trigger`, `./contracts/widget`, `./tailwind`, `./tailwind/animations`, `./tailwind/theme`, `./tailwind/utilities`, `./tailwind/variants`, `./themes`, `./themes/aqua`, `./themes/modern`, `./themes/retro`, `./themes/terminal`, `./os`, `./os/macos`, `./os/windows`, `./tokens`, `./tokens/brand`, `./tokens/foundation`, `./tokens/foundation/aliases`, `./tokens/foundation/effects`, `./tokens/foundation/fonts`, `./tokens/foundation/motion`, `./tokens/foundation/palette`, `./tokens/foundation/primitives`, `./tokens/foundation/radius`, `./tokens/foundation/typography`, `./tokens/motion`, `./tokens/radius`, `./tokens/semantics`, `./tokens/space`, `./tokens/surface`, `./utils`, `./utils/code-highlighting`, `./utils/debug`, `./utils/scroll-bar`, `./utils/scroll-mask`, `./utils/view-transition`, `./z-layers`

### Dry-run packed contents

- File count: 74
- Unpacked size: 1593946 bytes
- Sample / complete list when small:
  - `README.md`
  - `generated/atom63.figma-tokens.json`
  - `generated/atom63.tokens.json`
  - `package.json`
  - `src/animations/animations.css`
  - `src/animations/index.css`
  - `src/compat/a63-from-shadcn.css`
  - `src/compat/index.css`
  - `src/compat/mdx.css`
  - `src/compat/shadcn.css`
  - `src/contracts/action.css`
  - `src/contracts/badge.css`
  - `src/contracts/choice.css`
  - `src/contracts/control.css`
  - `src/contracts/environment.css`
  - `src/contracts/field.css`
  - `src/contracts/index.css`
  - `src/contracts/marker.css`
  - `src/contracts/menu.css`
  - `src/contracts/overlay.css`
  - `src/contracts/segment.css`
  - `src/contracts/selection.css`
  - `src/contracts/skeleton.css`
  - `src/contracts/surface.css`
  - `src/contracts/toggle.css`
  - `src/contracts/track.css`
  - `src/contracts/trigger.css`
  - `src/contracts/widget.css`
  - `src/index.css`
  - `src/manifest/types.ts`
  - `src/os/index.css`
  - `src/os/macos.css`
  - `src/os/windows.css`
  - `src/tailwind/animations.css`
  - `src/tailwind/index.css`
  - `src/tailwind/theme.css`
  - `src/tailwind/utilities.css`
  - `src/tailwind/variants.css`
  - `src/test/apply-styles.ts`
  - `src/themes/aqua.css`
  - `src/themes/index.css`
  - `src/themes/modern.css`
  - `src/themes/retro.css`
  - `src/themes/terminal.css`
  - `src/tokens/brand.css`
  - `src/tokens/contrast.browser.test.ts`
  - `src/tokens/font.css`
  - `src/tokens/foundation.css`
  - `src/tokens/foundation/aliases.css`
  - `src/tokens/foundation/effects.css`
  - `src/tokens/foundation/fonts.css`
  - `src/tokens/foundation/motion.css`
  - `src/tokens/foundation/palette.css`
  - `src/tokens/foundation/primitives.css`
  - `src/tokens/foundation/radius.css`
  - `src/tokens/foundation/typography.css`
  - `src/tokens/index.css`
  - `src/tokens/motion.css`
  - `src/tokens/personalization-axes.browser.test.ts`
  - `src/tokens/radius.css`
  - … 14 more

### Beta-readiness notes

- `publishConfig.access` is explicitly `public`, matching YZ's first-wave beta approval.
- Confirm CSS entry points and token naming are ready for beta support promise.

## `@atom63/ui-foundation`

- Path: `packages/ui-foundation`
- Version: `0.1.0`
- Private: `false`
- License: `MIT`
- Repository: `git+https://github.com/ATOM63/atom63-design-system.git`; directory: `packages/ui-foundation`
- `files`: `["dist"]`
- `sideEffects`: `false`
- Runtime dependencies: none
- Peer dependencies: none
- Export keys: `.`

### Dry-run packed contents

- File count: 5
- Unpacked size: 491348 bytes
- Sample / complete list when small:
  - `README.md`
  - `dist/index.d.ts`
  - `dist/index.js`
  - `dist/index.js.map`
  - `package.json`

### Beta-readiness notes

- `publishConfig.access` is explicitly `public`, matching YZ's first-wave beta approval.
- Keep public positioning as contract/renderer-author package, not the default UI runtime.

## `@atom63/ui-react`

- Path: `packages/ui-react`
- Version: `0.1.1`
- Private: `false`
- License: `MIT`
- Repository: `git+https://github.com/ATOM63/atom63-design-system.git`; directory: `packages/ui-react`
- `files`: `["dist", "src/**/*.css"]`
- `sideEffects`: `["*.css", "**/*.css"]`
- Runtime dependencies: `@atom63/styles`, `@atom63/ui-foundation`, `@base-ui/react`, `clsx`, `date-fns`, `embla-carousel-react`, `input-otp`, `lucide-react`, `motion`, `react-day-picker`, `react-hook-form`, `react-resizable-panels`, `sonner`, `tailwind-merge`
- Peer dependencies: `react`, `react-dom`
- Export keys: `.`, `./layout`, `./media`, `./media/lightbox`, `./recipes.css`, `./recipes/media-lightbox.css`, `./recipes/accordion.css`, `./recipes/alert-dialog.css`, `./recipes/alert.css`, `./recipes/autocomplete.css`, `./recipes/avatar.css`, `./recipes/badge.css`, `./recipes/breadcrumb.css`, `./recipes/button-group.css`, `./recipes/button.css`, `./recipes/calendar.css`, `./recipes/card.css`, `./recipes/carousel.css`, `./recipes/checkbox.css`, `./recipes/collapsible.css`, `./recipes/command.css`, `./recipes/connected-panel.css`, `./recipes/context-menu.css`, `./recipes/copy-button.css`, `./recipes/dialog.css`, `./recipes/drawer.css`, `./recipes/dropdown-menu.css`, `./recipes/empty.css`, `./recipes/feedback-state.css`, `./recipes/field.css`, `./recipes/form.css`, `./recipes/frame.css`, `./recipes/hover-card.css`, `./recipes/input-otp.css`, `./recipes/input.css`, `./recipes/item.css`, `./recipes/kbd.css`, `./recipes/label.css`, `./recipes/load-more-trigger.css`, `./recipes/marquee.css`, `./recipes/menubar.css`, `./recipes/navigation-menu.css`, `./recipes/pagination.css`, `./recipes/panel-setting-button.css`, `./recipes/popover.css`, `./recipes/preview-card.css`, `./recipes/progress.css`, `./recipes/radio.css`, `./recipes/resizable.css`, `./recipes/scroll-area.css`, `./recipes/scrollable-list.css`, `./recipes/segmented-control.css`, `./recipes/select.css`, `./recipes/separator.css`, `./recipes/sheet.css`, `./recipes/sidebar-nav-tree.css`, `./recipes/sidebar.css`, `./recipes/skeleton.css`, `./recipes/slider.css`, `./recipes/switch.css`, `./recipes/table.css`, `./recipes/tabs.css`, `./recipes/text-ticker.css`, `./recipes/textarea.css`, `./recipes/toggle-group.css`, `./recipes/toggle.css`, `./recipes/tooltip.css`, `./reset.css`, `./styles.css`, `./theme`

### Dry-run packed contents

- File count: 92
- Unpacked size: 2020038 bytes
- Sample / complete list when small:
  - `README.md`
  - `dist/button-sktq-nvV.d.ts`
  - `dist/chunk-6LPRODV5.js`
  - `dist/chunk-6LPRODV5.js.map`
  - `dist/chunk-AJLHJRK6.js`
  - `dist/chunk-AJLHJRK6.js.map`
  - `dist/chunk-STCXERLM.js`
  - `dist/chunk-STCXERLM.js.map`
  - `dist/chunk-WDUUTLQT.js`
  - `dist/chunk-WDUUTLQT.js.map`
  - `dist/destination-link-C9NKeKLe.d.ts`
  - `dist/index.d.ts`
  - `dist/index.js`
  - `dist/index.js.map`
  - `dist/layout/index.d.ts`
  - `dist/layout/index.js`
  - `dist/layout/index.js.map`
  - `dist/media/index.d.ts`
  - `dist/media/index.js`
  - `dist/media/index.js.map`
  - `dist/media/media-lightbox/parts/index.d.ts`
  - `dist/media/media-lightbox/parts/index.js`
  - `dist/media/media-lightbox/parts/index.js.map`
  - `dist/theme/index.d.ts`
  - `dist/theme/index.js`
  - `dist/theme/index.js.map`
  - `dist/types-Dxe5IzjE.d.ts`
  - `package.json`
  - `src/components/accordion/accordion.css`
  - `src/components/alert-dialog/alert-dialog.css`
  - `src/components/alert/alert.css`
  - `src/components/autocomplete/autocomplete.css`
  - `src/components/avatar/avatar.css`
  - `src/components/badge/badge.css`
  - `src/components/breadcrumb/breadcrumb.css`
  - `src/components/button-group/button-group.css`
  - `src/components/button/button.css`
  - `src/components/calendar/calendar.css`
  - `src/components/card/card.css`
  - `src/components/carousel/carousel.css`
  - `src/components/checkbox/checkbox.css`
  - `src/components/collapsible/collapsible.css`
  - `src/components/command/command.css`
  - `src/components/connected-panel/connected-panel.css`
  - `src/components/copy-button/copy-button.css`
  - `src/components/dialog/dialog.css`
  - `src/components/drawer/drawer.css`
  - `src/components/empty/empty.css`
  - `src/components/feedback-state/feedback-state.css`
  - `src/components/field/field.css`
  - `src/components/form/form.css`
  - `src/components/frame/frame.css`
  - `src/components/hover-card/hover-card.css`
  - `src/components/input-otp/input-otp.css`
  - `src/components/input/input.css`
  - `src/components/item/item.css`
  - `src/components/kbd/kbd.css`
  - `src/components/label/label.css`
  - `src/components/load-more-trigger/load-more-trigger.css`
  - `src/components/marquee/marquee.css`
  - … 32 more

### Beta-readiness notes

- `publishConfig.access` is explicitly `public`, matching YZ's first-wave beta approval.
- Confirm root exports are the intended supported beta surface; move unstable APIs to preview/experimental before publish if needed.

## `@atom63/icons`

`@atom63/icons` remains an explicit dependency-risk audit item, but `@atom63/ui-react` no longer imports it. Public UI controls now use `lucide-react` defaults, so the first-wave UI package does not force Atom63's internal icon library on adopters.

- Path: `packages/icons`
- Version: `0.0.1`
- Private: `false`
- License: `missing`
- Repository: missing
- `files`: `["dist", "src", "assets"]`
- `sideEffects`: `false`
- Runtime dependencies: `@iconify/react`, `clsx`, `lucide-react`
- Peer dependencies: `react`, `react-dom`
- Export keys: `.`, `./icons`, `./animated`, `./art`, `./graphics`, `./behance`, `./companies`

### Dry-run packed contents

- File count: 86
- Unpacked size: 334136 bytes
- Sample / complete list when small:
  - `assets/art/line-art-01.svg`
  - `assets/art/line-art-02.svg`
  - `assets/art/line-art-03.svg`
  - `assets/art/line-art-04.svg`
  - `assets/art/line-art-05.svg`
  - `assets/art/line-art-06.svg`
  - `assets/art/line-art-07.svg`
  - `assets/art/line-art-08.svg`
  - `assets/art/line-art-09.svg`
  - `assets/art/line-art-10.svg`
  - `assets/art/line-art-11.svg`
  - `assets/art/line-art-12.svg`
  - `assets/art/line-art-13.svg`
  - `assets/art/line-art-14.svg`
  - `assets/art/line-art-15.svg`
  - `assets/art/line-art-16.svg`
  - `assets/art/line-art-17.svg`
  - `assets/art/line-art-18.svg`
  - `assets/art/line-art-19.svg`
  - `assets/art/line-art-20.svg`
  - `assets/companies/manvsmachine.svg`
  - `assets/companies/microsoft.svg`
  - `assets/companies/oneplus.svg`
  - `assets/graphics/graphics-01.svg`
  - `assets/graphics/graphics-02.svg`
  - `assets/graphics/graphics-03.svg`
  - `assets/graphics/graphics-04.svg`
  - `assets/graphics/graphics-05.svg`
  - `assets/graphics/graphics-06.svg`
  - `assets/graphics/graphics-07.svg`
  - `assets/graphics/graphics-08.svg`
  - `assets/graphics/graphics-09.svg`
  - `assets/graphics/graphics-10.svg`
  - `assets/graphics/graphics-11.svg`
  - `assets/graphics/graphics-12.svg`
  - `assets/graphics/graphics-13.svg`
  - `assets/graphics/graphics-14.svg`
  - `assets/graphics/graphics-15.svg`
  - `assets/graphics/graphics-16.svg`
  - `assets/graphics/graphics-17.svg`
  - `assets/graphics/graphics-18.svg`
  - `assets/graphics/graphics-19.svg`
  - `assets/graphics/graphics-20.svg`
  - `assets/graphics/graphics-21.svg`
  - `assets/graphics/graphics-22.svg`
  - `assets/graphics/graphics-23.svg`
  - `assets/graphics/graphics-24.svg`
  - `dist/icons.d.ts`
  - `dist/icons.js`
  - `dist/icons.js.map`
  - `package.json`
  - `src/animated/animated-check.tsx`
  - `src/animated/animated.stories.tsx`
  - `src/animated/animated.test.tsx`
  - `src/animated/index.ts`
  - `src/animated/spinner.tsx`
  - `src/art/art.stories.tsx`
  - `src/art/art.test.tsx`
  - `src/art/catalog.ts`
  - `src/art/icon-line-art.tsx`
  - … 26 more

### Gaps to resolve before asking for publish approval

- Decide first whether Atom63 wants to ship a supported icon library. Default answer for the DS first wave is no.
- If Atom63 later intentionally ships this package, then add license, repository metadata, README quickstart, and a tighter support promise before asking for publish approval.

## Extraction rehearsal evidence

[extraction-rehearsal.md](./extraction-rehearsal.md) records a passing local external-repo rehearsal for the first-wave packages. The rehearsal packed `@atom63/styles`, `@atom63/ui-foundation`, and `@atom63/ui-react`; installed the tarballs into a throwaway Vite consumer with no `workspace:` aliases; and passed `tsc --noEmit && vite build`. It also confirmed that `@atom63/ui-react` does not directly depend on `@atom63/icons`.

## Next action

Public access metadata and the coordinated Changeset are now prepared under YZ's approval. Review [publish-approval-packet.md](./publish-approval-packet.md), refresh the listed preflight evidence, and verify npm scope/security/provenance plus the exact Changesets dry-run output. Do not execute versioning or publish until YZ approves that final gate.
