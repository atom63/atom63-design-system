# @atom63/ui-foundation

## 0.2.0-beta.5

### Minor Changes

- [#235](https://github.com/atom63/atom63-design-system/pull/235) [`b1ec823`](https://github.com/atom63/atom63-design-system/commit/b1ec82312e90d848d8e7629ef05536a48a8efad9) Thanks [@atom63](https://github.com/atom63)! - Add Amount, the web counterpart of iOS `AtomAmountText`: a money amount in the display text role (`size="md"`, 40px) or display-large (`size="lg"`, 56px), formatted for the locale with `Intl.NumberFormat`, with the fraction at half size and raised, tabular figures, and one accessible label.

- [#231](https://github.com/atom63/atom63-design-system/pull/231) [`9bc6357`](https://github.com/atom63/atom63-design-system/commit/9bc6357002be5f7305d6688ab64862f321e7ff04) Thanks [@atom63](https://github.com/atom63)! - Add ChatComposer. ChatComposer is the message field of an assistant chat: a growing textarea with an attach slot and a send button that turns into stop while a reply streams.

- [#231](https://github.com/atom63/atom63-design-system/pull/231) [`9bc6357`](https://github.com/atom63/atom63-design-system/commit/9bc6357002be5f7305d6688ab64862f321e7ff04) Thanks [@atom63](https://github.com/atom63)! - Add ChatMessage and ChatMessageList (a log region for the transcript). ChatMessage shows one turn of a conversation: the user's message in a tinted bubble on the trailing side, the assistant's as plain text or a bubble. The `from` prop takes the conversation role.

- [#231](https://github.com/atom63/atom63-design-system/pull/231) [`9bc6357`](https://github.com/atom63/atom63-design-system/commit/9bc6357002be5f7305d6688ab64862f321e7ff04) Thanks [@atom63](https://github.com/atom63)! - Add ChatSteps and ChatStep. ChatSteps lists the tool calls and thinking steps behind an assistant reply in a collapsible group, each with a status icon.

- [#231](https://github.com/atom63/atom63-design-system/pull/231) [`9bc6357`](https://github.com/atom63/atom63-design-system/commit/9bc6357002be5f7305d6688ab64862f321e7ff04) Thanks [@atom63](https://github.com/atom63)! - Add ChatTypingIndicator. ChatTypingIndicator shows three pulsing dots while an assistant is preparing its reply, and announces it politely.

- [#212](https://github.com/atom63/atom63-design-system/pull/212) [`1881a52`](https://github.com/atom63/atom63-design-system/commit/1881a52447cacc0f135d7a6c53bf4bf88489b7d2) Thanks [@atom63](https://github.com/atom63)! - Add Rating: a score out of `max` stars (5 by default). Without `onValueChange` it is read-only, one image named "4.5 out of 5" with half stars; with `onValueChange` it is a radio group with one radio per star. `icon` replaces the star.

- [#236](https://github.com/atom63/atom63-design-system/pull/236) [`1d1a536`](https://github.com/atom63/atom63-design-system/commit/1d1a536af297623afee814a0bcff1483f67e6f65) Thanks [@atom63](https://github.com/atom63)! - Amount takes `fraction="raised" | "baseline"` (default `raised`): `baseline` keeps the half-size fraction on the baseline of the integer digits. The amount contract lists the values as `amountFractions`, and `@atom63/styles/tailwind` adds the `amount-fraction-baseline` utility. On iOS, `AtomAmountText` takes `fraction: .raised | .baseline` (`AtomAmountFraction`).

- [#211](https://github.com/atom63/atom63-design-system/pull/211) [`c625d3a`](https://github.com/atom63/atom63-design-system/commit/c625d3ac03571a863f2c325a0fd9083261dd0493) Thanks [@atom63](https://github.com/atom63)! - Button takes `indicator` (`true` for an unread dot, or a count, shown as 99+ above 99) pinned to its top-end corner, with `indicatorLabel` for the text added to the accessible name. Avatar takes `shape` (`circle`, the default, or `square`) and `ring`, an accent ring set off by the page surface.

- [#208](https://github.com/atom63/atom63-design-system/pull/208) [`e5d395b`](https://github.com/atom63/atom63-design-system/commit/e5d395b48c402ad8421912f273274635cb33bfd1) Thanks [@atom63](https://github.com/atom63)! - Button takes `shape` (`default` or `round`). `round` gives a full radius: a circle for icon sizes and a pill for labelled sizes. Web-only for now.

- [#212](https://github.com/atom63/atom63-design-system/pull/212) [`1881a52`](https://github.com/atom63/atom63-design-system/commit/1881a52447cacc0f135d7a6c53bf4bf88489b7d2) Thanks [@atom63](https://github.com/atom63)! - Add CarouselDots, one button per snap point with the current one marked `aria-current`. ItemGroup takes `variant` (`default` or `inset`): inset draws the group as a rounded card with hairline dividers, the grouped settings list.

- [#234](https://github.com/atom63/atom63-design-system/pull/234) [`b0c2c05`](https://github.com/atom63/atom63-design-system/commit/b0c2c052a58a3ba5c939bfadebdf3284b546cae9) Thanks [@atom63](https://github.com/atom63)! - CarouselDots takes `shape` (`dot` or `pill`) and `tone` (`neutral`, `accent` or `on-media`) from the new `dotShapes` and `dotTones` axes of the carousel contract. The default is now round dots that mark the current page by colour and sit 24px apart; pass `shape="pill"` for the previous look, where the current dot stretches into a pill. `tone="accent"` draws the current dot in the primary action colour, and `tone="on-media"` draws white dots from the `--a63-on-media-*` tokens for carousels of photos or video.

- [#233](https://github.com/atom63/atom63-design-system/pull/233) [`f3dfc11`](https://github.com/atom63/atom63-design-system/commit/f3dfc117b18676eb56d70a8f8daf14a70f5d50a5) Thanks [@atom63](https://github.com/atom63)! - Add a `layout` axis to ChatComposer (`chatComposerLayouts`, `ChatComposerLayout`). The new default, `inline`, is one pill row: the attach slot, the field, then the actions and the send button. It grows into a block, with the controls in a row under the text, once the text wraps or has a line break. `layout="stacked"` keeps the previous two-row composer. The send and stop buttons are now neutral solid circles (`variant="default"`) instead of primary. A new `onVoice` prop (with `voiceIcon` and `voiceLabel`) shows a voice button in place of the send button while the field is empty.

- [#203](https://github.com/atom63/atom63-design-system/pull/203) [`57a4a41`](https://github.com/atom63/atom63-design-system/commit/57a4a4191f29ffef0eaf823d17f84f9da0e97e89) Thanks [@atom63](https://github.com/atom63)! - Badge takes `dot` (`true` or a palette hue) for a leading category dot. ToggleGroup takes `variant` (`segmented`, the default, or `pills`) to draw its items as separate capsules for filter rows. Button gains a `dashed` variant, a pill-shaped outline with a dashed border, for add and filter affordances.

- [#187](https://github.com/atom63/atom63-design-system/pull/187) [`32e030a`](https://github.com/atom63/atom63-design-system/commit/32e030a63a913ae631a4083d55b881ecf246080e) Thanks [@atom63](https://github.com/atom63)! - Components now accept the `variant` values their contracts list. `ResizableHandle` takes `variant="line" | "grip"` (`withHandle` is deprecated), `TextTicker` takes `variant="truncate" | "marquee"` (`animationType` is deprecated) and `AnimatedCheck` takes `variant="animated" | "static"` (`animate` is deprecated); each sets `data-variant`. The Table contract drops its `plain`/`framed` variants, because the framed look comes from sitting inside a `Frame`, so `tableVariants` and `TableVariant` are no longer exported from `@atom63/ui-foundation`. A test now fails when a contract lists `variants` that its React component does not accept.

- [#207](https://github.com/atom63/atom63-design-system/pull/207) [`7b1bb6e`](https://github.com/atom63/atom63-design-system/commit/7b1bb6e88af05c22c58415ac39392a500e7686c5) Thanks [@atom63](https://github.com/atom63)! - Radio and Checkbox take `indicator` (`visible`, the default, or `hidden`): a hidden control stays focusable and announced but draws nothing, and its choice card shows a border and the focus ring. In a `size="sm"` Table, checkboxes and radios no longer add the layout margin that set the row height; their hit area is unchanged. SearchField takes `endAddon` for a control after the field. Avatar gains an `xs` size (20px).

- [#226](https://github.com/atom63/atom63-design-system/pull/226) [`e3e846f`](https://github.com/atom63/atom63-design-system/commit/e3e846f828d35554705ae71b0d7a52bf582253a3) Thanks [@atom63](https://github.com/atom63)! - Item and Carousel gain cross-renderer contracts: `ItemGroup variant="inset"` renders as `AtomListSection` in SwiftUI, and `CarouselDots` as `AtomPageDots` under a paged `TabView`. `reactRendererConformance` carries their React evidence. The Avatar contract notes the SwiftUI `AtomAvatar(badge:)` status dot and count.

- [#227](https://github.com/atom63/atom63-design-system/pull/227) [`daf7330`](https://github.com/atom63/atom63-design-system/commit/daf7330537bfc8a4f6a250282fb870ddf103546d) Thanks [@atom63](https://github.com/atom63)! - Cross-renderer contracts take an optional `swiftUIRendererByVariant`, the SwiftUI renderer for each variant. The Tabs contract maps `default` to `Picker(.segmented)` and `underline` and `attached` to the new Atom63UI `AtomTabRow`, a scrolling row of underline text tabs with an optional SF Symbol over each label.

- [#243](https://github.com/atom63/atom63-design-system/pull/243) [`d625ba1`](https://github.com/atom63/atom63-design-system/commit/d625ba141d74004dda3fe1f5d0659a8c616c0838) Thanks [@atom63](https://github.com/atom63)! - Extend the cross-renderer contracts for the new web treatments and add their SwiftUI counterparts. AtomTextField, AtomTextEditor and AtomFormField accept a filled variant; AtomCard accepts default, filled and elevated variants; AtomButton supports raised emphasis and muted ghost labels; AtomGhostToggleGroup renders quiet filter choices with native Button semantics; native Slider can take `atomSliderTone(_:)`; and AtomProgressView accepts the same accent or neutral track tone.

- [#242](https://github.com/atom63/atom63-design-system/pull/242) [`f04dc6e`](https://github.com/atom63/atom63-design-system/commit/f04dc6e502c16abee43933109017e0cc7b60e01b) Thanks [@atom63](https://github.com/atom63)! - A nested mode scope now recolours what is inside it. The Sidebar declares its `--sidebar-*` aliases again on every `[data-a63-mode]` scope inside its wrapper, so `<UIProvider mode="dark"><Sidebar>` draws a dark sidebar, with dark-mode text and active items, on a light app; before, the aliases kept the wrapper's light values. `Atom63Theme` sets `color: var(--a63-text-primary)`, so inherited text follows a nested scope too. Toaster takes `variant` (`default` or `inverse`): `inverse` draws a compact pill in `--a63-action-neutral` with the status icon after the message, for a short status such as "Scheduling message…" with `toast.loading`. ToggleGroup takes `variant="ghost"`: plain text items with a small gap, only the selected one on `--a63-selected-background` (the accent wash with `tone="accent"`), for quiet toolbar filters. SwiftUI `AtomToast` takes `variant: .inverse`, the same pill in `actionNeutral` with the symbol after the message.

- [#230](https://github.com/atom63/atom63-design-system/pull/230) [`87825b2`](https://github.com/atom63/atom63-design-system/commit/87825b29ad11a0e09cbb666d3bb443da9a99b93d) Thanks [@atom63](https://github.com/atom63)! - Selection is neutral by default. `--a63-selected-background` is now the muted surface and `--a63-selected-foreground` the primary text color; the previous primary wash and accent text move to the new `--a63-selected-accent-background` and `--a63-selected-accent-foreground` (Tailwind `selected-accent` and `selected-accent-foreground`). Item, Table (on the container, for selected rows), SidebarMenuButton, SidebarMenuSubButton and the SidebarNavTree items take `tone` (`neutral` by default, or `accent`). SidebarNavTree's active row is now a neutral plate with primary text; `tone="accent"` keeps the accent text. Slider and Progress take `tone` (`accent` by default, or `neutral` for a primary-text fill on the muted track). Progress exports `ProgressProps`.

- [#237](https://github.com/atom63/atom63-design-system/pull/237) [`d8ef144`](https://github.com/atom63/atom63-design-system/commit/d8ef1448eb1eadfeb6aab67c0c5da853d74630d9) Thanks [@atom63](https://github.com/atom63)! - The phone form factor (`[data-a63-form-factor='phone']`) gives Switch the iOS 26 shape: a 1.375rem pill knob 1.6 times as wide as it is tall, on a track of about 63 by 28px. A new `--a63-switch-thumb-aspect` token (1 by default, a round knob) sets the knob's width over its height, and the Switch track is the knob plus one knob height of travel. `ItemGroup` gains `surface` (`card` | `muted`, default `card`, `data-surface`): `surface="muted"` fills an inset group with `--a63-surface-muted`, the grey card for a white page. SwiftUI `AtomListSection(surface: .muted)` mirrors it.

- [#240](https://github.com/atom63/atom63-design-system/pull/240) [`34859e0`](https://github.com/atom63/atom63-design-system/commit/34859e0e4159b77b0a4d928b02fb53bc87764ba7) Thanks [@atom63](https://github.com/atom63)! - Button gains `tone="muted"` for ghost buttons: the glyph and label rest in the secondary text colour and go to full contrast on hover, keyboard focus, press and while a menu is open. The contract lists the tones `neutral` (default) and `muted`. Icon-only Button sizes and the Dialog close button draw their glyph from the new `--a63-control-icon-only-size-*` tokens, 24/14, 28/16, 32/18, 36/20 and 40/22, so web icon buttons get larger glyphs; labelled buttons and the iOS and phone scopes are unchanged.

- [#228](https://github.com/atom63/atom63-design-system/pull/228) [`8b9830a`](https://github.com/atom63/atom63-design-system/commit/8b9830a79d5bf0123f5c3a0a7531d108ae79f1fb) Thanks [@atom63](https://github.com/atom63)! - Adds `--a63-surface-raised-shadow`, a soft lift for borderless raised surfaces; aqua, retro and terminal point it at their own surface shadow. Card takes `variant="filled"` (muted fill, no border) and `variant="elevated"` (panel fill, soft shadow, no border). Button takes `variant="raised"` (panel fill, primary text, soft shadow, no border); with `shape="round"` it is the floating button over a map or a light photo. Web-only for now. ToggleGroup pills are now drawn by their muted fill alone, without a border. The Button contract and docs say when to use `default` (neutral solid) and `primary` (the main action in the brand colour).

- [#202](https://github.com/atom63/atom63-design-system/pull/202) [`1d7bc85`](https://github.com/atom63/atom63-design-system/commit/1d7bc858d02f0a3f3fde54abc96632577b351308) Thanks [@atom63](https://github.com/atom63)! - Table takes `size` (`default`, `sm`) and `variant` (`default`, `plain`), and `TableHead` and `TableCell` take `sticky` (`start`, `end`). `sm` reads its row padding from the density contract. Item styles a row with `aria-current` or `data-selected` as current or selected. Toggle gains a `subtle` tone that shows a pressed state in the accent color with no fill.

- [#229](https://github.com/atom63/atom63-design-system/pull/229) [`5221ab3`](https://github.com/atom63/atom63-design-system/commit/5221ab3a231e3cceb8c1a286e2b70036e5568a9f) Thanks [@atom63](https://github.com/atom63)! - Add `--a63-text-tertiary`, a third text grey for placeholders, meta and timestamps that keeps WCAG AA 4.5:1 on the page, panel, field fill and muted fill in every theme and mode; every field placeholder now uses it. Add `variant="filled"` (a muted fill, no resting border) and `variant="plain"` (no border or fill, a separator below) to `Input`, `InputGroup` and `SearchField`, with `inputVariants` and `InputVariant` in the input contract.

### Patch Changes

- [#232](https://github.com/atom63/atom63-design-system/pull/232) [`8eb269e`](https://github.com/atom63/atom63-design-system/commit/8eb269e4da94737df3f9f981e8d8322e4d0105ff) Thanks [@atom63](https://github.com/atom63)! - The Button contract says to keep the accent where a product's main action or links are brand-coloured.

- [#231](https://github.com/atom63/atom63-design-system/pull/231) [`9bc6357`](https://github.com/atom63/atom63-design-system/commit/9bc6357002be5f7305d6688ab64862f321e7ff04) Thanks [@atom63](https://github.com/atom63)! - Size an icon inside AvatarFallback to the control icon size for the avatar's size step, so an icon fallback sits inside the filled circle.

- [#215](https://github.com/atom63/atom63-design-system/pull/215) [`eb96ebf`](https://github.com/atom63/atom63-design-system/commit/eb96ebf97f0a13dc545a41fe2ee2d296e7627f0b) Thanks [@atom63](https://github.com/atom63)! - The Button contract's round shape is no longer web-only: the SwiftUI renderer now takes it as a capsule.

- [#238](https://github.com/atom63/atom63-design-system/pull/238) [`c0c8fe5`](https://github.com/atom63/atom63-design-system/commit/c0c8fe5c0ad2226ab1e51ad859c80eae9521d03b) Thanks [@atom63](https://github.com/atom63)! - The phone form factor (`[data-a63-form-factor='phone']`) gives grouped lists the iOS 26 Settings proportions. Two new tokens are declared only in the phone scope: `--a63-inset-row-min-size` (52px) and `--a63-inset-group-radius` (`--radius-2xl`, 18px at defaults). `ItemGroup variant="inset"` reads them with fallbacks: its default and `sm` rows, static or interactive, are at least 52px tall on a phone, and the card takes the 18px corner; outside a phone the rows keep their control-height floor and the card keeps `--radius-lg`. SwiftUI `AtomListSection` rows are at least 52pt tall, scaled with Dynamic Type, on an 18pt continuous corner, and `AtomToggle` and `AtomSelectionRow` drop their own 44pt floor inside a section so every row is the same height.

- [#204](https://github.com/atom63/atom63-design-system/pull/204) [`b72b8a8`](https://github.com/atom63/atom63-design-system/commit/b72b8a8cd81f6bf9724ea05ff31b2ab91a22f160) Thanks [@atom63](https://github.com/atom63)! - SidebarNavGroup takes `collapsible` (with `defaultOpen`, or `open` and `onOpenChange`) so its label folds the group, and SidebarNavCollapsibleItem takes an `icon` for trigger-only sections. CommandInput takes `endAddon` for a shortcut hint or clear button, and `icon` to replace the built-in search icon.

- [#224](https://github.com/atom63/atom63-design-system/pull/224) [`475d77e`](https://github.com/atom63/atom63-design-system/commit/475d77e97879e49dda3f5082a357e453cdf9c869) Thanks [@atom63](https://github.com/atom63)! - The tabs contract's SwiftUI adaptations now say how a `TabView` tab keeps its last row above the floating iOS 26 tab bar: each tab's root is its `ScrollView` or `List`, with no bottom padding, overlay or bottom `ignoresSafeArea`, and extra bottom chrome in `safeAreaInset(edge: .bottom)`.

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
