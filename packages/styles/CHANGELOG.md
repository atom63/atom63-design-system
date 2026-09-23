# @atom63/styles

## 0.1.0-beta.1

### Patch Changes

- [`8d6cb22`](https://github.com/atom63/atom63-design-system/commit/8d6cb2226bd72e73414536536f9a381c4c170535) Thanks [@atom63](https://github.com/atom63)! - Publish the next public beta for the Atom63 website consumer lane.

  `@atom63/styles` now publishes the shared `--font-weight-medium` token so adopters do not need app-local fallback declarations. `@atom63/ui-react` includes the first-use `Atom63Theme` boundary used by the public quickstart and website consumer contract.

## 0.1.0-beta.0

### Minor Changes

- [`0b6b2ac`](https://github.com/atom63/atom63-design-system/commit/0b6b2ac97f618e6c42d2e9aef7f400b7e2aa85c8) Thanks [@atom63](https://github.com/atom63)! - Prepare the first-wave Atom63 design-system packages for a coordinated public
  beta. Expose the CSS foundation and renderer contracts, publish the React
  runtime with `lucide-react` defaults instead of a hard `@atom63/icons`
  dependency, and document the tiered support policy for the broad React root.

  This Changeset is release-preparation metadata only. Exact prerelease versions
  must be reviewed in a final Changesets dry-run before versioning, and the first
  publication must use the npm `beta` dist-tag.

## 0.0.1

### Patch Changes

- [#297](https://github.com/atom63/atom63-vite/pull/297) [`f8cbf00`](https://github.com/atom63/atom63-vite/commit/f8cbf00f05e252c272dcf048fbb69030271b12b1) Thanks [@atom63](https://github.com/atom63)! - Raise the minimum touch target automatically on coarse pointers.

  `--a63-control-min-target` only reached its 44px touch value when an app passed
  `input` to `UIProvider`. That opt-in is easy to miss, so apps that never set it
  kept the 24px floor on phones — icon buttons rendered at 28×28, well under the
  WCAG 2.5.5 target size.

  A `@media (pointer: coarse)` block now applies the touch value by default.
  Explicit `data-a63-input="pointer"` / `"keyboard"` still wins, so hybrid devices
  and an explicit appearance-panel choice keep fine-pointer sizing.

  Consumers on touch devices will see controls that were below the floor grow to
  44px. Controls already at or above 44px are unaffected, as is every fine-pointer
  context.

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

- [#297](https://github.com/atom63/atom63-vite/pull/297) [`475b376`](https://github.com/atom63/atom63-vite/commit/475b376ca05270b49803c8c52aa22873fc6047f4) Thanks [@atom63](https://github.com/atom63)! - Drop the raised top rim from flat controls in the modern theme. `outline` and `destructive-outline` already null the other two raised cues (gloss, highlight), but `--a63-control-shadow-flat` aliases the raised shadow by default, so they still painted the hairline white top highlight meant for filled controls. That read as a raised plate on field-like triggers such as search. Modern now sets the flat shadow to `0 0 #0000`; the recipe's tinted inset and drop still supply the gentle lift.

- [#276](https://github.com/atom63/atom63-vite/pull/276) [`0b5b534`](https://github.com/atom63/atom63-vite/commit/0b5b5341cd1fe2a7babf0c1abfe68a8015eb1300) Thanks [@atom63](https://github.com/atom63)! - Derive `--radius-full` from `2 × --radius-md` so it tracks the radius personalization scale.

- [#297](https://github.com/atom63/atom63-vite/pull/297) [`d1e3103`](https://github.com/atom63/atom63-vite/commit/d1e31032c26ede436172aea520bc1aeee26445f2) Thanks [@atom63](https://github.com/atom63)! - Restore elevation on surfaces and overlays, which was silently dropped.

  `--a63-surface-inner-shadow` and `--a63-overlay-inner-shadow` defaulted to
  `none`, and 23 component recipes compose them into a comma-separated list
  (`box-shadow: var(--a63-…-inner-shadow), var(--a63-…-shadow)`). `none` is only
  legal as the sole value of `box-shadow`, so the entire declaration was invalid
  and discarded — Card, Alert, Frame, Dialog, AlertDialog, Tooltip, HoverCard,
  PreviewCard, NavigationMenu, Drawer, Carousel, ConnectedPanel, the attached
  Tabs panel, and the floating/inset Sidebar all rendered with no shadow at all
  in every theme and both modes.

  Both tokens now default to `0 0 #0000`, a valid transparent no-op that composes
  safely — matching the fix already applied to the control, marker, and trigger
  shadow tokens. Flat remains flat; nothing gains an unintended shadow.
