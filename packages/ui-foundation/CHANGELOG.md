# @atom63/ui-foundation

## 0.1.1-beta.4

### Patch Changes

- [#103](https://github.com/atom63/atom63-design-system/pull/103) [`51070ad`](https://github.com/atom63/atom63-design-system/commit/51070ad6fdff5cd0666ff960b652dbee3c04a411) Thanks [@atom63](https://github.com/atom63)! - Add `ios` sections to the accordion and modal dialog pattern contracts. The accordion checks its disabled header and that activation reveals and hides the content, since iOS does not report expanded state to XCUITest; the dialog checks that the sheet opens named by its title and closes back to the view that opened it.

- [#101](https://github.com/atom63/atom63-design-system/pull/101) [`31fbb11`](https://github.com/atom63/atom63-design-system/commit/31fbb1165725b5b02abb2fefdd425882fdd6feaf) Thanks [@atom63](https://github.com/atom63)! - Add an optional `ios` section to the APG pattern contracts, with the `A11yIos*` types: the XCUITest element type of each part, facts that hold when the pattern's catalog showcase opens, and tap interactions with their results. The switch, select-only combobox, menu button and alert dialog contracts now carry one.

- [#102](https://github.com/atom63/atom63-design-system/pull/102) [`3d8dde4`](https://github.com/atom63/atom63-design-system/commit/3d8dde4f4ff22f529e4df60869df05bef74b8287) Thanks [@atom63](https://github.com/atom63)! - Add `ios` sections to the radio and tabs pattern contracts. The tabs cross-renderer contract now names a segmented `Picker` with the selected content as its SwiftUI renderer for in-page sections, keeping `TabView` for app-level sections, and the radio contract says its inline `Picker` sits inside a `Form` or `List`.

## 0.1.1-beta.3

### Patch Changes

- [#81](https://github.com/atom63/atom63-design-system/pull/81) [`657033f`](https://github.com/atom63/atom63-design-system/commit/657033fbb6460378e319e860a4391cf1053aca04) Thanks [@atom63](https://github.com/atom63)! - `@atom63/ui-foundation` adds the WAI-ARIA APG select-only combobox, switch, checkbox, accordion
  and radio group patterns as accessibility pattern contracts (`comboboxSelectOnlyPattern`,
  `switchPattern`, `checkboxPattern`, `accordionPattern`, `radioPattern`). The Select, Switch,
  Checkbox, Accordion and Radio contracts gain an `accessibility` field that names the pattern, its
  option values and known gaps. `A11yPosition` accepts `checked`, and `A11yRole` and
  `A11yPatternId` list the new roles and patterns.

- [#76](https://github.com/atom63/atom63-design-system/pull/76) [`bbd4c87`](https://github.com/atom63/atom63-design-system/commit/bbd4c877ff39d9a58746997cc4b5b2b3a9c928ba) Thanks [@atom63](https://github.com/atom63)! - `@atom63/ui-foundation` exports accessibility pattern contracts: the WAI-ARIA APG dialog (modal),
  alert dialog, menu button and tabs patterns as data (`dialogModalPattern`, `alertDialogPattern`,
  `menuButtonPattern`, `tabsPattern`, `a11yPatterns`, `getA11yPattern`) with their types. The Dialog,
  AlertDialog, DropdownMenu and Tabs contracts gain an `accessibility` field that names the pattern
  the component implements, its option values and any known gaps.
  
  `AlertDialogPopup` in `@atom63/ui-react` sets `aria-modal="true"`, as the APG alert dialog pattern
  requires.

- [#83](https://github.com/atom63/atom63-design-system/pull/83) [`ad62b14`](https://github.com/atom63/atom63-design-system/commit/ad62b1480089c5b92f984313c1045586e2dba7e3) Thanks [@atom63](https://github.com/atom63)! - The Dialog and Accordion contracts drop the known gaps that `@atom63/ui-react` now closes:
  `dialog-is-modal` and `header-controls-panel`. The Select gap `combobox-active-descendant` now
  cites the APG Combobox pattern, and the Select keyboard gaps name the Base UI version and the
  upstream issue drafts.

## 0.1.1-beta.2

### Patch Changes

- [#2](https://github.com/atom63/atom63-design-system/pull/2) [`12509a2`](https://github.com/atom63/atom63-design-system/commit/12509a2ee3946a15b466d1c84180bd5c92189092) Thanks [@atom63](https://github.com/atom63)! - Include the MIT `LICENSE` file in the published package. The packages were already MIT-licensed
  through `package.json`; the tarball now carries the license text as well.

## 0.1.1-beta.1

### Patch Changes

- [`1477507`](https://github.com/atom63/atom63-design-system/commit/14775071c249baffb5d3781dcc1b4bca18b99d09) Thanks [@atom63](https://github.com/atom63)! - Fix `vite dev` consumers failing to resolve the packages. The `development` and `typescript` export conditions pointed at `src/*.ts` files that are not published; they are replaced by the repo-private `@atom63/source` condition, so consumers always resolve `dist`.

## 0.1.1-beta.0

### Patch Changes

- [`0b6b2ac`](https://github.com/atom63/atom63-design-system/commit/0b6b2ac97f618e6c42d2e9aef7f400b7e2aa85c8) Thanks [@atom63](https://github.com/atom63)! - Prepare the first-wave Atom63 design-system packages for a coordinated public
  beta. Expose the CSS foundation and renderer contracts, publish the React
  runtime with `lucide-react` defaults instead of a hard `@atom63/icons`
  dependency, and document the tiered support policy for the broad React root.

  This Changeset is release-preparation metadata only. Exact prerelease versions
  must be reviewed in a final Changesets dry-run before versioning, and the first
  publication must use the npm `beta` dist-tag.

## 0.1.0

### Minor Changes

- [#315](https://github.com/atom63/atom63-vite/pull/315) [`fd3f3c4`](https://github.com/atom63/atom63-vite/commit/fd3f3c4014952d5ff960ec31ad476376d330cbc0) Thanks [@atom63](https://github.com/atom63)! - Add the native Atom63UI Swift Package, generated shared tokens, SwiftUI controls,
  form and validation patterns, action/feedback/content composition building
  blocks, resource/synchronization/pagination intents, and a runnable iOS reference
  consumer with paged URLSession loading, SwiftData cursor/cache coverage, and a
  searchable native component catalog with state matrices, generated cross-renderer
  contract metadata, motion environment controls, and an aligned Skeleton shimmer
  recipe. Add a repository-root SwiftPM distribution manifest, full 27-contract
  renderer evidence, a frozen public API manifest, an isolated consumer feature
  build, and dedicated macOS package/iOS app CI.

- [#315](https://github.com/atom63/atom63-vite/pull/315) [`fd3f3c4`](https://github.com/atom63/atom63-vite/commit/fd3f3c4014952d5ff960ec31ad476376d330cbc0) Thanks [@atom63](https://github.com/atom63)! - Add the shared SearchField contract and React component with native search
  semantics, controlled and uncontrolled queries, clear behavior, form submission,
  disabled handling, Storybook coverage, and cross-renderer SwiftUI evidence.
  Complete renderer evidence for every canonical contract and expose EmptyTitle
  with native heading semantics.

### Patch Changes

- [#277](https://github.com/atom63/atom63-vite/pull/277) [`28dc06b`](https://github.com/atom63/atom63-vite/commit/28dc06ba57916dd8a3f18d7a44bc0c638445549c) Thanks [@atom63](https://github.com/atom63)! - Resolve UI foundation contracts from source in development so concurrent workspace builds cannot interrupt tests.

- [#308](https://github.com/atom63/atom63-vite/pull/308) [`b0f4a28`](https://github.com/atom63/atom63-vite/commit/b0f4a285854a92799673d0518799e49998d36fa0) Thanks [@atom63](https://github.com/atom63)! - Align Select and other control geometry with the shared environment axes, and key Resume pan/pinch behavior to pointer modality instead of viewport width.
