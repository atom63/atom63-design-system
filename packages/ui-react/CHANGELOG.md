# @atom63/ui-react

## 0.2.0-beta.10

### Minor Changes

- [#23](https://github.com/atom63/atom63-design-system/pull/23) [`457b90e`](https://github.com/atom63/atom63-design-system/commit/457b90e066b29fac5181cb709fc349f324e9262d) Thanks [@atom63](https://github.com/atom63)! - Export the types that already appear in public signatures, so consumers can name them: `CarouselContextProps`, `CarouselOptions`, `CarouselPlugin`, `DrawerAsChildProps`, `DrawerContentProps`, `DrawerRootProps`, `ResizableOrientation`, `ScrollAreaViewportProps`, `SidebarContextProps` and `SliderRootProps` from the main entry; `VideoManagerContextType`, `VideoManagerProviderProps`, `VideoModalInteractionMode`, `VideoModalProps`, `VideoSource` and `VideoThumbnailProps` from `./media`; `LightboxTiming`, `LightboxZoomOptions`, `MediaLightboxAppearance`, `MediaLightboxItem`, `MediaLightboxItemKind`, `MediaLightboxLabels`, `MediaLightboxTransition`, `MediaLightboxVideoSource` and `MediaLightboxVideoTrack` from `./media/lightbox`; and `AppearanceMenuTriggerProps` and `CreatePersonalizationControllerOptions` from `./theme`. Types only; runtime output does not change.

### Patch Changes

- [#15](https://github.com/atom63/atom63-design-system/pull/15) [`dfe96a4`](https://github.com/atom63/atom63-design-system/commit/dfe96a4d508abb209bc4a11782252d867fac6ad7) Thanks [@atom63](https://github.com/atom63)! - Accessibility fixes found by the new automated axe checks:
  
  - `AutocompleteInput`: the built-in trigger and clear buttons, which show only an icon, now have
    accessible names ("Show suggestions" and "Clear"). Pass `aria-label` in `triggerProps` or
    `clearProps` to override them.
  - `CommandInput` now sets `aria-expanded`, which `role="combobox"` requires; the inline command list
    is always open.
  - `CommandSeparator` is now presentational, since a listbox may only own options and groups.
  - `Marquee`: under `prefers-reduced-motion` the strip stops and becomes scrollable, but it could not
    be focused, so keyboard users could not scroll it. It is now a focusable, named group while motion
    is reduced (pass `aria-label` to name each marquee); nothing changes while it animates. The
    component is now marked `'use client'`, since it reads the motion preference.

- [#76](https://github.com/atom63/atom63-design-system/pull/76) [`bbd4c87`](https://github.com/atom63/atom63-design-system/commit/bbd4c877ff39d9a58746997cc4b5b2b3a9c928ba) Thanks [@atom63](https://github.com/atom63)! - `@atom63/ui-foundation` exports accessibility pattern contracts: the WAI-ARIA APG dialog (modal),
  alert dialog, menu button and tabs patterns as data (`dialogModalPattern`, `alertDialogPattern`,
  `menuButtonPattern`, `tabsPattern`, `a11yPatterns`, `getA11yPattern`) with their types. The Dialog,
  AlertDialog, DropdownMenu and Tabs contracts gain an `accessibility` field that names the pattern
  the component implements, its option values and any known gaps.
  
  `AlertDialogPopup` in `@atom63/ui-react` sets `aria-modal="true"`, as the APG alert dialog pattern
  requires.

- [#68](https://github.com/atom63/atom63-design-system/pull/68) [`db5fadc`](https://github.com/atom63/atom63-design-system/commit/db5fadc3d5326f22a063fb2ea2dbaf78acc9e25c) Thanks [@atom63](https://github.com/atom63)! - Document the Card structure. `CardHeader` is a single row for a `CardLabel` and a `CardAction`, while `CardTitle` and `CardDescription` go inside `CardContent`. This differs from shadcn, where the title sits in `CardHeader`.

- [#47](https://github.com/atom63/atom63-design-system/pull/47) [`11555a8`](https://github.com/atom63/atom63-design-system/commit/11555a8d79f53ed5bcdbf4dc6476eecdc85dddac) Thanks [@atom63](https://github.com/atom63)! - Fix five text-contrast issues that the Storybook axe checks started reporting once the surface mixes moved to oklab. The colors involved are unchanged on the default surfaces, so these issues predate that change; the checks did not report them before. `@atom63/styles` adds `--a63-text-danger` (danger 600 in light mode, 400 in dark mode) for danger text; `--a63-action-danger` stays the fill of danger buttons. In `@atom63/ui-react`, field and form errors and destructive menu items use `--a63-text-danger`, so they reach 4.5:1 on dark surfaces (they were about 2.7:1). A highlighted item in a primary-tone menu shows its shortcut in the highlight foreground. Sidebar and nav-tree group labels use `--a63-text-secondary` instead of a translucent foreground, which fell below 4.5:1 in the terminal theme. A selected row in a framed table fills its cells with the selection color; its white text previously sat on the page surface.

- [#55](https://github.com/atom63/atom63-design-system/pull/55) [`7fc3f86`](https://github.com/atom63/atom63-design-system/commit/7fc3f86e4e4fe820972b417fe23f14e51f5be9c9) Thanks [@atom63](https://github.com/atom63)! - `FrameHeader` and `FrameFooter` render a `div` instead of `<header>` and `<footer>`. Outside a sectioning element those tags are page-level banner and contentinfo landmarks, so a page with two frames announced two banners and failed axe. Their props are now `div` props. Class names and slots are unchanged.

- [#34](https://github.com/atom63/atom63-design-system/pull/34) [`ffc8394`](https://github.com/atom63/atom63-design-system/commit/ffc8394d5f1e4cb9f5eb7ab922c3c7b5b125f9c3) Thanks [@atom63](https://github.com/atom63)! - `@atom63/styles` no longer generates or ships `generated/atom63.figma-tokens.json`. It had no package export and no known consumer; the Figma plugin reads `@atom63/styles/figma-sync.json`, which is unchanged. `@atom63/ui-react` drops its unused direct `date-fns` dependency; `react-day-picker` still brings its own copy, so Calendar behavior does not change.

- [#56](https://github.com/atom63/atom63-design-system/pull/56) [`aa077f9`](https://github.com/atom63/atom63-design-system/commit/aa077f9b547d15ca61f21c65367b49f03ab414d1) Thanks [@atom63](https://github.com/atom63)! - Use logical directions so layouts mirror in right-to-left pages. Text alignment in AlertDialog, Drawer, Empty, Field, Item, PanelSettingButton, Sidebar and Table moves from `left` to `start`. The Card action margin, the Carousel gutter and the SidebarNavTree end corners and guide line become logical. So do the inset Sidebar margin and the Sidebar menu action with its reserved padding. SectionHeader, the grid guides and the range token control use `ms-`/`text-end`/`border-s`. Left-to-right rendering is unchanged.

- [#51](https://github.com/atom63/atom63-design-system/pull/51) [`f297a4f`](https://github.com/atom63/atom63-design-system/commit/f297a4ff8f933b52c5dac74f86f17950486fe563) Thanks [@atom63](https://github.com/atom63)! - Fix two `MediaLightbox` issues. The backdrop now sits on the same fixed `z-50` layer as the content. Before, it was `absolute` with no z-index, so a positioned page header with a z-index painted above it. `Lightbox.Portal` now keys its children, which removes the React duplicate-key warning that every open raised.

- [#22](https://github.com/atom63/atom63-design-system/pull/22) [`541e675`](https://github.com/atom63/atom63-design-system/commit/541e67582f86b9d9987b2ac41923dc9e5706ec95) Thanks [@atom63](https://github.com/atom63)! - Generate custom (`auto`) brand ramps in OKLCH instead of HSL. Each step takes its lightness and chroma from the built-in b1 ramp, with chroma scaled by the input saturation and lowered to fit the sRGB gamut. Every hue now lands at the same perceived lightness per step, so white on step 600, step 600 as text on the light page, and step 400 as text on the dark page all meet WCAG AA. Yellow and green hues used to fall as low as 1.7:1. The `applyAutoColorRamp` signature does not change.

- [#57](https://github.com/atom63/atom63-design-system/pull/57) [`614e4a5`](https://github.com/atom63/atom63-design-system/commit/614e4a5a1b02d0422aaf53920d6a6f840042b217) Thanks [@atom63](https://github.com/atom63)! - Add media and on-media color tokens for controls over photos and video. Media colors are unknowable, so these tokens hold in every theme:
  
  - `--a63-media-stage` (black) and `--a63-media-scrim` (black 70%) for the area behind full-screen media.
  - `--a63-on-media-foreground`, `--a63-on-media-surface` (+ `-strong`), `--a63-on-media-border`, `--a63-on-media-ring` and `--a63-on-media-veil` (+ `-strong`) for controls that sit on it.
  
  They alias the black and white alpha steps. `compat/a63-from-shadcn` defines them too.
  
  ui-react's MediaLightbox, VideoDialog and VideoModal now read these tokens instead of literal colors. The lightbox's `--a63-lightbox-on-media-*` hooks stay and point at them. Snapping to the alpha steps moves the lightbox control backplate from 55% to 60% black, its border from 16% to 20% white and its focus ring from 85% to 90% white. VideoModal's "No video available" placeholder follows the theme's muted surface and secondary text.

- [#16](https://github.com/atom63/atom63-design-system/pull/16) [`9109b20`](https://github.com/atom63/atom63-design-system/commit/9109b2076a71764d3869c3932ad9fdc0d676dd5b) Thanks [@atom63](https://github.com/atom63)! - Meet WCAG AA contrast for the primary action and badges. `--a63-action-primary` now uses brand step 600 (700 for b3), so white labels reach 4.5:1. The new `--a63-text-accent` token carries the brand as text: the per-brand `--a63-brand-text` in light mode and step 400 in dark mode. Components that used the primary fill as text now use it. Badge foregrounds move to steps 700/800, and info, success and warning get their own badge foreground tokens. The auto-contrast switch for custom brand colors moves from the 3:1 point to where near-white and near-black give equal contrast.

- [#75](https://github.com/atom63/atom63-design-system/pull/75) [`c3bdaf8`](https://github.com/atom63/atom63-design-system/commit/c3bdaf8648b67d7ce63bac343a5b9e42fafb5bae) Thanks [@atom63](https://github.com/atom63)! - Disabled buttons keep their resting background, border and link underline under the pointer.
  Switch and standalone Toggle draw their keyboard focus ring as an outline, so the ring shows in
  themes whose control shadow is `none`; before, the `none` shadow made the whole ring declaration
  invalid and no ring was drawn.
- Updated dependencies [[`657033f`](https://github.com/atom63/atom63-design-system/commit/657033fbb6460378e319e860a4391cf1053aca04), [`bbd4c87`](https://github.com/atom63/atom63-design-system/commit/bbd4c877ff39d9a58746997cc4b5b2b3a9c928ba), [`be6077c`](https://github.com/atom63/atom63-design-system/commit/be6077c79fc1d3126427f9e44dc8f9446a06bbcd), [`0a538ef`](https://github.com/atom63/atom63-design-system/commit/0a538ef579c3841dcfae600403ce98f47053bd52), [`a76b878`](https://github.com/atom63/atom63-design-system/commit/a76b878ea50c2ebbe75f4e4261cab42a89e22077), [`a76b878`](https://github.com/atom63/atom63-design-system/commit/a76b878ea50c2ebbe75f4e4261cab42a89e22077), [`a76b878`](https://github.com/atom63/atom63-design-system/commit/a76b878ea50c2ebbe75f4e4261cab42a89e22077), [`11555a8`](https://github.com/atom63/atom63-design-system/commit/11555a8d79f53ed5bcdbf4dc6476eecdc85dddac), [`948aa37`](https://github.com/atom63/atom63-design-system/commit/948aa3772be67e1a27c8e007c7e014d32a17d0ca), [`78af86a`](https://github.com/atom63/atom63-design-system/commit/78af86a8af0f89a11b536109f4a0ef6e319478db), [`0b83864`](https://github.com/atom63/atom63-design-system/commit/0b8386419fb36738ea80a142b38ba523fb281983), [`ffc8394`](https://github.com/atom63/atom63-design-system/commit/ffc8394d5f1e4cb9f5eb7ab922c3c7b5b125f9c3), [`85c29a5`](https://github.com/atom63/atom63-design-system/commit/85c29a53491c3c96ca3076e0964d138d5ec9ff75), [`f321b96`](https://github.com/atom63/atom63-design-system/commit/f321b961a259bcbfe422f07387ca72856f6f912d), [`2cd2cb1`](https://github.com/atom63/atom63-design-system/commit/2cd2cb17474284abf5b58c47e864f4127190677d), [`3de1dce`](https://github.com/atom63/atom63-design-system/commit/3de1dcee52dc86436a0530d6849727705bc48945), [`11555a8`](https://github.com/atom63/atom63-design-system/commit/11555a8d79f53ed5bcdbf4dc6476eecdc85dddac), [`614e4a5`](https://github.com/atom63/atom63-design-system/commit/614e4a5a1b02d0422aaf53920d6a6f840042b217), [`9109b20`](https://github.com/atom63/atom63-design-system/commit/9109b2076a71764d3869c3932ad9fdc0d676dd5b), [`f89eda9`](https://github.com/atom63/atom63-design-system/commit/f89eda9abc960caf880b57b1e41f73a7b4e8dd68), [`b8a42d8`](https://github.com/atom63/atom63-design-system/commit/b8a42d86c445889f24ca80ca63e2c8433b9ae778), [`2f46468`](https://github.com/atom63/atom63-design-system/commit/2f46468f5a4b1b223f6a4235f15a47e2a0f393f4), [`38430d0`](https://github.com/atom63/atom63-design-system/commit/38430d06d2a691a43beb177906d2c8270e14b84c), [`b784cf5`](https://github.com/atom63/atom63-design-system/commit/b784cf5413e82a0343162ef1824ed73e9c19850d)]:
  - @atom63/ui-foundation@0.1.1-beta.3
  - @atom63/styles@0.1.0-beta.6

## 0.2.0-beta.9

### Patch Changes

- Updated dependencies [[`4713698`](https://github.com/atom63/atom63-design-system/commit/47136984d7c478d00f46a68b2292a71776315316), [`9a7dc5e`](https://github.com/atom63/atom63-design-system/commit/9a7dc5e6db27f5aec556808fbfb1e9b741f9b809), [`4713698`](https://github.com/atom63/atom63-design-system/commit/47136984d7c478d00f46a68b2292a71776315316)]:
  - @atom63/styles@0.1.0-beta.5

## 0.2.0-beta.8

### Patch Changes

- [#2](https://github.com/atom63/atom63-design-system/pull/2) [`12509a2`](https://github.com/atom63/atom63-design-system/commit/12509a2ee3946a15b466d1c84180bd5c92189092) Thanks [@atom63](https://github.com/atom63)! - Include the MIT `LICENSE` file in the published package. The packages were already MIT-licensed
  through `package.json`; the tarball now carries the license text as well.
- Updated dependencies [[`12509a2`](https://github.com/atom63/atom63-design-system/commit/12509a2ee3946a15b466d1c84180bd5c92189092)]:
  - @atom63/styles@0.1.0-beta.4
  - @atom63/ui-foundation@0.1.1-beta.2

## 0.2.0-beta.7

### Patch Changes

- [`11eb186`](https://github.com/atom63/atom63-design-system/commit/11eb186deebc11af95a22b67ae1dfe20d6c957dc) Thanks [@atom63](https://github.com/atom63)! - `react-hook-form` is now a peer dependency instead of a bundled dependency. `Form` binds to the
  consumer's `useForm` through react-hook-form context, so both must resolve to the same installed
  copy; a separately installed version would give each side its own context. Install
  `react-hook-form@^7.81.0` alongside `@atom63/ui-react` if your package manager does not add peers
  automatically.
- Updated dependencies [[`11eb186`](https://github.com/atom63/atom63-design-system/commit/11eb186deebc11af95a22b67ae1dfe20d6c957dc)]:
  - @atom63/styles@0.1.0-beta.3

## 0.2.0-beta.6

### Patch Changes

- `FeedbackState` icons are typed again. `icon` on the state and on each action accepts a built-in name (`alertTriangle`, `clock`, `fileSearch`, `inbox`, `refreshCw`, `searchX`, `spinner`, `wifiOff`) or any React element. Since the design system stopped depending on `@atom63/icons`, the name was typed as `string`, so names outside the new lucide map, such as `refreshCw` on retry actions, rendered no icon without a type error. Unknown names are now a type error and still render no icon at runtime. Adds the `FeedbackStateIcon` and `FeedbackStateIconName` types.

## 0.2.0-beta.5

### Patch Changes

- [`90e3bd8`](https://github.com/atom63/atom63-design-system/commit/90e3bd8efb37e43cb6c85fc99a33c3ab93438b49) Thanks [@atom63](https://github.com/atom63)! - `@atom63/ui-react/styles.css` now includes the Tailwind utility classes the components render (layout, media, toaster, and appearance controls), compiled against the Atom63 Tailwind theme. Consumers without Tailwind no longer get unstyled layouts, unsized toast icons, or a spinner that does not spin; Tailwind consumers get harmless duplicates.

## 0.2.0-beta.4

### Patch Changes

- [`1477507`](https://github.com/atom63/atom63-design-system/commit/14775071c249baffb5d3781dcc1b4bca18b99d09) Thanks [@atom63](https://github.com/atom63)! - Fix `vite dev` consumers failing to resolve the packages. The `development` and `typescript` export conditions pointed at `src/*.ts` files that are not published; they are replaced by the repo-private `@atom63/source` condition, so consumers always resolve `dist`.
- Updated dependencies [[`2a794e3`](https://github.com/atom63/atom63-design-system/commit/2a794e3c72c776b850252dbb3f7ace48d8a886ec), [`1477507`](https://github.com/atom63/atom63-design-system/commit/14775071c249baffb5d3781dcc1b4bca18b99d09)]:
  - @atom63/styles@0.1.0-beta.2
  - @atom63/ui-foundation@0.1.1-beta.1

## 0.2.0-beta.3

### Patch Changes

- [`8d6cb22`](https://github.com/atom63/atom63-design-system/commit/8d6cb2226bd72e73414536536f9a381c4c170535) Thanks [@atom63](https://github.com/atom63)! - Publish the next public beta for the Atom63 website consumer lane.

  `@atom63/styles` now publishes the shared `--font-weight-medium` token so adopters do not need app-local fallback declarations. `@atom63/ui-react` includes the first-use `Atom63Theme` boundary used by the public quickstart and website consumer contract.
- Updated dependencies [[`8d6cb22`](https://github.com/atom63/atom63-design-system/commit/8d6cb2226bd72e73414536536f9a381c4c170535)]:
  - @atom63/styles@0.1.0-beta.1

## 0.2.0-beta.2

### Patch Changes

- Pin `@base-ui/react` to the beta-validated version so public adopters do not resolve a newer Base UI release with incompatible Tooltip types.

## 0.2.0-beta.1

### Patch Changes

- Replace workspace protocol dependencies in the published React package manifest
  with registry-safe Atom63 beta versions so external consumers can install from
  npm.

## 0.2.0-beta.0

### Minor Changes

- [`0b6b2ac`](https://github.com/atom63/atom63-design-system/commit/0b6b2ac97f618e6c42d2e9aef7f400b7e2aa85c8) Thanks [@atom63](https://github.com/atom63)! - Prepare the first-wave Atom63 design-system packages for a coordinated public
  beta. Expose the CSS foundation and renderer contracts, publish the React
  runtime with `lucide-react` defaults instead of a hard `@atom63/icons`
  dependency, and document the tiered support policy for the broad React root.

  This Changeset is release-preparation metadata only. Exact prerelease versions
  must be reviewed in a final Changesets dry-run before versioning, and the first
  publication must use the npm `beta` dist-tag.

### Patch Changes

- Updated dependencies [[`0b6b2ac`](https://github.com/atom63/atom63-design-system/commit/0b6b2ac97f618e6c42d2e9aef7f400b7e2aa85c8)]:
  - @atom63/styles@0.1.0-beta.0
  - @atom63/ui-foundation@0.1.1-beta.0

## 0.1.1

### Patch Changes

- [#344](https://github.com/atom63/atom63-vite/pull/344) [`058173d`](https://github.com/atom63/atom63-vite/commit/058173d4a52a21ac2114ad201d8d441de6fb8f07) Thanks [@atom63](https://github.com/atom63)! - Wrap shared ScrollArea children in the Base UI Content part so dynamically
  growing transcripts update overflow masks and hover-revealed scrollbars.

## 0.1.0

### Minor Changes

- [#316](https://github.com/atom63/atom63-vite/pull/316) [`2e7663f`](https://github.com/atom63/atom63-vite/commit/2e7663fcc0561542b8a7d7dccdb2617732ce07fa) Thanks [@atom63](https://github.com/atom63)! - Add a `button-group` ConnectedPanel variant for split triggers with adjacent actions, plus a
  `forceMount` content option for panels whose children initialize asynchronously.

- [#315](https://github.com/atom63/atom63-vite/pull/315) [`fd3f3c4`](https://github.com/atom63/atom63-vite/commit/fd3f3c4014952d5ff960ec31ad476376d330cbc0) Thanks [@atom63](https://github.com/atom63)! - Add the shared SearchField contract and React component with native search
  semantics, controlled and uncontrolled queries, clear behavior, form submission,
  disabled handling, Storybook coverage, and cross-renderer SwiftUI evidence.
  Complete renderer evidence for every canonical contract and expose EmptyTitle
  with native heading semantics.

- [#297](https://github.com/atom63/atom63-vite/pull/297) [`ae98a86`](https://github.com/atom63/atom63-vite/commit/ae98a86ed635b527e1865457e0fbedc92f4cea7f) Thanks [@atom63](https://github.com/atom63)! - Export `Toaster` and re-export `toast`. `CopyButton` already raised sonner toasts, but the package shipped no host for them, so consuming apps had to add their own sonner dependency to make package components audible. The `Toaster` reads its colors from the theme contract rather than sonner's built-in palette.

### Patch Changes

- [#280](https://github.com/atom63/atom63-vite/pull/280) [`c069a57`](https://github.com/atom63/atom63-vite/commit/c069a575b6f8bf4e3818742da3827c604fc4f480) Thanks [@atom63](https://github.com/atom63)! - Move Spinner and AnimatedCheck into the new `@atom63/icons/animated` subpath while keeping the `@atom63/ui-react` exports as compatibility bridges.

- [`869844f`](https://github.com/atom63/atom63-vite/commit/869844fab00764665f03530c9226efdbed5ee3f6) Thanks [@atom63](https://github.com/atom63)! - Move the shared Drawer component from Vaul to Base UI Drawer while preserving the Atom63 compound component API.

- [#297](https://github.com/atom63/atom63-vite/pull/297) [`3ab5e63`](https://github.com/atom63/atom63-vite/commit/3ab5e63b016b63471b59c153b37d1fbfedebe88a) Thanks [@atom63](https://github.com/atom63)! - Make `justify-content` work on Button. The label wrapper was a single content-sized flex item, so the button's own alignment had nothing to distribute and utilities like `justify-between` were silently inert. The label now stretches and inherits alignment, so trailing content (a `Kbd`, a chevron) can be pinned to the right edge. Content-sized buttons are unaffected, and full-width buttons keep centering.

- [#316](https://github.com/atom63/atom63-vite/pull/316) [`2e7663f`](https://github.com/atom63/atom63-vite/commit/2e7663fcc0561542b8a7d7dccdb2617732ce07fa) Thanks [@atom63](https://github.com/atom63)! - Expose controlled `CopyButtonFeedback` so asynchronous copy flows can reuse the standard motion.

- [#276](https://github.com/atom63/atom63-vite/pull/276) [`0b5b534`](https://github.com/atom63/atom63-vite/commit/0b5b5341cd1fe2a7babf0c1abfe68a8015eb1300) Thanks [@atom63](https://github.com/atom63)! - Stack VideoDialog above detail modals and keep PhotoSwipe Escape from dismissing the case-study overlay.

- [#297](https://github.com/atom63/atom63-vite/pull/297) [`f8cbf00`](https://github.com/atom63/atom63-vite/commit/f8cbf00f05e252c272dcf048fbb69030271b12b1) Thanks [@atom63](https://github.com/atom63)! - Fix focus rings being silently dropped on flat controls.

  Recipes compose their shadow token into a comma-separated `box-shadow` list
  alongside the focus ring (`var(--x-shadow), 0 0 0 <width> <color>`). Several of
  those tokens defaulted to `none`, which is only legal as the sole value of
  `box-shadow` — so the entire declaration was invalid and discarded, taking the
  focus ring with it.

  In the default theme this removed the visible focus indicator from `ghost` and
  `link` buttons, and from anything resolving `--a63-marker-shadow` or
  `--a63-trigger-shadow`. It also dropped the intended rest shadow on the
  `overlay` and `glass` button variants.

  The null value is now `0 0 #0000`, which paints nothing but keeps the list
  valid. No visual change other than the restored rings and shadows.

- [#316](https://github.com/atom63/atom63-vite/pull/316) [`2e7663f`](https://github.com/atom63/atom63-vite/commit/2e7663fcc0561542b8a7d7dccdb2617732ce07fa) Thanks [@atom63](https://github.com/atom63)! - Allow consumers to forward semantic attributes to the `ScrollArea` viewport.

- [#276](https://github.com/atom63/atom63-vite/pull/276) [`0b5b534`](https://github.com/atom63/atom63-vite/commit/0b5b5341cd1fe2a7babf0c1abfe68a8015eb1300) Thanks [@atom63](https://github.com/atom63)! - ScrollableList gains `contentPad` and `controlInset` for full-bleed tracks that keep items and chevrons aligned to a narrower reading column.

- [#276](https://github.com/atom63/atom63-vite/pull/276) [`0b5b534`](https://github.com/atom63/atom63-vite/commit/0b5b5341cd1fe2a7babf0c1abfe68a8015eb1300) Thanks [@atom63](https://github.com/atom63)! - Hide ScrollableList's vertical scrollbar and lock overflow-y so horizontal-only lists don't show a stray Y scrollbar.

- [#297](https://github.com/atom63/atom63-vite/pull/297) [`7484e2f`](https://github.com/atom63/atom63-vite/commit/7484e2f373d30a8a5eaf80809d82346cae1d0b05) Thanks [@atom63](https://github.com/atom63)! - Fix the mobile Sidebar drawer rendering without its chrome. The drawer's `Sheet` portals to `<body>`, so it never inherited the `--sidebar-*` aliases declared on `.a63-Sidebar-wrapper`: `background-color` resolved to an invalid value and computed to `transparent` (page content showed through), and nav items lost their hover, active, border, and focus-ring material. The aliases are now declared on `.a63-Sidebar-mobile` as well, including the dark-mode surface override. The drawer also reclaims its `--sidebar-width`, which `.a63-Sheet-popup[data-side]` was out-specifying.

- [#308](https://github.com/atom63/atom63-vite/pull/308) [`b0f4a28`](https://github.com/atom63/atom63-vite/commit/b0f4a285854a92799673d0518799e49998d36fa0) Thanks [@atom63](https://github.com/atom63)! - Align Select and other control geometry with the shared environment axes, and key Resume pan/pinch behavior to pointer modality instead of viewport width.

- [#276](https://github.com/atom63/atom63-vite/pull/276) [`0b5b534`](https://github.com/atom63/atom63-vite/commit/0b5b5341cd1fe2a7babf0c1abfe68a8015eb1300) Thanks [@atom63](https://github.com/atom63)! - Restore Field layout parity with @atom63/ui (legend spacing, horizontal checkbox nudge, description tighten/balance, outline separator, disabled scope).

- [#276](https://github.com/atom63/atom63-vite/pull/276) [`0b5b534`](https://github.com/atom63/atom63-vite/commit/0b5b5341cd1fe2a7babf0c1abfe68a8015eb1300) Thanks [@atom63](https://github.com/atom63)! - Restore HoverCard sideOffset (4), radius-md, side-aware motion, and PortalContainerProvider fallback to match @atom63/ui.

- [#276](https://github.com/atom63/atom63-vite/pull/276) [`0b5b534`](https://github.com/atom63/atom63-vite/commit/0b5b5341cd1fe2a7babf0c1abfe68a8015eb1300) Thanks [@atom63](https://github.com/atom63)! - Restore Input/InputGroup parity with @atom63/ui: full-width chrome, aria-invalid sync, nativeInput, type styles, role=group, addon focus (incl. textarea), context invalid, and block InputGroupTextarea.

- [#276](https://github.com/atom63/atom63-vite/pull/276) [`0b5b534`](https://github.com/atom63/atom63-vite/commit/0b5b5341cd1fe2a7babf0c1abfe68a8015eb1300) Thanks [@atom63](https://github.com/atom63)! - Restore Popover PortalContainerProvider fallback and side-aware open/close motion to match @atom63/ui.

- [#276](https://github.com/atom63/atom63-vite/pull/276) [`0b5b534`](https://github.com/atom63/atom63-vite/commit/0b5b5341cd1fe2a7babf0c1abfe68a8015eb1300) Thanks [@atom63](https://github.com/atom63)! - Restore Tooltip sideOffset default (4) and PortalContainerProvider fallback to match @atom63/ui; bring back handle reposition/crossfade CSS.

- Updated dependencies [[`c069a57`](https://github.com/atom63/atom63-vite/commit/c069a575b6f8bf4e3818742da3827c604fc4f480), [`f8cbf00`](https://github.com/atom63/atom63-vite/commit/f8cbf00f05e252c272dcf048fbb69030271b12b1), [`f8cbf00`](https://github.com/atom63/atom63-vite/commit/f8cbf00f05e252c272dcf048fbb69030271b12b1), [`fd3f3c4`](https://github.com/atom63/atom63-vite/commit/fd3f3c4014952d5ff960ec31ad476376d330cbc0), [`475b376`](https://github.com/atom63/atom63-vite/commit/475b376ca05270b49803c8c52aa22873fc6047f4), [`28dc06b`](https://github.com/atom63/atom63-vite/commit/28dc06ba57916dd8a3f18d7a44bc0c638445549c), [`0b5b534`](https://github.com/atom63/atom63-vite/commit/0b5b5341cd1fe2a7babf0c1abfe68a8015eb1300), [`fd3f3c4`](https://github.com/atom63/atom63-vite/commit/fd3f3c4014952d5ff960ec31ad476376d330cbc0), [`0b5b534`](https://github.com/atom63/atom63-vite/commit/0b5b5341cd1fe2a7babf0c1abfe68a8015eb1300), [`d1e3103`](https://github.com/atom63/atom63-vite/commit/d1e31032c26ede436172aea520bc1aeee26445f2), [`b0f4a28`](https://github.com/atom63/atom63-vite/commit/b0f4a285854a92799673d0518799e49998d36fa0)]:
  - @atom63/icons@0.0.1
  - @atom63/styles@0.0.1
  - @atom63/ui-foundation@0.1.0
