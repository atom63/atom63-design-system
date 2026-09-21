# @atom63/ui-react

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
