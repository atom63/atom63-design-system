# @atom63/styles

## 0.1.0-beta.6

### Minor Changes

- [#57](https://github.com/atom63/atom63-design-system/pull/57) [`614e4a5`](https://github.com/atom63/atom63-design-system/commit/614e4a5a1b02d0422aaf53920d6a6f840042b217) Thanks [@atom63](https://github.com/atom63)! - Add media and on-media color tokens for controls over photos and video. Media colors are unknowable, so these tokens hold in every theme:
  
  - `--a63-media-stage` (black) and `--a63-media-scrim` (black 70%) for the area behind full-screen media.
  - `--a63-on-media-foreground`, `--a63-on-media-surface` (+ `-strong`), `--a63-on-media-border`, `--a63-on-media-ring` and `--a63-on-media-veil` (+ `-strong`) for controls that sit on it.
  
  They alias the black and white alpha steps. `compat/a63-from-shadcn` defines them too.
  
  ui-react's MediaLightbox, VideoDialog and VideoModal now read these tokens instead of literal colors. The lightbox's `--a63-lightbox-on-media-*` hooks stay and point at them. Snapping to the alpha steps moves the lightbox control backplate from 55% to 60% black, its border from 16% to 20% white and its focus ring from 85% to 90% white. VideoModal's "No video available" placeholder follows the theme's muted surface and secondary text.

- [#29](https://github.com/atom63/atom63-design-system/pull/29) [`f89eda9`](https://github.com/atom63/atom63-design-system/commit/f89eda9abc960caf880b57b1e41f73a7b4e8dd68) Thanks [@atom63](https://github.com/atom63)! - Remove the duplicate default surface ramp. `tokens/foundation/aliases.css` and `aliases.tokens.json` declared the 24 `--surface-light-*` / `--surface-dark-*` defaults a second time; `surface.resolver.json` already provides them at `:root` through its default n1 context. The exports `@atom63/styles/tokens/foundation/aliases` and `@atom63/styles/tokens/foundation/aliases.tokens.json` are removed. Values do not change for anyone importing `@atom63/styles` or `@atom63/styles/tokens`. A stylesheet that imports only `tokens/foundation` must also import `tokens/surface` for the surface ramp. The Figma sync model does not change: it already listed these variables once, in the Surface collection.

- [#32](https://github.com/atom63/atom63-design-system/pull/32) [`2f46468`](https://github.com/atom63/atom63-design-system/commit/2f46468f5a4b1b223f6a4235f15a47e2a0f393f4) Thanks [@atom63](https://github.com/atom63)! - Themes reach the token manifest and the Figma sync model. The manifest now includes `src/themes/` with a `theme` layer. The Figma model gains an **Atom63 Theme** collection with eight modes, one per theme × mode (`modern-light` … `terminal-dark`). Every token a theme overrides moves there, and each mode holds the value the browser resolves for that theme and mode. That is 31 variables from Contract, 8 from Mode, and theme-only hooks. A theme value Figma cannot hold, such as retro's four-sided rim border color, keeps its token in its own collection with the default value, with the reason listed in `skipped`. Variable modes need a Figma Professional plan or higher (up to 10 modes per collection). The Atom63 Figma plugin moves the affected variables on the next sync and keeps existing designs bound.

### Patch Changes

- [#26](https://github.com/atom63/atom63-design-system/pull/26) [`be6077c`](https://github.com/atom63/atom63-design-system/commit/be6077c79fc1d3126427f9e44dc8f9446a06bbcd) Thanks [@atom63](https://github.com/atom63)! - The primary action block of the brand axis (`--a63-action-primary`, hover, foreground, text shadow, `--a63-brand-text`, `--a63-focus-ring`, and the b2 and b3 exceptions) is now generated from the DTCG resolver `src/tokens/brand-action.resolver.json` into `brand-action.css`. `brand.css` only imports the two generated files. Values and selectors do not change. The DTCG build supports resolver sets with their own selector, contexts with no tokens, token descriptions as CSS comments, and an empty shadow list as `none`.

- [#25](https://github.com/atom63/atom63-design-system/pull/25) [`0a538ef`](https://github.com/atom63/atom63-design-system/commit/0a538ef579c3841dcfae600403ce98f47053bd52) Thanks [@atom63](https://github.com/atom63)! - The brand ramp (`--a63-brand-50..950` for b1–b6 and `auto`) is now generated from the DTCG resolver `src/tokens/brand-ramp.resolver.json` into `brand-ramp.css`, which `brand.css` imports. Values and selectors do not change. The DTCG build supports `$extensions["io.atom63.derive"]` for tokens whose CSS value is computed, such as the `auto` ramp's runtime fallback.

- [#30](https://github.com/atom63/atom63-design-system/pull/30) [`a76b878`](https://github.com/atom63/atom63-design-system/commit/a76b878ea50c2ebbe75f4e4261cab42a89e22077) Thanks [@atom63](https://github.com/atom63)! - The action, segment, badge and skeleton contracts are now generated from DTCG sources in `src/contracts/` (`action.tokens.json`, `segment.tokens.json`, `badge.resolver.json`, `skeleton.resolver.json`). Values and selectors do not change. Contract values with no DTCG type stay in hand-written `*.native.css` files, which the generated contract CSS imports. Every such value is listed with a reason in `src/tokens/native-values.json`, and `check:dtcg` fails on an unlisted one. The DTCG build also reads `src/contracts/`, accepts aliases to custom properties that the package's CSS still declares by hand, and supports `$extensions["io.atom63.css"].imports`.

- [#30](https://github.com/atom63/atom63-design-system/pull/30) [`a76b878`](https://github.com/atom63/atom63-design-system/commit/a76b878ea50c2ebbe75f4e4261cab42a89e22077) Thanks [@atom63](https://github.com/atom63)! - The choice, control, field, marker, overlay, selection, surface, toggle, track and trigger contracts are now generated from DTCG token files in `src/contracts/`. Values and selectors do not change. Shadows are DTCG `shadow` values (layers with offsets, blur, spread and color), border styles are `strokeStyle`, and the exact CSS text is kept with `io.atom63.derive`. Image and gradient layers, backdrop filters, blend modes, transforms and an em-sized indicator stay in `*.native.css`, listed in `native-values.json`. The DTCG build writes shadow objects and stroke-style keywords.

- [#30](https://github.com/atom63/atom63-design-system/pull/30) [`a76b878`](https://github.com/atom63/atom63-design-system/commit/a76b878ea50c2ebbe75f4e4261cab42a89e22077) Thanks [@atom63](https://github.com/atom63)! - The menu, environment and widget contracts are now generated from DTCG resolvers in `src/contracts/`, so every contract is generated. Their scopes are resolver sets with their own selectors, including the density, design-language and input axes, the radius override, the weather tones, and `@media` / `@supports` conditions. Values, selectors and source order do not change. Safe-area `env()` values, viewport heights, image layers, backdrop filters, blend modes and the iOS press transform stay in `*.native.css`, listed in `native-values.json`. The DTCG build accepts resolvers made of sets only and wraps a set in its `atRule`. `tokens:apply` only writes a single-mode change into an unconditional `:root` set, and explains when a token is declared only in conditional scopes.

- [#47](https://github.com/atom63/atom63-design-system/pull/47) [`11555a8`](https://github.com/atom63/atom63-design-system/commit/11555a8d79f53ed5bcdbf4dc6476eecdc85dddac) Thanks [@atom63](https://github.com/atom63)! - Fix five text-contrast issues that the Storybook axe checks started reporting once the surface mixes moved to oklab. The colors involved are unchanged on the default surfaces, so these issues predate that change; the checks did not report them before. `@atom63/styles` adds `--a63-text-danger` (danger 600 in light mode, 400 in dark mode) for danger text; `--a63-action-danger` stays the fill of danger buttons. In `@atom63/ui-react`, field and form errors and destructive menu items use `--a63-text-danger`, so they reach 4.5:1 on dark surfaces (they were about 2.7:1). A highlighted item in a primary-tone menu shows its shortcut in the highlight foreground. Sidebar and nav-tree group labels use `--a63-text-secondary` instead of a translucent foreground, which fell below 4.5:1 in the terminal theme. A selected row in a framed table fills its cells with the selection color; its white text previously sat on the page surface.

- [#13](https://github.com/atom63/atom63-design-system/pull/13) [`948aa37`](https://github.com/atom63/atom63-design-system/commit/948aa3772be67e1a27c8e007c7e014d32a17d0ca) Thanks [@atom63](https://github.com/atom63)! - Fix the Figma variable model (`@atom63/styles/figma-sync.json`): nine variables that alias font
  stacks or easing curves were typed as numbers while their targets are strings, which Figma rejects
  when the plugin writes the alias. They are now strings, like the variables they point at, and the
  generator fails if an alias and its target ever disagree again.

- [#48](https://github.com/atom63/atom63-design-system/pull/48) [`78af86a`](https://github.com/atom63/atom63-design-system/commit/78af86a8af0f89a11b536109f4a0ef6e319478db) Thanks [@atom63](https://github.com/atom63)! - The Figma sync model (`@atom63/styles/figma-sync.json`) now places a computed token by the axes its value actually varies on, measured in the browser under every theme and mode. Twenty-nine variables that were frozen at their default move to the axis they follow: nine space steps to Density, twelve radius steps to Radius, six type steps to Type Scale, and the primary foreground and focus ring to Brand. The companion plugin moves them and keeps their bindings. Fifty-nine variables vary on more axes than one Figma collection can hold; they keep their default value and are listed in the new `computed` array with the axes they vary on and their CSS expression.

- [#28](https://github.com/atom63/atom63-design-system/pull/28) [`0b83864`](https://github.com/atom63/atom63-design-system/commit/0b8386419fb36738ea80a142b38ba523fb281983) Thanks [@atom63](https://github.com/atom63)! - `tokens:apply` accepts version 2 token patches: a list of changes per Figma collection mode, each a literal value or an alias to another token. A change in a multi-mode collection (Mode, Brand, Surface) is written into the DTCG resolver context of that mode, and a re-pointed variable becomes a DTCG alias. Changes that cannot be written are listed with a reason, and nothing is written: an alias in code set to a raw value, a value computed in CSS, and a token shared by every brand but changed for one. Version 1 patches still apply.

- [#34](https://github.com/atom63/atom63-design-system/pull/34) [`ffc8394`](https://github.com/atom63/atom63-design-system/commit/ffc8394d5f1e4cb9f5eb7ab922c3c7b5b125f9c3) Thanks [@atom63](https://github.com/atom63)! - `@atom63/styles` no longer generates or ships `generated/atom63.figma-tokens.json`. It had no package export and no known consumer; the Figma plugin reads `@atom63/styles/figma-sync.json`, which is unchanged. `@atom63/ui-react` drops its unused direct `date-fns` dependency; `react-day-picker` still brings its own copy, so Calendar behavior does not change.

- [#24](https://github.com/atom63/atom63-design-system/pull/24) [`85c29a5`](https://github.com/atom63/atom63-design-system/commit/85c29a53491c3c96ca3076e0964d138d5ec9ff75) Thanks [@atom63](https://github.com/atom63)! - Status accents (`--a63-status-info`, `--a63-status-success`, `--a63-status-warning`) now use step 600 in light mode and step 500 in dark mode. Icons drawn in these colors, such as the alert icons, the copy check and the load-more status, reach WCAG's 3:1 for graphics in both modes; success and warning on the light page were 2.3:1 and 2.0:1. The Swift tokens for Atom63UI are now generated from the same semantic tokens, so iOS picks up the web values, including the brand-600 primary action.

- [#49](https://github.com/atom63/atom63-design-system/pull/49) [`f321b96`](https://github.com/atom63/atom63-design-system/commit/f321b961a259bcbfe422f07387ca72856f6f912d) Thanks [@atom63](https://github.com/atom63)! - `@atom63/styles` generates `atom63.computed-values.json`: the browser-resolved values of the variables in the Figma sync model's `computed` list, for every combination of the axes they vary on. The iOS package reads it so that `AtomTheme(skin:brand:surface:)` follows the web's skin, brand and surface axes; the file is not part of the npm package.

- [#27](https://github.com/atom63/atom63-design-system/pull/27) [`2cd2cb1`](https://github.com/atom63/atom63-design-system/commit/2cd2cb17474284abf5b58c47e864f4127190677d) Thanks [@atom63](https://github.com/atom63)! - The mode-scoped semantic layer (`semantics.css`: surfaces, text, borders, the neutral and danger actions and status accents for light and dark mode, plus the mode-agnostic surface tint and scrim) is now generated from the DTCG resolver `src/tokens/semantics.resolver.json`. The surface-tint `color-mix()` formulas are declared as `io.atom63.derive` expressions over their inputs. Values and selectors do not change. The DTCG build lets a resolver name the selector of each context, which the mode axis uses for its `.light` / `.dark` classes.

- [#54](https://github.com/atom63/atom63-design-system/pull/54) [`3de1dce`](https://github.com/atom63/atom63-design-system/commit/3de1dcee52dc86436a0530d6849727705bc48945) Thanks [@atom63](https://github.com/atom63)! - `--font-family-mono` lists a Simplified Chinese face for each platform before the generic `monospace`: PingFang SC, Microsoft YaHei, Noto Sans Mono CJK SC and WenQuanYi Zen Hei Mono. Before, CJK text in monospace fell back to whichever CJK font the system picked, and on Linux that choice changed between runs.

- [#47](https://github.com/atom63/atom63-design-system/pull/47) [`11555a8`](https://github.com/atom63/atom63-design-system/commit/11555a8d79f53ed5bcdbf4dc6476eecdc85dddac) Thanks [@atom63](https://github.com/atom63)! - Color mixes that take a surface, text or border color now interpolate in oklab instead of oklch. The n2–n6 surface palettes are slightly tinted, and browsers disagree on the hue of a color that close to gray: Chrome took the brand's hue even at a 0% tint, so n2–n6 surfaces were tinted toward the brand in Chrome only, and the aqua, terminal and retro themes rendered differently in Chrome than in Safari and Firefox. With oklab every browser renders the same color. The default n1 surfaces do not change; Chrome's n2–n6 surfaces return to their palette hue, and the aqua, terminal and retro themes in Safari and Firefox now match Chrome. Mixes of two chromatic colors are unchanged.

- [#16](https://github.com/atom63/atom63-design-system/pull/16) [`9109b20`](https://github.com/atom63/atom63-design-system/commit/9109b2076a71764d3869c3932ad9fdc0d676dd5b) Thanks [@atom63](https://github.com/atom63)! - Meet WCAG AA contrast for the primary action and badges. `--a63-action-primary` now uses brand step 600 (700 for b3), so white labels reach 4.5:1. The new `--a63-text-accent` token carries the brand as text: the per-brand `--a63-brand-text` in light mode and step 400 in dark mode. Components that used the primary fill as text now use it. Badge foregrounds move to steps 700/800, and info, success and warning get their own badge foreground tokens. The auto-contrast switch for custom brand colors moves from the 3:1 point to where near-white and near-black give equal contrast.

- [#45](https://github.com/atom63/atom63-design-system/pull/45) [`b8a42d8`](https://github.com/atom63/atom63-design-system/commit/b8a42d86c445889f24ca80ca63e2c8433b9ae778) Thanks [@atom63](https://github.com/atom63)! - The radius and effects foundations, the space and motion intents, and the radius, font and type-scale axes are now generated from DTCG sources. Radius, font and type-scale are resolvers with one modifier each (`data-a63-radius`, `data-a63-font`, `data-a63-type-scale`); motion keeps its reduced-motion overrides as a resolver set under `@media (prefers-reduced-motion: reduce)`. Values and selectors do not change, and the token manifest and Figma sync model are byte-identical. The DTCG build now accepts the `fontWeight` type. Only the responsive type scale is still written in CSS.

- [#31](https://github.com/atom63/atom63-design-system/pull/31) [`38430d0`](https://github.com/atom63/atom63-design-system/commit/38430d06d2a691a43beb177906d2c8270e14b84c) Thanks [@atom63](https://github.com/atom63)! - The four themes (modern, aqua, retro, terminal) are now generated from DTCG resolvers in `src/themes/`. Each theme scope (the theme itself, and the theme in light or dark mode) is a resolver set with its own selector, and the sets keep source order. Values and selectors do not change. A theme's shadows are typed DTCG shadows, its border styles are `strokeStyle`, and its private helpers such as `--retro-bevel-drop` are tokens. Image and gradient layers, backdrop filters and blend modes stay in `*.native.css`, listed in `native-values.json`. The DTCG build and `tokens:apply` read `src/themes/`.

- [#46](https://github.com/atom63/atom63-design-system/pull/46) [`b784cf5`](https://github.com/atom63/atom63-design-system/commit/b784cf5413e82a0343162ef1824ed73e9c19850d) Thanks [@atom63](https://github.com/atom63)! - The responsive type scale is now generated from `src/tokens/foundation/typography.resolver.json`. Its breakpoints are one Viewport modifier (xs, sm, md), written from the same values both as the `@media (min-width: …)` blocks on `:root` and as the `[data-window-size]` rules, so the two can no longer drift apart. Each step is a DTCG dimension with the formula `calc({$value} * var(--typography-scale, 1))`. The `.text-scale-*` classes are resolver sets under `@layer base`, and the `small` element style moves to `typography.native.css`. Declarations, values and selectors do not change. The DTCG build gains `{$value}` in derive expressions and explicit `emit` targets for a modifier. Every token in the manifest is now generated from DTCG or listed as a CSS-native value.

## 0.1.0-beta.5

### Patch Changes

- [#8](https://github.com/atom63/atom63-design-system/pull/8) [`4713698`](https://github.com/atom63/atom63-design-system/commit/47136984d7c478d00f46a68b2292a71776315316) Thanks [@atom63](https://github.com/atom63)! - The foundation surface aliases, font families and motion tokens are now defined in DTCG files and
  generated, and are exported as `@atom63/styles/tokens/foundation/{aliases,fonts,motion}.tokens.json`.
  Values are unchanged, except that `--font-family-serif` and `--font-family-mono` now quote every
  non-generic family name (for example `'Georgia'`, `'Menlo'`), which CSS treats the same.

- [#5](https://github.com/atom63/atom63-design-system/pull/5) [`9a7dc5e`](https://github.com/atom63/atom63-design-system/commit/9a7dc5e6db27f5aec556808fbfb1e9b741f9b809) Thanks [@atom63](https://github.com/atom63)! - Foundation primitives and the color palette are now defined in DTCG 2025.10 files, and their CSS is
  generated from them. Every CSS custom property keeps its name and value. The DTCG sources are
  exported as `@atom63/styles/tokens/foundation/primitives.tokens.json` and
  `@atom63/styles/tokens/foundation/palette.tokens.json` for tools such as Style Dictionary and
  Terrazzo.

- [#8](https://github.com/atom63/atom63-design-system/pull/8) [`4713698`](https://github.com/atom63/atom63-design-system/commit/47136984d7c478d00f46a68b2292a71776315316) Thanks [@atom63](https://github.com/atom63)! - The surface palette axis (`[data-a63-surface='n1'..'n6']`) is now defined as a DTCG Resolver file and
  its CSS is generated; every value is unchanged. The resolver is exported as
  `@atom63/styles/tokens/surface.resolver.json`. `--a63-surface-tint` is now declared in
  `tokens/semantics.css`, next to the tokens it tints, with the same default of `0%`.

## 0.1.0-beta.4

### Patch Changes

- [#2](https://github.com/atom63/atom63-design-system/pull/2) [`12509a2`](https://github.com/atom63/atom63-design-system/commit/12509a2ee3946a15b466d1c84180bd5c92189092) Thanks [@atom63](https://github.com/atom63)! - Include the MIT `LICENSE` file in the published package. The packages were already MIT-licensed
  through `package.json`; the tarball now carries the license text as well.

## 0.1.0-beta.3

### Patch Changes

- [`11eb186`](https://github.com/atom63/atom63-design-system/commit/11eb186deebc11af95a22b67ae1dfe20d6c957dc) Thanks [@atom63](https://github.com/atom63)! - `@atom63/styles/z-layers` now ships compiled JavaScript with a type declaration instead of a
  TypeScript source file, so plain JavaScript projects, Node and bundlers that do not transpile
  `node_modules` can import `Z_LAYERS`. The values are generated from the `--z-layer-*` tokens in
  `primitives.css` and are unchanged; the object is now frozen.

## 0.1.0-beta.2

### Minor Changes

- [`2a794e3`](https://github.com/atom63/atom63-design-system/commit/2a794e3c72c776b850252dbb3f7ace48d8a886ec) Thanks [@atom63](https://github.com/atom63)! - Add the `@atom63/styles/tokens.json` and `@atom63/styles/figma-sync.json` exports. `tokens.json` is the token manifest every renderer reads; `figma-sync.json` is the Figma variable model: one single-mode collection per token layer, one collection per personalization axis with the axis values as modes, aliases where a token references another synced token, and browser-resolved literals everywhere else.

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
