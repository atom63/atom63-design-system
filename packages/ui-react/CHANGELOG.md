# @atom63/ui-react

## 0.2.0-beta.12

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

- [#239](https://github.com/atom63/atom63-design-system/pull/239) [`b070cf4`](https://github.com/atom63/atom63-design-system/commit/b070cf4a007c8529bf6d13454e8716740c20dc5c) Thanks [@atom63](https://github.com/atom63)! - Table `size="sm"`: a row checkbox, radio or button (a row menu, an inline action) keeps its own size and hit area but counts as 1rem in the row's layout, so dense rows are 33px with any of them (they were 37px with a checkbox and 41px with a 24px row menu). Phone screens keep their controls in the row. Sidebar menu items sit 2px apart instead of 4px, a 34px row pitch.

- [#226](https://github.com/atom63/atom63-design-system/pull/226) [`e3e846f`](https://github.com/atom63/atom63-design-system/commit/e3e846f828d35554705ae71b0d7a52bf582253a3) Thanks [@atom63](https://github.com/atom63)! - Item and Carousel gain cross-renderer contracts: `ItemGroup variant="inset"` renders as `AtomListSection` in SwiftUI, and `CarouselDots` as `AtomPageDots` under a paged `TabView`. `reactRendererConformance` carries their React evidence. The Avatar contract notes the SwiftUI `AtomAvatar(badge:)` status dot and count.

- [#242](https://github.com/atom63/atom63-design-system/pull/242) [`f04dc6e`](https://github.com/atom63/atom63-design-system/commit/f04dc6e502c16abee43933109017e0cc7b60e01b) Thanks [@atom63](https://github.com/atom63)! - A nested mode scope now recolours what is inside it. The Sidebar declares its `--sidebar-*` aliases again on every `[data-a63-mode]` scope inside its wrapper, so `<UIProvider mode="dark"><Sidebar>` draws a dark sidebar, with dark-mode text and active items, on a light app; before, the aliases kept the wrapper's light values. `Atom63Theme` sets `color: var(--a63-text-primary)`, so inherited text follows a nested scope too. Toaster takes `variant` (`default` or `inverse`): `inverse` draws a compact pill in `--a63-action-neutral` with the status icon after the message, for a short status such as "Scheduling message…" with `toast.loading`. ToggleGroup takes `variant="ghost"`: plain text items with a small gap, only the selected one on `--a63-selected-background` (the accent wash with `tone="accent"`), for quiet toolbar filters. SwiftUI `AtomToast` takes `variant: .inverse`, the same pill in `actionNeutral` with the symbol after the message.

- [#221](https://github.com/atom63/atom63-design-system/pull/221) [`bd0d15e`](https://github.com/atom63/atom63-design-system/commit/bd0d15e6319422a2e3b9abdbef5f4cbb4e436bf4) Thanks [@atom63](https://github.com/atom63)! - Add `--a63-action-disabled-background`, `--a63-action-disabled-foreground` and `--a63-action-disabled-border`, the neutral colors of a disabled action. They alias the muted surface, surface step 9 and the subtle border in each mode, so they follow every theme, brand and surface; the label keeps about 3:1 on the fill. A disabled Button with a fill or a border (default, primary, secondary, destructive, destructive-outline, outline and dashed) now draws a grey fill, a subtle border and a muted label instead of keeping its full fill and fading only the label. Ghost, link, overlay and glass still fade only the label, now with `--a63-action-disabled-opacity`. A loading Button keeps its look.

- [#230](https://github.com/atom63/atom63-design-system/pull/230) [`87825b2`](https://github.com/atom63/atom63-design-system/commit/87825b29ad11a0e09cbb666d3bb443da9a99b93d) Thanks [@atom63](https://github.com/atom63)! - Selection is neutral by default. `--a63-selected-background` is now the muted surface and `--a63-selected-foreground` the primary text color; the previous primary wash and accent text move to the new `--a63-selected-accent-background` and `--a63-selected-accent-foreground` (Tailwind `selected-accent` and `selected-accent-foreground`). Item, Table (on the container, for selected rows), SidebarMenuButton, SidebarMenuSubButton and the SidebarNavTree items take `tone` (`neutral` by default, or `accent`). SidebarNavTree's active row is now a neutral plate with primary text; `tone="accent"` keeps the accent text. Slider and Progress take `tone` (`accent` by default, or `neutral` for a primary-text fill on the muted track). Progress exports `ProgressProps`.

- [#238](https://github.com/atom63/atom63-design-system/pull/238) [`c0c8fe5`](https://github.com/atom63/atom63-design-system/commit/c0c8fe5c0ad2226ab1e51ad859c80eae9521d03b) Thanks [@atom63](https://github.com/atom63)! - The phone form factor (`[data-a63-form-factor='phone']`) gives grouped lists the iOS 26 Settings proportions. Two new tokens are declared only in the phone scope: `--a63-inset-row-min-size` (52px) and `--a63-inset-group-radius` (`--radius-2xl`, 18px at defaults). `ItemGroup variant="inset"` reads them with fallbacks: its default and `sm` rows, static or interactive, are at least 52px tall on a phone, and the card takes the 18px corner; outside a phone the rows keep their control-height floor and the card keeps `--radius-lg`. SwiftUI `AtomListSection` rows are at least 52pt tall, scaled with Dynamic Type, on an 18pt continuous corner, and `AtomToggle` and `AtomSelectionRow` drop their own 44pt floor inside a section so every row is the same height.

- [#237](https://github.com/atom63/atom63-design-system/pull/237) [`d8ef144`](https://github.com/atom63/atom63-design-system/commit/d8ef1448eb1eadfeb6aab67c0c5da853d74630d9) Thanks [@atom63](https://github.com/atom63)! - The phone form factor (`[data-a63-form-factor='phone']`) gives Switch the iOS 26 shape: a 1.375rem pill knob 1.6 times as wide as it is tall, on a track of about 63 by 28px. A new `--a63-switch-thumb-aspect` token (1 by default, a round knob) sets the knob's width over its height, and the Switch track is the knob plus one knob height of travel. `ItemGroup` gains `surface` (`card` | `muted`, default `card`, `data-surface`): `surface="muted"` fills an inset group with `--a63-surface-muted`, the grey card for a white page. SwiftUI `AtomListSection(surface: .muted)` mirrors it.

- [#240](https://github.com/atom63/atom63-design-system/pull/240) [`34859e0`](https://github.com/atom63/atom63-design-system/commit/34859e0e4159b77b0a4d928b02fb53bc87764ba7) Thanks [@atom63](https://github.com/atom63)! - Button gains `tone="muted"` for ghost buttons: the glyph and label rest in the secondary text colour and go to full contrast on hover, keyboard focus, press and while a menu is open. The contract lists the tones `neutral` (default) and `muted`. Icon-only Button sizes and the Dialog close button draw their glyph from the new `--a63-control-icon-only-size-*` tokens, 24/14, 28/16, 32/18, 36/20 and 40/22, so web icon buttons get larger glyphs; labelled buttons and the iOS and phone scopes are unchanged.

- [#241](https://github.com/atom63/atom63-design-system/pull/241) [`70c1964`](https://github.com/atom63/atom63-design-system/commit/70c1964f52f4a2805a01572deb861b8f8d607b0b) Thanks [@atom63](https://github.com/atom63)! - Text without a size class now takes the body role (15/23 on the web, 17/22 in a phone scope) instead of the browser's 16/24: `@atom63/styles` sets it on `body` and `[data-a63-form-factor]`, and the `@atom63/ui-react` reset sets it on `Atom63Theme` and `UIProvider` (which used the `sm` step, 13/20, before). `html` keeps the browser size, so `1rem` is still 16px.
  
  Density now applies once, on `<html>` or on a nested scope such as `<UIProvider density="compact">`. Every `:root` token built on `--a63-space-unit` (the space steps, control heights and paddings, row padding, control, menu, toggle and trigger gaps) is declared again on `[data-a63-density]`, so a nested scope recomputes it, and the design-language and phone scopes keep their height ramp inside a density scope. `--a63-density-scale` stays 1 in every density, so compact controls scale by 0.875 (32px to 28px), rounded to whole pixels: control heights, the phone inset row floor and row block padding use `round(nearest, …, 1px)` instead of 0.79 on the root and 0.9 with unchanged spacing on a nested scope.

- [#217](https://github.com/atom63/atom63-design-system/pull/217) [`42cc6b8`](https://github.com/atom63/atom63-design-system/commit/42cc6b81bc6fc1f6b4aed43c459554d5ddbb0c89) Thanks [@atom63](https://github.com/atom63)! - `SidebarNavLinkItem` takes optional `href`, `icon` and `render` props, so an item no longer needs a
  child link element: `<SidebarNavLinkItem href="#inbox" icon={<Inbox />}>Inbox</SidebarNavLinkItem>`
  renders the anchor with the icon and label inside. Pass a router link as `render`
  (`render={<Link to="/inbox" />}`). The child-element form works as before. A link component you
  pass as the child or as `render` must spread the props it receives onto the element it renders and
  forward its ref; a wrapper that drops them loses the item's styling.

- [#228](https://github.com/atom63/atom63-design-system/pull/228) [`8b9830a`](https://github.com/atom63/atom63-design-system/commit/8b9830a79d5bf0123f5c3a0a7531d108ae79f1fb) Thanks [@atom63](https://github.com/atom63)! - Adds `--a63-surface-raised-shadow`, a soft lift for borderless raised surfaces; aqua, retro and terminal point it at their own surface shadow. Card takes `variant="filled"` (muted fill, no border) and `variant="elevated"` (panel fill, soft shadow, no border). Button takes `variant="raised"` (panel fill, primary text, soft shadow, no border); with `shape="round"` it is the floating button over a map or a light photo. Web-only for now. ToggleGroup pills are now drawn by their muted fill alone, without a border. The Button contract and docs say when to use `default` (neutral solid) and `primary` (the main action in the brand colour).

- [#202](https://github.com/atom63/atom63-design-system/pull/202) [`1d7bc85`](https://github.com/atom63/atom63-design-system/commit/1d7bc858d02f0a3f3fde54abc96632577b351308) Thanks [@atom63](https://github.com/atom63)! - Table takes `size` (`default`, `sm`) and `variant` (`default`, `plain`), and `TableHead` and `TableCell` take `sticky` (`start`, `end`). `sm` reads its row padding from the density contract. Item styles a row with `aria-current` or `data-selected` as current or selected. Toggle gains a `subtle` tone that shows a pressed state in the accent color with no fill.

- [#229](https://github.com/atom63/atom63-design-system/pull/229) [`5221ab3`](https://github.com/atom63/atom63-design-system/commit/5221ab3a231e3cceb8c1a286e2b70036e5568a9f) Thanks [@atom63](https://github.com/atom63)! - Add `--a63-text-tertiary`, a third text grey for placeholders, meta and timestamps that keeps WCAG AA 4.5:1 on the page, panel, field fill and muted fill in every theme and mode; every field placeholder now uses it. Add `variant="filled"` (a muted fill, no resting border) and `variant="plain"` (no border or fill, a separator below) to `Input`, `InputGroup` and `SearchField`, with `inputVariants` and `InputVariant` in the input contract.

### Patch Changes

- [#231](https://github.com/atom63/atom63-design-system/pull/231) [`9bc6357`](https://github.com/atom63/atom63-design-system/commit/9bc6357002be5f7305d6688ab64862f321e7ff04) Thanks [@atom63](https://github.com/atom63)! - Size an icon inside AvatarFallback to the control icon size for the avatar's size step, so an icon fallback sits inside the filled circle.

- [#191](https://github.com/atom63/atom63-design-system/pull/191) [`292bd89`](https://github.com/atom63/atom63-design-system/commit/292bd899e32b8c62b9811567f4dc3047d41befe7) Thanks [@atom63](https://github.com/atom63)! - `Carousel` works in right-to-left layouts: it reads the content direction once it mounts and passes it to Embla (an explicit `opts.direction` wins), the arrow keys and the cursor indicator's halves follow the reading direction, and the previous and next buttons sit on logical edges with mirrored icons.

- [#189](https://github.com/atom63/atom63-design-system/pull/189) [`0819d54`](https://github.com/atom63/atom63-design-system/commit/0819d54264e2219b6cb049e854e2e5e9c5c7f791) Thanks [@atom63](https://github.com/atom63)! - `DialogPopup` and `SheetPopup` use `closeProps.children` as the close button's content when given, so the close icon can be replaced. `CopyButton` forwards other button props (including `onClick`, which runs before the copy), clears its reset timer on unmount, and no longer puts the copied value in its `title`, which showed it on hover; the title is the label.

- [#195](https://github.com/atom63/atom63-design-system/pull/195) [`39c39c2`](https://github.com/atom63/atom63-design-system/commit/39c39c2280cf3fdfae86572b09f8d64a1923e791) Thanks [@dependabot](https://github.com/apps/dependabot)! - Raise runtime dependency floors: `@atom63/ui-react` now needs `react-day-picker` `^10.0.2` and `react-resizable-panels` `^4.14.6`, and `@atom63/mdx` needs `shiki` `^4.5.0`.

- [#182](https://github.com/atom63/atom63-design-system/pull/182) [`f207dc7`](https://github.com/atom63/atom63-design-system/commit/f207dc774c67667e1e527d2f05580aa8ce4b6f4a) Thanks [@atom63](https://github.com/atom63)! - Add `--a63-border-input`, the border for form controls a person has to find. It reaches WCAG 1.4.11's 3:1 against the page, the panel and the field fill on every theme, brand, mode and surface (surface step 10 in light mode, step 9 in dark mode, and phosphor values in the terminal theme). Input, Textarea, Select, InputOTP, Autocomplete, Checkbox, Radio, Switch and the Slider thumb now draw their borders with it; decorative edges keep `--a63-border-control`. The shadcn `input` role and the reverse shadcn bridge map to the new token.

- [#194](https://github.com/atom63/atom63-design-system/pull/194) [`f0f16e1`](https://github.com/atom63/atom63-design-system/commit/f0f16e15ded421195835d722362566b1e1fa4ca3) Thanks [@atom63](https://github.com/atom63)! - Add seven semantic tokens with light and dark values: `--a63-control-outline-background`, `--a63-control-outline-hover-background` and `--a63-control-outline-hover-border` (outline Button and the button-group ConnectedPanel), `--a63-alert-background` (default Alert), `--a63-choice-card-checked-border` and `--a63-choice-card-checked-background` (a checked FieldLabel) and `--a63-surface-recessed` (the Command panel). Those recipes read the tokens instead of branching on dark mode, and look the same.

- [#213](https://github.com/atom63/atom63-design-system/pull/213) [`54ac87f`](https://github.com/atom63/atom63-design-system/commit/54ac87f0cf53ac8fcac439f8590cf3155fd49f86) Thanks [@atom63](https://github.com/atom63)! - A Drawer with `modal={false}` no longer draws a backdrop, and the page behind it stays usable: only the sheet takes pointer events. New stories show a persistent bottom sheet with snap points, a scoped dark region with `Atom63Theme`, and round overlay buttons over a photo.

- [#235](https://github.com/atom63/atom63-design-system/pull/235) [`b1ec823`](https://github.com/atom63/atom63-design-system/commit/b1ec82312e90d848d8e7629ef05536a48a8efad9) Thanks [@atom63](https://github.com/atom63)! - Add `--a63-control-font-size-secondary`, set only by the phone form factor (subhead size, 15px). Item, Field, Form, Frame and ConnectedPanel descriptions read it with a fallback to `--a63-control-font-size-sm`, so on a phone a description sits below its 17px title and other scopes are unchanged.

- [#244](https://github.com/atom63/atom63-design-system/pull/244) [`29e5fe7`](https://github.com/atom63/atom63-design-system/commit/29e5fe7843afa99897735df73586f14c3b4389c2) Thanks [@atom63](https://github.com/atom63)! - Make Toaster and Sheet honor the nearest PortalContainerProvider so nested theme regions keep their colors and typography after portalling. Toaster now overrides Sonner's system font with the active Atom63 application font while preserving the document-body fallback when no scoped container is provided.

- [#219](https://github.com/atom63/atom63-design-system/pull/219) [`343e7a3`](https://github.com/atom63/atom63-design-system/commit/343e7a32072539f5fe5dceac3d046f2a884c8a28) Thanks [@atom63](https://github.com/atom63)! - Adds `--radius-pill`, a fixed `9999px` radius that stays a circle or capsule at any size and on every radius axis value, with a `rounded-pill` Tailwind theme entry. The Tailwind `rounded-full` utility now draws `--radius-pill` too, so it is a true circle at any size; the `--radius-full` CSS variable is unchanged and stays the soft step. Components that promise a circle or pill now use `--radius-pill`: Button `shape="round"`, the dashed Button, the spinner and the indicator, Switch, Radio, Slider, the toggle-group pills, Badge and carousel dots, the input-group button, the carousel, scrollable-list and lightbox overlay buttons, the scroll-area thumb, the card overlay button and cursor label, the widget state badge, and the Avatar and WidgetAvatar fallback radius. A round Button larger than 56px is now a circle instead of a rounded square.

- [#178](https://github.com/atom63/atom63-design-system/pull/178) [`76f2a23`](https://github.com/atom63/atom63-design-system/commit/76f2a23688dca40b03d3778e21ab6358d52c46e9) Thanks [@atom63](https://github.com/atom63)! - `ScrollableList` works in right-to-left layouts: it reads the scroll offset from the start edge, so the chevrons show on the correct side, point the right way and scroll in the right direction. The control wrappers' `data-side` is now `start` or `end` instead of `left` or `right`, and they are positioned with logical insets.

- [#192](https://github.com/atom63/atom63-design-system/pull/192) [`452732e`](https://github.com/atom63/atom63-design-system/commit/452732e3a0b090a5040f60f1e7fbddbecf580236) Thanks [@atom63](https://github.com/atom63)! - Add `--a63-shadow-color`, the ink of drop shadows (black in every theme). The Card, Slider, Switch and ToggleGroup recipes take their shadow and edge colors from it, and the Card media overlay takes its scrim and icon button colors from `--a63-media-stage` and `--a63-on-media-foreground`, with no visual change. The overlay's top-end corner is now logical, so it mirrors in right-to-left layouts. The reverse shadcn bridge defines the shadow, media and on-media tokens for hosts that skip the foundation.

- [#204](https://github.com/atom63/atom63-design-system/pull/204) [`b72b8a8`](https://github.com/atom63/atom63-design-system/commit/b72b8a8cd81f6bf9724ea05ff31b2ab91a22f160) Thanks [@atom63](https://github.com/atom63)! - SidebarNavGroup takes `collapsible` (with `defaultOpen`, or `open` and `onOpenChange`) so its label folds the group, and SidebarNavCollapsibleItem takes an `icon` for trigger-only sections. CommandInput takes `endAddon` for a shortcut hint or clear button, and `icon` to replace the built-in search icon.

- [#206](https://github.com/atom63/atom63-design-system/pull/206) [`c0c30ea`](https://github.com/atom63/atom63-design-system/commit/c0c30eafb87fa8e94c1470973af888a76e7c9923) Thanks [@atom63](https://github.com/atom63)! - SidebarMenuButton, SidebarMenuSubButton, SidebarMenuAction, SidebarGroupLabel and SidebarGroupAction now hand their children to a `render` element that has none of its own, as Base UI does, so `<SidebarMenuButton render={<a href="/inbox" />}>Inbox</SidebarMenuButton>` renders its label. A render element with its own children, and `asChild`, behave as before.

- [#177](https://github.com/atom63/atom63-design-system/pull/177) [`9e6182b`](https://github.com/atom63/atom63-design-system/commit/9e6182b6a00413aee4c57f46b54169b4d7bda951) Thanks [@atom63](https://github.com/atom63)! - `SidebarProvider` no longer takes Cmd/Ctrl+B from text fields and rich-text editors, accepts a `keyboardShortcut` prop (a key, or `false` to turn the shortcut off), and writes the `sidebar_state` cookie only when its open state is uncontrolled.

- [#193](https://github.com/atom63/atom63-design-system/pull/193) [`4456f3e`](https://github.com/atom63/atom63-design-system/commit/4456f3ec076b52fc40dad7116e20711847f570d2) Thanks [@atom63](https://github.com/atom63)! - `Sidebar` takes its background from `--a63-surface-sidebar` (muted in light mode, page in dark mode) instead of branching on dark mode in its recipe; it looks the same. The reverse shadcn bridge maps `--a63-surface-sidebar` to the host's `--sidebar`, falling back to `--muted`.

- [#216](https://github.com/atom63/atom63-design-system/pull/216) [`f7b6dcb`](https://github.com/atom63/atom63-design-system/commit/f7b6dcb0f3bd52a1880a40fad31070fa094ae494) Thanks [@atom63](https://github.com/atom63)! - A selected `Table` row (`data-state="selected"`) uses the selection tint, `--a63-selected-background` and `--a63-selected-foreground`, the same as a selected `Item`, instead of a solid `--a63-action-primary` fill with its foreground. Sticky cells and the cells of a framed table lay the translucent tint over their page surface. Tables that relied on the solid accent bar now show a subtle accent wash with accent text.
- Updated dependencies [[`8eb269e`](https://github.com/atom63/atom63-design-system/commit/8eb269e4da94737df3f9f981e8d8322e4d0105ff), [`b1ec823`](https://github.com/atom63/atom63-design-system/commit/b1ec82312e90d848d8e7629ef05536a48a8efad9), [`9bc6357`](https://github.com/atom63/atom63-design-system/commit/9bc6357002be5f7305d6688ab64862f321e7ff04), [`9bc6357`](https://github.com/atom63/atom63-design-system/commit/9bc6357002be5f7305d6688ab64862f321e7ff04), [`9bc6357`](https://github.com/atom63/atom63-design-system/commit/9bc6357002be5f7305d6688ab64862f321e7ff04), [`9bc6357`](https://github.com/atom63/atom63-design-system/commit/9bc6357002be5f7305d6688ab64862f321e7ff04), [`1881a52`](https://github.com/atom63/atom63-design-system/commit/1881a52447cacc0f135d7a6c53bf4bf88489b7d2), [`1d1a536`](https://github.com/atom63/atom63-design-system/commit/1d1a536af297623afee814a0bcff1483f67e6f65), [`9bc6357`](https://github.com/atom63/atom63-design-system/commit/9bc6357002be5f7305d6688ab64862f321e7ff04), [`c625d3a`](https://github.com/atom63/atom63-design-system/commit/c625d3ac03571a863f2c325a0fd9083261dd0493), [`e5d395b`](https://github.com/atom63/atom63-design-system/commit/e5d395b48c402ad8421912f273274635cb33bfd1), [`1881a52`](https://github.com/atom63/atom63-design-system/commit/1881a52447cacc0f135d7a6c53bf4bf88489b7d2), [`b0c2c05`](https://github.com/atom63/atom63-design-system/commit/b0c2c052a58a3ba5c939bfadebdf3284b546cae9), [`f3dfc11`](https://github.com/atom63/atom63-design-system/commit/f3dfc117b18676eb56d70a8f8daf14a70f5d50a5), [`57a4a41`](https://github.com/atom63/atom63-design-system/commit/57a4a4191f29ffef0eaf823d17f84f9da0e97e89), [`c537c27`](https://github.com/atom63/atom63-design-system/commit/c537c278e6b56f6b5dea557ad8b22b1ef75a4ea2), [`32e030a`](https://github.com/atom63/atom63-design-system/commit/32e030a63a913ae631a4083d55b881ecf246080e), [`7b1bb6e`](https://github.com/atom63/atom63-design-system/commit/7b1bb6e88af05c22c58415ac39392a500e7686c5), [`f207dc7`](https://github.com/atom63/atom63-design-system/commit/f207dc774c67667e1e527d2f05580aa8ce4b6f4a), [`70edde7`](https://github.com/atom63/atom63-design-system/commit/70edde79b9f3bab35680c2c471b4a23d65bb0984), [`07e274e`](https://github.com/atom63/atom63-design-system/commit/07e274ee36c53520a3e23f1617e84377f1653ed0), [`eb96ebf`](https://github.com/atom63/atom63-design-system/commit/eb96ebf97f0a13dc545a41fe2ee2d296e7627f0b), [`addae94`](https://github.com/atom63/atom63-design-system/commit/addae94c49a53d5e930509a5ab46e8b8e4955079), [`e3e846f`](https://github.com/atom63/atom63-design-system/commit/e3e846f828d35554705ae71b0d7a52bf582253a3), [`daf7330`](https://github.com/atom63/atom63-design-system/commit/daf7330537bfc8a4f6a250282fb870ddf103546d), [`d625ba1`](https://github.com/atom63/atom63-design-system/commit/d625ba141d74004dda3fe1f5d0659a8c616c0838), [`f04dc6e`](https://github.com/atom63/atom63-design-system/commit/f04dc6e502c16abee43933109017e0cc7b60e01b), [`f0f16e1`](https://github.com/atom63/atom63-design-system/commit/f0f16e15ded421195835d722362566b1e1fa4ca3), [`bd0d15e`](https://github.com/atom63/atom63-design-system/commit/bd0d15e6319422a2e3b9abdbef5f4cbb4e436bf4), [`87825b2`](https://github.com/atom63/atom63-design-system/commit/87825b29ad11a0e09cbb666d3bb443da9a99b93d), [`b1ec823`](https://github.com/atom63/atom63-design-system/commit/b1ec82312e90d848d8e7629ef05536a48a8efad9), [`c0c8fe5`](https://github.com/atom63/atom63-design-system/commit/c0c8fe5c0ad2226ab1e51ad859c80eae9521d03b), [`b1ec823`](https://github.com/atom63/atom63-design-system/commit/b1ec82312e90d848d8e7629ef05536a48a8efad9), [`d8ef144`](https://github.com/atom63/atom63-design-system/commit/d8ef1448eb1eadfeb6aab67c0c5da853d74630d9), [`34859e0`](https://github.com/atom63/atom63-design-system/commit/34859e0e4159b77b0a4d928b02fb53bc87764ba7), [`343e7a3`](https://github.com/atom63/atom63-design-system/commit/343e7a32072539f5fe5dceac3d046f2a884c8a28), [`6701b2b`](https://github.com/atom63/atom63-design-system/commit/6701b2b67daf3c920c84aa87a72a498d27bf31d6), [`70c1964`](https://github.com/atom63/atom63-design-system/commit/70c1964f52f4a2805a01572deb861b8f8d607b0b), [`452732e`](https://github.com/atom63/atom63-design-system/commit/452732e3a0b090a5040f60f1e7fbddbecf580236), [`b72b8a8`](https://github.com/atom63/atom63-design-system/commit/b72b8a8cd81f6bf9724ea05ff31b2ab91a22f160), [`4456f3e`](https://github.com/atom63/atom63-design-system/commit/4456f3ec076b52fc40dad7116e20711847f570d2), [`8b9830a`](https://github.com/atom63/atom63-design-system/commit/8b9830a79d5bf0123f5c3a0a7531d108ae79f1fb), [`1d7bc85`](https://github.com/atom63/atom63-design-system/commit/1d7bc858d02f0a3f3fde54abc96632577b351308), [`475d77e`](https://github.com/atom63/atom63-design-system/commit/475d77e97879e49dda3f5082a357e453cdf9c869), [`ada3ca5`](https://github.com/atom63/atom63-design-system/commit/ada3ca5b4a97a0195f7398b55146ce5929fa5566), [`5221ab3`](https://github.com/atom63/atom63-design-system/commit/5221ab3a231e3cceb8c1a286e2b70036e5568a9f)]:
  - @atom63/ui-foundation@0.2.0-beta.5
  - @atom63/styles@0.1.0-beta.8

## 0.2.0-beta.11

### Minor Changes

- [#165](https://github.com/atom63/atom63-design-system/pull/165) [`52c5bb5`](https://github.com/atom63/atom63-design-system/commit/52c5bb52e9df8cec06492bf4fcabfa8b0f7e0ff8) Thanks [@atom63](https://github.com/atom63)! - **Breaking:** `Calendar` and `CalendarProps` moved from the root entry to their own entry, `@atom63/ui-react/calendar`. The root entry no longer loads `react-day-picker`, so importing anything from `@atom63/ui-react` in Node (tests and SSR) no longer pays for it: about 0.8 s of the 1.1 s root import. Browser bundles are unchanged.
  
  Migration: `import { Calendar } from '@atom63/ui-react/calendar'`

- [#166](https://github.com/atom63/atom63-design-system/pull/166) [`c152bb1`](https://github.com/atom63/atom63-design-system/commit/c152bb1f2a0f3e53340d8bd0a6f9ab7ff3cab61d) Thanks [@atom63](https://github.com/atom63)! - `Page` takes a `render` prop, like the other components built on Base UI `useRender`, and accepts the props of the element it renders. It still renders `<main>` by default. Inside a shell that already owns the `main` landmark, such as `SidebarInset`, render a `div` so the document keeps one `main`: `<Page noPadding render={<div />}>`.

- [#151](https://github.com/atom63/atom63-design-system/pull/151) [`a0c90bd`](https://github.com/atom63/atom63-design-system/commit/a0c90bddfc4901472bea054c45f29ae8a0626c51) Thanks [@atom63](https://github.com/atom63)! - Tints and category colors are semantic roles.
  
  - `@atom63/styles` adds `-subtle` and `-subtle-foreground` pairs for destructive, info, success and warning (`--a63-action-danger-subtle`, `--a63-status-*-subtle`), and `--a63-category-<hue>`, `-subtle` and `-subtle-foreground` for all 22 palette hues, including slate, gray, zinc and stone, which had no token before. Every tint is a 14% wash mixed in oklab. The roles table exposes them as `destructive-subtle`, `info-subtle`, `success-subtle`, `warning-subtle` and `category-<hue>(-subtle)(-foreground)`.
  - The amber category uses the warning ramp, so amber chips and warning chips are one hue.
  - The `--a63-badge-*` contract tokens stay as aliases of the new roles.
  - `@atom63/ui-react`: Badge reads the semantic tints. Palette chips move from a 15% to a 14% tint, error chips from 12% to 14%, and amber chip text from amber-800 to warning-800 (amber-400 to warning-400 in dark mode).

### Patch Changes

- [#92](https://github.com/atom63/atom63-design-system/pull/92) [`b9170fd`](https://github.com/atom63/atom63-design-system/commit/b9170fd68cc540f22166cdd973f016778d86d5e6) Thanks [@atom63](https://github.com/atom63)! - Add `--a63-badge-error-foreground` (danger 700 in light mode, danger 400 in dark mode) and use it for the `error` Badge text. The badge used the danger action fill as its text color, which fell to about 2.5:1 contrast on its tint in every dark theme.

- [#91](https://github.com/atom63/atom63-design-system/pull/91) [`5eae380`](https://github.com/atom63/atom63-design-system/commit/5eae38029e462db7ae671a4b5227d20d3cae8eb4) Thanks [@atom63](https://github.com/atom63)! - Clear the last craft-baseline violations: the ScrollableList glass control uses the overlay shadow tokens and follows the theme, the Calendar dropdown draws its focus ring on `:focus-visible` only, and the appearance swatches use the `border` token ring instead of palette colors and a `dark:` variant.

- [#86](https://github.com/atom63/atom63-design-system/pull/86) [`aec1a7d`](https://github.com/atom63/atom63-design-system/commit/aec1a7d8f1c30ede29b16bbc57d89f9d342c3f19) Thanks [@atom63](https://github.com/atom63)! - `MediaLightbox` pages like a native photo viewer. The `MediaLightbox` props API is unchanged;
  `useMediaLightbox` gains an optional `getOrigin`.
  
  - Page turns slide instead of crossfading. Once a drag locks horizontal, the photo follows the
    pointer 1:1, and its neighbours sit beside it with a gap (`--a63-media-lightbox-gap`, default
    `--a63-space-4`). On release it pages by distance or velocity and settles on a spring. Past the
    first and last item the drag meets rubber-band resistance. A flick that reverses before release
    springs back, and a press during a settle catches the photo. Arrow keys, the previous and next
    buttons and an adjacent thumbnail animate the same track; a jump of more than one item cuts. A
    two-finger trackpad swipe follows the fingers too and turns at most one page per gesture.
    Right-to-left galleries mirror, and `prefers-reduced-motion` lands every turn instantly.
  - On touch, a single tap on the photo or around it shows or hides the controls instead of
    closing the viewer. A double-tap still zooms and does not toggle. Chrome hidden by a tap stays
    hidden until the next tap; keyboard focus entering the chrome shows it. With a mouse, a click
    outside the photo still closes, and the chrome still hides after idling.
  - Below the `sm` breakpoint the photo has square corners on the black `--a63-media-stage`
    backdrop, and the caption and counter use the on-media foreground.
  - `Lightbox.Slides` now renders a `data-slot="media-lightbox-strip"` element inside the track,
    and the track sets `touch-action: none`. Slides no longer carry an inline `opacity`.
  - Closing into a thumbnail no longer flickers when the gallery was paged past it. Right before the
    closing morph measures, the lightbox scrolls the return thumbnail into view instantly (the
    overlay still covers the page), and it counts a thumbnail cut off by a scrolling ancestor as not
    visible, so a still-clipped one cross-fades instead of morphing into a hidden box.
  - `useMediaLightbox(count, { getOrigin })` takes the thumbnail for an item. With it, each page turn
    scrolls that thumbnail into view behind the lightbox, so a row of tiles follows the gallery, and
    `close()` without an argument morphs back into the thumbnail of the item on screen.
  - Closing after a page turn morphs the photo on screen. The morph used to run on the slide the
    gallery opened on, so the visible photo stayed full size and vanished with the overlay. Closing
    also no longer restarts the opening zoom when it is handed a new origin, which drew the photo
    full size for a frame just before the overlay left.
- Updated dependencies [[`b9170fd`](https://github.com/atom63/atom63-design-system/commit/b9170fd68cc540f22166cdd973f016778d86d5e6), [`5047bc7`](https://github.com/atom63/atom63-design-system/commit/5047bc7b069223eb1949cbe4ce323bd7275a85cc), [`6c2845b`](https://github.com/atom63/atom63-design-system/commit/6c2845b4d4faeee76c0a08c10e289d6c7518c337), [`8087c69`](https://github.com/atom63/atom63-design-system/commit/8087c69bcce189266b1c90221987e654bab72f21), [`51070ad`](https://github.com/atom63/atom63-design-system/commit/51070ad6fdff5cd0666ff960b652dbee3c04a411), [`31fbb11`](https://github.com/atom63/atom63-design-system/commit/31fbb1165725b5b02abb2fefdd425882fdd6feaf), [`3d8dde4`](https://github.com/atom63/atom63-design-system/commit/3d8dde4f4ff22f529e4df60869df05bef74b8287), [`7ab659e`](https://github.com/atom63/atom63-design-system/commit/7ab659e77f34a4fe6195ef91a4102a1784931d5c), [`a0c90bd`](https://github.com/atom63/atom63-design-system/commit/a0c90bddfc4901472bea054c45f29ae8a0626c51)]:
  - @atom63/styles@0.1.0-beta.7
  - @atom63/ui-foundation@0.1.1-beta.4

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

- [#83](https://github.com/atom63/atom63-design-system/pull/83) [`ad62b14`](https://github.com/atom63/atom63-design-system/commit/ad62b1480089c5b92f984313c1045586e2dba7e3) Thanks [@atom63](https://github.com/atom63)! - Close APG pattern gaps in Dialog and Accordion:
  
  - `Dialog` is now a wrapper around Base UI's `Dialog.Root` (same props) that passes `modal` to
    `DialogPopup`, which sets `aria-modal="true"` unless `modal={false}`.
  - `Accordion` keeps collapsed panels mounted and hidden by default (`keepMounted` now defaults to
    `true`), and every `AccordionTrigger` has `aria-controls` referring to its panel, expanded or
    not. With `keepMounted={false}` on the root or an `AccordionContent`, a collapsed header has no
    `aria-controls`, as before.

- [#68](https://github.com/atom63/atom63-design-system/pull/68) [`db5fadc`](https://github.com/atom63/atom63-design-system/commit/db5fadc3d5326f22a063fb2ea2dbaf78acc9e25c) Thanks [@atom63](https://github.com/atom63)! - Document the Card structure. `CardHeader` is a single row for a `CardLabel` and a `CardAction`, while `CardTitle` and `CardDescription` go inside `CardContent`. This differs from shadcn, where the title sits in `CardHeader`.

- [#47](https://github.com/atom63/atom63-design-system/pull/47) [`11555a8`](https://github.com/atom63/atom63-design-system/commit/11555a8d79f53ed5bcdbf4dc6476eecdc85dddac) Thanks [@atom63](https://github.com/atom63)! - Fix five text-contrast issues that the Storybook axe checks started reporting once the surface mixes moved to oklab. The colors involved are unchanged on the default surfaces, so these issues predate that change; the checks did not report them before. `@atom63/styles` adds `--a63-text-danger` (danger 600 in light mode, 400 in dark mode) for danger text; `--a63-action-danger` stays the fill of danger buttons. In `@atom63/ui-react`, field and form errors and destructive menu items use `--a63-text-danger`, so they reach 4.5:1 on dark surfaces (they were about 2.7:1). A highlighted item in a primary-tone menu shows its shortcut in the highlight foreground. Sidebar and nav-tree group labels use `--a63-text-secondary` instead of a translucent foreground, which fell below 4.5:1 in the terminal theme. A selected row in a framed table fills its cells with the selection color; its white text previously sat on the page surface.

- [#85](https://github.com/atom63/atom63-design-system/pull/85) [`cc43c53`](https://github.com/atom63/atom63-design-system/commit/cc43c539453f0d8d60209d0e99c5bcc3b1edcf1a) Thanks [@atom63](https://github.com/atom63)! - Every keyboard focus ring is now an `outline`, so a component's own box-shadow can no longer hide
  it and forced-colors mode shows it.
  
  - Checkbox, Radio, Select, Input, InputGroup, Textarea, InputOTP, Autocomplete, Accordion, Slider,
    Badge, Breadcrumb, Calendar, CardLink, Carousel, Dialog close button, Item, Menubar,
    NavigationMenu, Resizable, ScrollArea, SegmentedControl, Sidebar and SidebarNavTree draw their
    ring as an outline. Elevation and inset-border shadows stay on while the element has focus, so a
    checked Checkbox, an open Accordion trigger or a Slider thumb keep their shadow.
  - Menubar, NavigationMenu and SegmentedControl draw the ring inside the item, because their lists
    scroll and clipped an outer ring. On the accent SegmentedControl the active item's ring takes the
    label colour.
  - Invalid Input, Textarea and InputOTP fields keep their danger-tinted ring.
  - The Slider thumb keeps its ring while dragged, now as an outline.
  - MediaLightbox buttons and thumbnails and the appearance VisualChoiceControl use Tailwind outline
    utilities instead of `ring-*`.
  - Rings appear at once. Recipes whose only animated shadow was the ring no longer transition
    `box-shadow`.
  - `@atom63/mdx`: MermaidDiagram draws its ring inside the stage, which its scroll container used to
    clip, and PageTableOfContents links use an outline ring, inset in the compact list.

- [#84](https://github.com/atom63/atom63-design-system/pull/84) [`8f58388`](https://github.com/atom63/atom63-design-system/commit/8f583887296639967fe0f7c183d96e496f4e6ac0) Thanks [@atom63](https://github.com/atom63)! - Keyboard focus rings are visible again where a component's own box-shadow used to replace them.
  
  - `Button` draws its focus ring as an `outline` instead of an extra box-shadow layer, so recipes
    that set a Button's shadow no longer drop the ring. This fixes `ButtonGroup` members,
    `ScrollableList` scroll buttons, `ConnectedPanel` triggers and `CopyButton`. Forced-colors mode
    now shows the ring too.
  - `ButtonGroup` members draw the ring inside their own edge, since a horizontal group scrolls and
    would clip an outer ring; on filled variants (primary, destructive, …) the ring takes the label
    colour. `ConnectedPanel` triggers also draw it inside.
  - `ToggleGroup` items, pressed ones included, keep the standalone `Toggle` outline, and the focused
    item sits above its neighbours.
  - `Tabs`: tabs draw the ring as an inset outline, so the active `attached` tab keeps it; on that
    tab it takes the label colour. Tab panels, which are tab stops, now show a ring.
  - `CommandInput`: the search row rings while the input has keyboard focus.
  - `@atom63/mdx`: `DocExample` tabs keep their ring when active, and `ImageCompare` rings the stage
    and the handle while the slider has keyboard focus.

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
- Updated dependencies [[`657033f`](https://github.com/atom63/atom63-design-system/commit/657033fbb6460378e319e860a4391cf1053aca04), [`bbd4c87`](https://github.com/atom63/atom63-design-system/commit/bbd4c877ff39d9a58746997cc4b5b2b3a9c928ba), [`ad62b14`](https://github.com/atom63/atom63-design-system/commit/ad62b1480089c5b92f984313c1045586e2dba7e3), [`be6077c`](https://github.com/atom63/atom63-design-system/commit/be6077c79fc1d3126427f9e44dc8f9446a06bbcd), [`0a538ef`](https://github.com/atom63/atom63-design-system/commit/0a538ef579c3841dcfae600403ce98f47053bd52), [`a76b878`](https://github.com/atom63/atom63-design-system/commit/a76b878ea50c2ebbe75f4e4261cab42a89e22077), [`a76b878`](https://github.com/atom63/atom63-design-system/commit/a76b878ea50c2ebbe75f4e4261cab42a89e22077), [`a76b878`](https://github.com/atom63/atom63-design-system/commit/a76b878ea50c2ebbe75f4e4261cab42a89e22077), [`11555a8`](https://github.com/atom63/atom63-design-system/commit/11555a8d79f53ed5bcdbf4dc6476eecdc85dddac), [`948aa37`](https://github.com/atom63/atom63-design-system/commit/948aa3772be67e1a27c8e007c7e014d32a17d0ca), [`78af86a`](https://github.com/atom63/atom63-design-system/commit/78af86a8af0f89a11b536109f4a0ef6e319478db), [`0b83864`](https://github.com/atom63/atom63-design-system/commit/0b8386419fb36738ea80a142b38ba523fb281983), [`ffc8394`](https://github.com/atom63/atom63-design-system/commit/ffc8394d5f1e4cb9f5eb7ab922c3c7b5b125f9c3), [`85c29a5`](https://github.com/atom63/atom63-design-system/commit/85c29a53491c3c96ca3076e0964d138d5ec9ff75), [`f321b96`](https://github.com/atom63/atom63-design-system/commit/f321b961a259bcbfe422f07387ca72856f6f912d), [`2cd2cb1`](https://github.com/atom63/atom63-design-system/commit/2cd2cb17474284abf5b58c47e864f4127190677d), [`3de1dce`](https://github.com/atom63/atom63-design-system/commit/3de1dcee52dc86436a0530d6849727705bc48945), [`11555a8`](https://github.com/atom63/atom63-design-system/commit/11555a8d79f53ed5bcdbf4dc6476eecdc85dddac), [`614e4a5`](https://github.com/atom63/atom63-design-system/commit/614e4a5a1b02d0422aaf53920d6a6f840042b217), [`9109b20`](https://github.com/atom63/atom63-design-system/commit/9109b2076a71764d3869c3932ad9fdc0d676dd5b), [`f89eda9`](https://github.com/atom63/atom63-design-system/commit/f89eda9abc960caf880b57b1e41f73a7b4e8dd68), [`b8a42d8`](https://github.com/atom63/atom63-design-system/commit/b8a42d86c445889f24ca80ca63e2c8433b9ae778), [`2f46468`](https://github.com/atom63/atom63-design-system/commit/2f46468f5a4b1b223f6a4235f15a47e2a0f393f4), [`38430d0`](https://github.com/atom63/atom63-design-system/commit/38430d06d2a691a43beb177906d2c8270e14b84c), [`b784cf5`](https://github.com/atom63/atom63-design-system/commit/b784cf5413e82a0343162ef1824ed73e9c19850d)]:
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
