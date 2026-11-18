# @atom63/styles

## 0.1.0-beta.8

### Minor Changes

- [#236](https://github.com/atom63/atom63-design-system/pull/236) [`1d1a536`](https://github.com/atom63/atom63-design-system/commit/1d1a536af297623afee814a0bcff1483f67e6f65) Thanks [@atom63](https://github.com/atom63)! - Amount takes `fraction="raised" | "baseline"` (default `raised`): `baseline` keeps the half-size fraction on the baseline of the integer digits. The amount contract lists the values as `amountFractions`, and `@atom63/styles/tailwind` adds the `amount-fraction-baseline` utility. On iOS, `AtomAmountText` takes `fraction: .raised | .baseline` (`AtomAmountFraction`).

- [#182](https://github.com/atom63/atom63-design-system/pull/182) [`f207dc7`](https://github.com/atom63/atom63-design-system/commit/f207dc774c67667e1e527d2f05580aa8ce4b6f4a) Thanks [@atom63](https://github.com/atom63)! - Add `--a63-border-input`, the border for form controls a person has to find. It reaches WCAG 1.4.11's 3:1 against the page, the panel and the field fill on every theme, brand, mode and surface (surface step 10 in light mode, step 9 in dark mode, and phosphor values in the terminal theme). Input, Textarea, Select, InputOTP, Autocomplete, Checkbox, Radio, Switch and the Slider thumb now draw their borders with it; decorative edges keep `--a63-border-control`. The shadcn `input` role and the reverse shadcn bridge map to the new token.

- [#220](https://github.com/atom63/atom63-design-system/pull/220) [`70edde7`](https://github.com/atom63/atom63-design-system/commit/70edde79b9f3bab35680c2c471b4a23d65bb0984) Thanks [@atom63](https://github.com/atom63)! - Adds `--a63-gradient-brand-fade`, a vertical hero gradient that fades from the brand into the page (brand 800 at the top, brand 700 at the end of the dark zone, then `--a63-surface-page`), declared per mode so it follows theme, brand and mode. `--a63-gradient-brand-fade-dark-zone` (50%) is the top share of the hero where white on-media text and overlay controls reach WCAG AA on every brand; content over the faded part uses the page tokens. The contrast tests check white on brand 700 and 800 for every brand.

- [#214](https://github.com/atom63/atom63-design-system/pull/214) [`07e274e`](https://github.com/atom63/atom63-design-system/commit/07e274ee36c53520a3e23f1617e84377f1653ed0) Thanks [@atom63](https://github.com/atom63)! - Adds display type: the scale steps `10xl` (40px) and `11xl` (56px) and the text roles `display` and `display-large` (weight 600, strong 700; iOS draws them as `largeTitle`), with `text-display` and `text-display-large` utilities, plus an `amount-fraction` utility for a small, raised fraction in an amount. Adds gradients: `--a63-gradient-brand` (brand ramp 500 to 700) and `--a63-gradient-brand-subtle` (50 to 100), declared with the ramp so nested brands get their own, and `--a63-gradient-scrim` for text over photos.

- [#194](https://github.com/atom63/atom63-design-system/pull/194) [`f0f16e1`](https://github.com/atom63/atom63-design-system/commit/f0f16e15ded421195835d722362566b1e1fa4ca3) Thanks [@atom63](https://github.com/atom63)! - Add seven semantic tokens with light and dark values: `--a63-control-outline-background`, `--a63-control-outline-hover-background` and `--a63-control-outline-hover-border` (outline Button and the button-group ConnectedPanel), `--a63-alert-background` (default Alert), `--a63-choice-card-checked-border` and `--a63-choice-card-checked-background` (a checked FieldLabel) and `--a63-surface-recessed` (the Command panel). Those recipes read the tokens instead of branching on dark mode, and look the same.

- [#221](https://github.com/atom63/atom63-design-system/pull/221) [`bd0d15e`](https://github.com/atom63/atom63-design-system/commit/bd0d15e6319422a2e3b9abdbef5f4cbb4e436bf4) Thanks [@atom63](https://github.com/atom63)! - Add `--a63-action-disabled-background`, `--a63-action-disabled-foreground` and `--a63-action-disabled-border`, the neutral colors of a disabled action. They alias the muted surface, surface step 9 and the subtle border in each mode, so they follow every theme, brand and surface; the label keeps about 3:1 on the fill. A disabled Button with a fill or a border (default, primary, secondary, destructive, destructive-outline, outline and dashed) now draws a grey fill, a subtle border and a muted label instead of keeping its full fill and fading only the label. Ghost, link, overlay and glass still fade only the label, now with `--a63-action-disabled-opacity`. A loading Button keeps its look.

- [#230](https://github.com/atom63/atom63-design-system/pull/230) [`87825b2`](https://github.com/atom63/atom63-design-system/commit/87825b29ad11a0e09cbb666d3bb443da9a99b93d) Thanks [@atom63](https://github.com/atom63)! - Selection is neutral by default. `--a63-selected-background` is now the muted surface and `--a63-selected-foreground` the primary text color; the previous primary wash and accent text move to the new `--a63-selected-accent-background` and `--a63-selected-accent-foreground` (Tailwind `selected-accent` and `selected-accent-foreground`). Item, Table (on the container, for selected rows), SidebarMenuButton, SidebarMenuSubButton and the SidebarNavTree items take `tone` (`neutral` by default, or `accent`). SidebarNavTree's active row is now a neutral plate with primary text; `tone="accent"` keeps the accent text. Slider and Progress take `tone` (`accent` by default, or `neutral` for a primary-text fill on the muted track). Progress exports `ProgressProps`.

- [#235](https://github.com/atom63/atom63-design-system/pull/235) [`b1ec823`](https://github.com/atom63/atom63-design-system/commit/b1ec82312e90d848d8e7629ef05536a48a8efad9) Thanks [@atom63](https://github.com/atom63)! - Add the phone form factor. `[data-a63-form-factor='phone']` sets the type steps to the iOS text sizes (body 17px, subhead 15px, footnote 13px, title-2 22px, large-title 34px) and control sizing to the iOS ramp (36/40/44/48/52px, labels at body size) inside it. The text roles are redeclared on that scope, so `text-body` and the other roles follow it. The page outside the scope is unchanged.

- [#238](https://github.com/atom63/atom63-design-system/pull/238) [`c0c8fe5`](https://github.com/atom63/atom63-design-system/commit/c0c8fe5c0ad2226ab1e51ad859c80eae9521d03b) Thanks [@atom63](https://github.com/atom63)! - The phone form factor (`[data-a63-form-factor='phone']`) gives grouped lists the iOS 26 Settings proportions. Two new tokens are declared only in the phone scope: `--a63-inset-row-min-size` (52px) and `--a63-inset-group-radius` (`--radius-2xl`, 18px at defaults). `ItemGroup variant="inset"` reads them with fallbacks: its default and `sm` rows, static or interactive, are at least 52px tall on a phone, and the card takes the 18px corner; outside a phone the rows keep their control-height floor and the card keeps `--radius-lg`. SwiftUI `AtomListSection` rows are at least 52pt tall, scaled with Dynamic Type, on an 18pt continuous corner, and `AtomToggle` and `AtomSelectionRow` drop their own 44pt floor inside a section so every row is the same height.

- [#235](https://github.com/atom63/atom63-design-system/pull/235) [`b1ec823`](https://github.com/atom63/atom63-design-system/commit/b1ec82312e90d848d8e7629ef05536a48a8efad9) Thanks [@atom63](https://github.com/atom63)! - Add `--a63-control-font-size-secondary`, set only by the phone form factor (subhead size, 15px). Item, Field, Form, Frame and ConnectedPanel descriptions read it with a fallback to `--a63-control-font-size-sm`, so on a phone a description sits below its 17px title and other scopes are unchanged.

- [#237](https://github.com/atom63/atom63-design-system/pull/237) [`d8ef144`](https://github.com/atom63/atom63-design-system/commit/d8ef1448eb1eadfeb6aab67c0c5da853d74630d9) Thanks [@atom63](https://github.com/atom63)! - The phone form factor (`[data-a63-form-factor='phone']`) gives Switch the iOS 26 shape: a 1.375rem pill knob 1.6 times as wide as it is tall, on a track of about 63 by 28px. A new `--a63-switch-thumb-aspect` token (1 by default, a round knob) sets the knob's width over its height, and the Switch track is the knob plus one knob height of travel. `ItemGroup` gains `surface` (`card` | `muted`, default `card`, `data-surface`): `surface="muted"` fills an inset group with `--a63-surface-muted`, the grey card for a white page. SwiftUI `AtomListSection(surface: .muted)` mirrors it.

- [#240](https://github.com/atom63/atom63-design-system/pull/240) [`34859e0`](https://github.com/atom63/atom63-design-system/commit/34859e0e4159b77b0a4d928b02fb53bc87764ba7) Thanks [@atom63](https://github.com/atom63)! - Button gains `tone="muted"` for ghost buttons: the glyph and label rest in the secondary text colour and go to full contrast on hover, keyboard focus, press and while a menu is open. The contract lists the tones `neutral` (default) and `muted`. Icon-only Button sizes and the Dialog close button draw their glyph from the new `--a63-control-icon-only-size-*` tokens, 24/14, 28/16, 32/18, 36/20 and 40/22, so web icon buttons get larger glyphs; labelled buttons and the iOS and phone scopes are unchanged.

- [#219](https://github.com/atom63/atom63-design-system/pull/219) [`343e7a3`](https://github.com/atom63/atom63-design-system/commit/343e7a32072539f5fe5dceac3d046f2a884c8a28) Thanks [@atom63](https://github.com/atom63)! - Adds `--radius-pill`, a fixed `9999px` radius that stays a circle or capsule at any size and on every radius axis value, with a `rounded-pill` Tailwind theme entry. The Tailwind `rounded-full` utility now draws `--radius-pill` too, so it is a true circle at any size; the `--radius-full` CSS variable is unchanged and stays the soft step. Components that promise a circle or pill now use `--radius-pill`: Button `shape="round"`, the dashed Button, the spinner and the indicator, Switch, Radio, Slider, the toggle-group pills, Badge and carousel dots, the input-group button, the carousel, scrollable-list and lightbox overlay buttons, the scroll-area thumb, the card overlay button and cursor label, the widget state badge, and the Avatar and WidgetAvatar fallback radius. A round Button larger than 56px is now a circle instead of a rounded square.

- [#200](https://github.com/atom63/atom63-design-system/pull/200) [`6701b2b`](https://github.com/atom63/atom63-design-system/commit/6701b2b67daf3c920c84aa87a72a498d27bf31d6) Thanks [@atom63](https://github.com/atom63)! - Removes the `--size-0` … `--size-96` primitives and their Figma variables. They duplicated `--spacing-0` … `--spacing-96` value for value; use `--spacing-*` instead.

- [#241](https://github.com/atom63/atom63-design-system/pull/241) [`70c1964`](https://github.com/atom63/atom63-design-system/commit/70c1964f52f4a2805a01572deb861b8f8d607b0b) Thanks [@atom63](https://github.com/atom63)! - Text without a size class now takes the body role (15/23 on the web, 17/22 in a phone scope) instead of the browser's 16/24: `@atom63/styles` sets it on `body` and `[data-a63-form-factor]`, and the `@atom63/ui-react` reset sets it on `Atom63Theme` and `UIProvider` (which used the `sm` step, 13/20, before). `html` keeps the browser size, so `1rem` is still 16px.
  
  Density now applies once, on `<html>` or on a nested scope such as `<UIProvider density="compact">`. Every `:root` token built on `--a63-space-unit` (the space steps, control heights and paddings, row padding, control, menu, toggle and trigger gaps) is declared again on `[data-a63-density]`, so a nested scope recomputes it, and the design-language and phone scopes keep their height ramp inside a density scope. `--a63-density-scale` stays 1 in every density, so compact controls scale by 0.875 (32px to 28px), rounded to whole pixels: control heights, the phone inset row floor and row block padding use `round(nearest, …, 1px)` instead of 0.79 on the root and 0.9 with unchanged spacing on a nested scope.

- [#192](https://github.com/atom63/atom63-design-system/pull/192) [`452732e`](https://github.com/atom63/atom63-design-system/commit/452732e3a0b090a5040f60f1e7fbddbecf580236) Thanks [@atom63](https://github.com/atom63)! - Add `--a63-shadow-color`, the ink of drop shadows (black in every theme). The Card, Slider, Switch and ToggleGroup recipes take their shadow and edge colors from it, and the Card media overlay takes its scrim and icon button colors from `--a63-media-stage` and `--a63-on-media-foreground`, with no visual change. The overlay's top-end corner is now logical, so it mirrors in right-to-left layouts. The reverse shadcn bridge defines the shadow, media and on-media tokens for hosts that skip the foundation.

- [#228](https://github.com/atom63/atom63-design-system/pull/228) [`8b9830a`](https://github.com/atom63/atom63-design-system/commit/8b9830a79d5bf0123f5c3a0a7531d108ae79f1fb) Thanks [@atom63](https://github.com/atom63)! - Adds `--a63-surface-raised-shadow`, a soft lift for borderless raised surfaces; aqua, retro and terminal point it at their own surface shadow. Card takes `variant="filled"` (muted fill, no border) and `variant="elevated"` (panel fill, soft shadow, no border). Button takes `variant="raised"` (panel fill, primary text, soft shadow, no border); with `shape="round"` it is the floating button over a map or a light photo. Web-only for now. ToggleGroup pills are now drawn by their muted fill alone, without a border. The Button contract and docs say when to use `default` (neutral solid) and `primary` (the main action in the brand colour).

- [#152](https://github.com/atom63/atom63-design-system/pull/152) [`ada3ca5`](https://github.com/atom63/atom63-design-system/commit/ada3ca5b4a97a0195f7398b55146ce5929fa5566) Thanks [@atom63](https://github.com/atom63)! - Text roles, an 11px step and media roles.
  
  - Text roles named after the Apple HIG text styles: `large-title`, `title-1`, `title-2`, `title-3`, `headline`, `body`, `callout`, `subhead`, `footnote`, `caption-1` and `caption-2`. Each has `--a63-type-<role>-font-size`, `-line-height`, `-font-weight` and `-font-weight-strong`, on a step of the web scale, with its iOS `Font.TextStyle` recorded in the token source. Tailwind gets `text-<role>` and `text-<role>-strong`, which set size, line height and weight together.
  - A `2xs` step (11px on 13px) at the bottom of the type scale, with `text-2xs`.
  - `--a63-media-surface`: an opaque dark neutral for media areas that does not follow the mode. The roles table exposes `media-stage`, `media-surface`, `media-scrim` and the `on-media-*` tokens to Tailwind and the shadcn bridge.

- [#229](https://github.com/atom63/atom63-design-system/pull/229) [`5221ab3`](https://github.com/atom63/atom63-design-system/commit/5221ab3a231e3cceb8c1a286e2b70036e5568a9f) Thanks [@atom63](https://github.com/atom63)! - Add `--a63-text-tertiary`, a third text grey for placeholders, meta and timestamps that keeps WCAG AA 4.5:1 on the page, panel, field fill and muted fill in every theme and mode; every field placeholder now uses it. Add `variant="filled"` (a muted fill, no resting border) and `variant="plain"` (no border or fill, a separator below) to `Input`, `InputGroup` and `SearchField`, with `inputVariants` and `InputVariant` in the input contract.

### Patch Changes

- [#197](https://github.com/atom63/atom63-design-system/pull/197) [`c537c27`](https://github.com/atom63/atom63-design-system/commit/c537c278e6b56f6b5dea557ad8b22b1ef75a4ea2) Thanks [@atom63](https://github.com/atom63)! - The reverse shadcn bridge declares the media and on-media tokens once; a duplicate block with the same values is removed.

- [#225](https://github.com/atom63/atom63-design-system/pull/225) [`addae94`](https://github.com/atom63/atom63-design-system/commit/addae94c49a53d5e930509a5ab46e8b8e4955079) Thanks [@atom63](https://github.com/atom63)! - The display text role descriptions say how iOS draws them: at the web size, scaled with Dynamic Type like largeTitle, through AtomDisplayRole and AtomAmountText in Atom63UI.

- [#193](https://github.com/atom63/atom63-design-system/pull/193) [`4456f3e`](https://github.com/atom63/atom63-design-system/commit/4456f3ec076b52fc40dad7116e20711847f570d2) Thanks [@atom63](https://github.com/atom63)! - `Sidebar` takes its background from `--a63-surface-sidebar` (muted in light mode, page in dark mode) instead of branching on dark mode in its recipe; it looks the same. The reverse shadcn bridge maps `--a63-surface-sidebar` to the host's `--sidebar`, falling back to `--muted`.

## 0.1.0-beta.7

### Minor Changes

- [#125](https://github.com/atom63/atom63-design-system/pull/125) [`5047bc7`](https://github.com/atom63/atom63-design-system/commit/5047bc7b069223eb1949cbe4ce323bd7275a85cc) Thanks [@atom63](https://github.com/atom63)! - The Figma sync model (`@atom63/styles/figma-sync.json`) and the token manifest name the Figma collections without the `Atom63` prefix: `Theme`, `Contract`, `Semantic`, `Foundation`, `Mode`, `Brand`, `Surface`, `Design Language`, `Input`, `Density`, `Radius`, `Type Scale`, `Font` and `Window Size`.

- [#122](https://github.com/atom63/atom63-design-system/pull/122) [`6c2845b`](https://github.com/atom63/atom63-design-system/commit/6c2845b4d4faeee76c0a08c10e289d6c7518c337) Thanks [@atom63](https://github.com/atom63)! - The Figma sync model (`@atom63/styles/figma-sync.json`) writes a color at an opacity, `color-mix(… var(--x) N%, transparent)`, as a composed value `{ "composed": { "alias": "--x", "opacity": N } }`, so it keeps its alias in every mode. `--a63-focus-ring` moves back to the Semantic collection this way. Every variable also carries `codeSyntax` (`var(--token)`) and Figma `scopes` from the rules in `scripts/lib/figma-sync-rules.mjs`. The iOS token graph resolves composed values the same way.

- [#150](https://github.com/atom63/atom63-design-system/pull/150) [`7ab659e`](https://github.com/atom63/atom63-design-system/commit/7ab659e77f34a4fe6195ef91a4102a1784931d5c) Thanks [@atom63](https://github.com/atom63)! - Semantic roles now come from one table, and the role set covers what shadcn leaves out.
  
  - `src/tailwind/roles.json` maps every role to its `--a63-*` token. `generate:roles` writes the semantic block of `tailwind/theme.css` and all of `compat/shadcn.css` from it, and `check:roles` fails when they drift or a role points at an undeclared token.
  - New roles: `destructive-foreground`, `info-foreground`, `success-foreground`, `warning-foreground`, `surface-sunken`, `selected` and `selected-foreground`, and `chart-1` to `chart-5`. New tokens behind them: `--a63-selected-background`, `--a63-selected-foreground`, `--a63-chart-1` to `--a63-chart-5` and `--a63-surface-sidebar`.
  - `--a63-status-{info,success,warning}-foreground` use the same auto-contrast step as the primary foreground instead of white. Text on solid warning and success fills now passes AA (it was 2.15:1 to 3.95:1).
  - `sidebar` resolves to `--a63-surface-sidebar` in both bridges: the muted surface in light mode and the page surface in dark mode. Before, the Tailwind `bg-sidebar` utility stayed on the muted surface in dark mode while `var(--sidebar)` switched to the page surface.
  - The pink (b4) and red (b6) brands use ramp step 700 for `--a63-brand-text`, like orange (b2), so `--a63-text-accent` and `--a63-selected-foreground` stay at AA on the selected wash (b6 was 4.1:1 to 4.5:1 in light mode).
  - `compat/shadcn.css` declares its aliases on `:root`, `.light`, `.dark` and `[data-a63-mode]`, so a nested `.dark` subtree gets its own values.

- [#151](https://github.com/atom63/atom63-design-system/pull/151) [`a0c90bd`](https://github.com/atom63/atom63-design-system/commit/a0c90bddfc4901472bea054c45f29ae8a0626c51) Thanks [@atom63](https://github.com/atom63)! - Tints and category colors are semantic roles.
  
  - `@atom63/styles` adds `-subtle` and `-subtle-foreground` pairs for destructive, info, success and warning (`--a63-action-danger-subtle`, `--a63-status-*-subtle`), and `--a63-category-<hue>`, `-subtle` and `-subtle-foreground` for all 22 palette hues, including slate, gray, zinc and stone, which had no token before. Every tint is a 14% wash mixed in oklab. The roles table exposes them as `destructive-subtle`, `info-subtle`, `success-subtle`, `warning-subtle` and `category-<hue>(-subtle)(-foreground)`.
  - The amber category uses the warning ramp, so amber chips and warning chips are one hue.
  - The `--a63-badge-*` contract tokens stay as aliases of the new roles.
  - `@atom63/ui-react`: Badge reads the semantic tints. Palette chips move from a 15% to a 14% tint, error chips from 12% to 14%, and amber chip text from amber-800 to warning-800 (amber-400 to warning-400 in dark mode).

### Patch Changes

- [#92](https://github.com/atom63/atom63-design-system/pull/92) [`b9170fd`](https://github.com/atom63/atom63-design-system/commit/b9170fd68cc540f22166cdd973f016778d86d5e6) Thanks [@atom63](https://github.com/atom63)! - Add `--a63-badge-error-foreground` (danger 700 in light mode, danger 400 in dark mode) and use it for the `error` Badge text. The badge used the danger action fill as its text color, which fell to about 2.5:1 contrast on its tint in every dark theme.

- [#145](https://github.com/atom63/atom63-design-system/pull/145) [`8087c69`](https://github.com/atom63/atom63-design-system/commit/8087c69bcce189266b1c90221987e654bab72f21) Thanks [@atom63](https://github.com/atom63)! - `--a63-focus-ring` reaches WCAG 1.4.11's 3:1 against the control and the page in every brand, theme and mode: brand step 600 in light mode and 400 in dark mode. It was the brand's 500 at 30% opacity, about 1.3–1.7:1 on every surface. The token moves from the brand actions to the mode semantics (in Figma, from the Semantic collection to Mode), so it follows a nested light or dark scope.

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
