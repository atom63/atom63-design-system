# @atom63/ui-foundation

## 0.2.0-beta.11

### Patch Changes

- [#360](https://github.com/atom63/atom63-design-system/pull/360) [`51c78c9`](https://github.com/atom63/atom63-design-system/commit/51c78c929aa9ad9f6fef4b15206b906508d43a18) Thanks [@atom63](https://github.com/atom63)! - Add a card variant to DestinationLink for card titles and linked cards. It removes the underline and keeps link semantics, destination indicators, and keyboard focus. Inline links retain their default underline.

## 0.2.0-beta.10

### Minor Changes

- [#351](https://github.com/atom63/atom63-design-system/pull/351) [`d53bffe`](https://github.com/atom63/atom63-design-system/commit/d53bffe8acab6e68a6687230b7c9f362c9145023) Thanks [@atom63](https://github.com/atom63)! - Form controls:
  
  - `Field` takes `invalid` and `disabled` props, and a rendered `FieldError` now sets `data-invalid` on the field, so the label tints without `data-invalid="true"`. Input and Textarea draw their danger edge when their field is `aria-invalid`.
  - `FormControl` no longer overwrites the wrapped control's `data-slot` (it adds `data-form-control`) and sets `aria-invalid` only on error; `form-control` leaves the Form contract's slots. `FormMessage` is `role="alert"` only while it shows an error, without `aria-live`.
  - `Textarea` takes `maxRows` (default 12); past it, the field scrolls instead of growing.
  - On a coarse pointer, Input and the Select trigger take a 44px tap through a hit strip, and Select options grow to the 44px row height.
  - Select options wrap instead of truncating, and the popup grows up to 20rem.
  - `SelectTrigger` opens the list on Home and End, at the first or last option; in `SelectPopup`, Tab and Alt + Up Arrow select the focused option. The four gaps leave the Select contract's `knownGaps`.
  - The CLI answers for Field, Form, Select and Textarea are written guides.

- [#357](https://github.com/atom63/atom63-design-system/pull/357) [`27dff37`](https://github.com/atom63/atom63-design-system/commit/27dff3757204017cf40ce68e3b1a314ca7baab81) Thanks [@atom63](https://github.com/atom63)! - Form controls, round 7:
  
  - `Textarea` takes `variant` (`default`, `filled`, `plain`), the same field chrome as `Input`; the textarea contract lists the variants.
  - `SegmentedControl` scrolls the selected segment fully into view in a scrolling track, on mount and when the selection changes, and a pressed segment's content dips.
  - `FieldLabel`, `FieldLegend`, `FieldDescription`, `FieldError`, `FormDescription` and `FormMessage` wrap long words and unbroken URLs instead of widening the form.
  - Terminal light `--a63-text-tertiary` is lighter (90% of the action colour instead of 80%), so a placeholder reads clearly below the value while keeping 4.5:1.

- [#359](https://github.com/atom63/atom63-design-system/pull/359) [`9b9f44f`](https://github.com/atom63/atom63-design-system/commit/9b9f44f6861b0958e7c61c3871ddea0140cd8038) Thanks [@atom63](https://github.com/atom63)! - Sheet takes `side="inline-start"` and `side="inline-end"`, which follow the text direction; `left` and `right` stay physical edges. The Sheet contract lists the `focus-visible` state. The Toaster's keyboard focus outline now draws on the toast and its action (it lost to Sonner's `outline: none`), and the default toast reads the overlay contract (border, gloss, texture, backdrop, shadow and radius) per theme. `DialogPanel`'s `scrollFade` now fades the panel's edge while it scrolls, in browsers with scroll-driven animations. A menu shortcut keeps its own direction, so `⌘C` stays `⌘C` in a right-to-left menu.

### Patch Changes

- [#353](https://github.com/atom63/atom63-design-system/pull/353) [`a4f01d4`](https://github.com/atom63/atom63-design-system/commit/a4f01d4bd008a72f702d4307c1545590df932c0a) Thanks [@atom63](https://github.com/atom63)! - Data and feedback components get their missing states. Pagination draws a disabled Previous or Next faded, mirrors its chevrons under `dir="rtl"`, takes `children` to replace the Previous, Next and More pages text, and its contract `linkSizes` narrows to `xs`, `sm`, `md`, `icon-xs`, `icon-sm` and `icon`. Table rows take `selected`, cells and heads take `wrap`, head and cell padding follow the density scale, and an overflowing table scroller becomes a named, focusable region. Chart gains `layout` (`grouped` or `stacked`, in the contract; `stacked` is deprecated), an empty message (`labels.empty`), tap-to-read on touch, real values below zero in the tooltip and table with a console warning, index keys, a short plot name (`labels.plot`), and whole-number ticks when every value is zero. ItemGroup is a list and its Items are list items (a link or button row is wrapped in one); interactive rows floor at `--a63-row-min-size`, have a disabled look, clamp their title and description, keep long strings inside the row, and mark selection in forced colors. Interactive Cards draw a focus-visible ring and lift, gate the hover lift and media zoom to fine pointers, read type-scale font sizes, and the cursor label uses on-media tokens. FeedbackState forwards native attributes and `ref`, takes `labels.noResults`, mounts a fresh alert for an error, wraps long titles, and its contract states are its kinds (the `idle` alias is gone). EmptyErrorDetail takes `labels` and mirrors in RTL. Skeleton keeps an edge in forced colors and sweeps toward the inline end. ChatComposer adds `submitOnEnter` (off on touchscreens) and `enterKeyHint`. The user ChatMessage bubble keeps an edge in forced colors. The shadcn bridge defines `--a63-row-min-size` and `--a63-action-disabled-opacity`.

- [#352](https://github.com/atom63/atom63-design-system/pull/352) [`fdbe267`](https://github.com/atom63/atom63-design-system/commit/fdbe2670698a40448943822a5adc27eb8ee16e2f) Thanks [@atom63](https://github.com/atom63)! - Menu rows (DropdownMenu, ContextMenu, Menubar, Select and Autocomplete) are at least 44px tall on touch, cap the popup at the available width and wrap long labels, and the submenu chevron mirrors in right-to-left. `DropdownMenuContent` and `DropdownMenuSubContent` honour `portalProps.container`. `PopoverAnchor` now positions the popup, `PopoverContent` takes `anchor`, `alignOffset` and `collisionPadding`, `PopoverPortal` falls back to `PortalContainerProvider`, and the popup scrolls and wraps long strings. The Dialog close button has a 44px touch target and a pressed state, and the Sheet header leaves room for its close button. Toaster stamps the `toast`, `toast-icon` and `toast-message` slots, takes its direction from the portal region, adds the safe-area insets to its offsets, draws an outline focus ring, gives its close and action buttons the touch floor, and mounts after hydration. The dropdown-menu and toaster contracts document `inset` and the tone functions.

- [#358](https://github.com/atom63/atom63-design-system/pull/358) [`759fd86`](https://github.com/atom63/atom63-design-system/commit/759fd866fb7d87375716f192d80bb090cb873bf2) Thanks [@atom63](https://github.com/atom63)! - Table, Pagination, Card and Chart reach readiness. The Table and Pagination scrollers pad their edges and take the padding back with a negative margin, so the 44px touch targets and focus rings of controls at the edge are no longer clipped. TableHead and TableCell take `align="end"`, which ends the column in tabular figures (the contract adds `aligns`); a selected row keeps the system selection colours in forced colors; an overflowing table without a caption or label stays focusable but no longer gets the English region name "Table". Previous and Next given `children` are named by them instead of an English `aria-label`, and their labels are visually hidden, not removed, on narrow screens. `CardMediaOverlayIconButton` is now a round overlay `Button` (it was a `span`), so it has a name, keyboard access and a touch target; `CardMediaOverlayTopEnd` is added and `CardMediaOverlayTopRight` is deprecated; interactive and overlay cards have a pressed state (`:active` or `data-pressed`). Chart removes the deprecated `stacked` boolean (use `layout="stacked"`), cuts long category labels with an ellipsis, and its contract lists the `chart-empty` slot and the `empty` state.

- [#354](https://github.com/atom63/atom63-design-system/pull/354) [`d00c3cf`](https://github.com/atom63/atom63-design-system/commit/d00c3cfaf7b33744c94e2cc7c64b32612ba98299) Thanks [@atom63](https://github.com/atom63)! - FeedbackState: `labels.titles` and `labels.descriptions` replace every built-in title and description per kind. With `state="error"` and an `Error`, the friendly description stays and `error.message` shows in a new `feedback-state-detail` line under it. The loading description no longer repeats its title. Empty: `EmptyTitle` takes a `level` prop, and long titles and descriptions wrap inside the box.

- [#350](https://github.com/atom63/atom63-design-system/pull/350) [`aea925d`](https://github.com/atom63/atom63-design-system/commit/aea925d372feb22601767fbbf2ba8218046cd463) Thanks [@atom63](https://github.com/atom63)! - Sidebar's `side` is now logical: `left` is the inline start, so under `dir="rtl"` the desktop panel and its border sit on the right and the phone sheet opens from the right. The desktop panel pads its outer edge by the safe-area inset and reserves that width beside the content. Add `mobileTitle` and `mobileDescription` to `Sidebar` and `label` to `SidebarTrigger` for the built-in accessible names, and export `SidebarTriggerProps`.

## 0.2.0-beta.9

### Minor Changes

- [#336](https://github.com/atom63/atom63-design-system/pull/336) [`8576bae`](https://github.com/atom63/atom63-design-system/commit/8576bae9a0066d7a4db91addf639327bad4129de) Thanks [@atom63](https://github.com/atom63)! - Add Chart on its own entry, `import { Chart } from '@atom63/ui-react/chart'`: a small SVG line, area or bar chart (grouped or stacked) of up to five series over a categorical axis. It draws gridlines and axis labels from tokens, follows the container's width, shows a tooltip on hover and on the arrow keys, has a legend, mirrors in right-to-left text, keeps series apart by dash pattern in forced colours, and carries a data table of the same numbers that is visually hidden or shown with a toggle. It uses no charting library. The contract adds `chartTypes`, `chartSizes`, `chartColors`, `chartStates` and `chartSlots`.

- [#335](https://github.com/atom63/atom63-design-system/pull/335) [`567dbbf`](https://github.com/atom63/atom63-design-system/commit/567dbbf9a706f3bddfb839600eac069e30ec5baa) Thanks [@atom63](https://github.com/atom63)! - Add sortable table heads: `Table` takes a controlled `sort` and `onSortChange`, and a `TableHead` with a `sortKey` renders a sort button with a direction icon (replaceable through `sortIcon`) and carries `aria-sort` while its column is sorted. `PaginationLink`, `PaginationPrevious` and `PaginationNext` take `render` (such as a router link) and `disabled`, which drops the href and click handler, leaves the tab order and sets `aria-disabled`. Pagination's default name is now "Pagination". Autocomplete's clear button sits beside the trigger instead of on top of it. `FeedbackState` renders its title as a real `h1`–`h6`. `FormControl` lists the description id in `aria-describedby` only while a `FormDescription` renders. The table contract adds the `table-sort-button` slot and the `sort-ascending` and `sort-descending` states; the pagination contract adds the `disabled` state.

## 0.2.0-beta.8

### Minor Changes

- [#322](https://github.com/atom63/atom63-design-system/pull/322) [`2720544`](https://github.com/atom63/atom63-design-system/commit/2720544eec4f8bf4701366ccff064f015815e987) Thanks [@atom63](https://github.com/atom63)! - Add ArtPlate, a full-bleed picture that owns its crop and keeps a safe area for headline and product UI: art-directed phone source, focal point per breakpoint, `size` (viewport, band, card), `safeArea`, `tone`, `veil`, eager loading with `priority`, and a CSS scroll-driven `parallax` that is off under reduced motion. `Image` from `@atom63/ui-react/media` takes `srcSet`, `sizes` and art-directed `sources`, which render a native `<picture>` with native lazy loading, and `aspectRatio="fill"` for a box sized by its parent.

- [#325](https://github.com/atom63/atom63-design-system/pull/325) [`dc9e86d`](https://github.com/atom63/atom63-design-system/commit/dc9e86d5a8ffd8aeec63c082589e8c02334a6994) Thanks [@atom63](https://github.com/atom63)! - Add LayeredScene: a plate (`LayeredScenePlate`, an ArtPlate), the copy (`LayeredSceneContent`) and live product UI (`LayeredSceneStage`) in a two-row grid, with an optional inert foreground cut-out of the plate in front (`LayeredSceneForeground`, aria-hidden, no pointer events, hidden on phones unless `showOnPhone`). `placement` (center-bottom, end-bottom, start-bottom) and `width` (wide, half) place the stage. Layers use the in-context z band.

### Patch Changes

- [#314](https://github.com/atom63/atom63-design-system/pull/314) [`d88a387`](https://github.com/atom63/atom63-design-system/commit/d88a3870ffc2e14613dd0a4c48dd89e3c7958abd) Thanks [@atom63](https://github.com/atom63)! - SegmentedControl is a radio group instead of a tab list: the root has `role="radiogroup"` and takes `aria-label` or `aria-labelledby`, each segment is a `radio`, Tab enters at the selected segment and the arrow keys move and select. The selected segment carries `data-checked` (it was `data-active`), and the indicator is placed by `--segment-indicator-*` (it was Base UI's `--active-tab-*`). `SegmentedControlProps` now extends Base UI's RadioGroup props instead of the Tabs root props. The look is unchanged. Use Tabs when the choices switch content panels.
  
  Rating draws on stars filled in `--a63-status-warning` and off stars as outlines in `--a63-border-input`, so the two differ by shape as well as colour and both reach 3:1 against the page and the panel in every theme and mode.

- [#310](https://github.com/atom63/atom63-design-system/pull/310) [`4b4c105`](https://github.com/atom63/atom63-design-system/commit/4b4c105e0b96f8040da19b067e6222142845be7d) Thanks [@atom63](https://github.com/atom63)! - Button's contract slots are now the `data-slot` values the React Button renders: `button`, `button-label`, `button-spinner` and `button-indicator` (they were `root`, `label`, `icon`, `spinner` and `indicator`; no `icon` slot is rendered). Search Field's input slot is `input` (it was `search-field-input`). `buttonSlots`, `searchFieldSlots` and their `ButtonSlot` and `SearchFieldSlot` types change with them, and `atom63 component button` lists the new names. Rendered `data-slot` values are unchanged.

## 0.2.0-beta.7

### Minor Changes

- [#307](https://github.com/atom63/atom63-design-system/pull/307) [`099d1eb`](https://github.com/atom63/atom63-design-system/commit/099d1eba7a4db553969c367618d2e6f402d57a32) Thanks [@atom63](https://github.com/atom63)! - Contracts now use one name per concept. The middle size is `md` on Alert Dialog, Autocomplete, Avatar, Button Group, Dialog, Item, Table and Tabs (it was `default`), so `size="md"` type-checks on every sized component. Alert Dialog's danger variant is `error` (it was `destructive`), as on Alert and the toast. State lists use `rest`, `focus-visible`, `hover` and `current` (Badge `resting`, Breadcrumb, Item, Toggle and Toggle Group `focus`, Feedback State, Resizable, Scroll Area and Scrollable List `idle`, Form and Frame `default`, Input OTP, Navigation Menu and Sidebar Nav Tree `active`, Scroll Area `hovering`, and Accordion and Button `focusVisible`).
  
  Props keep working: each component still accepts the old size or variant and draws it as the new one (`size="default"` renders `data-size="md"`, `variant="destructive"` renders `data-variant="error"`). The state lists are not props, but their union types (such as `ButtonState`) drop the old names. A recipe override that targets `[data-size='default']` or the Alert Dialog popup's `[data-variant='destructive']` must move to the new value. `@atom63/ui-foundation` exports each old name in a `<component><List>Aliases` map and a `@deprecated` `<Type>Alias` type (for example `tabsSizeAliases` and `TabsSizeAlias`); the React props accept `TabsSize | TabsSizeAlias`. The aliases go in the next breaking release. Button's and Badge's `intent.stateAliases` entries moved to these maps.
  
  Every cross-renderer component with web axes now has an `intent` block that maps each axis to its SwiftUI enum, or says that iOS has no such axis. The CLI and the docs list the deprecated aliases with the contract.
  
  `reactRendererConformance` is now read from the cross-renderer contracts instead of a copied table, which takes about 2.7 kB gzip off `@atom63/ui-react`. Its type is `readonly ReactRendererConformanceEvidence[]`, and `ReactVerifiedContractId` is `CrossRendererContractId`. The values are unchanged.

### Patch Changes

- [#313](https://github.com/atom63/atom63-design-system/pull/313) [`0d9b571`](https://github.com/atom63/atom63-design-system/commit/0d9b5713c2f6b794b3aff9e1dd997da410c26c3e) Thanks [@atom63](https://github.com/atom63)! - The root entries of `@atom63/ui-react` and `@atom63/ui-foundation` now tree-shake. Each module the root re-exports is built as its own file, and the root is a list of re-exports over them, so a bundler drops the components an app does not import. One import from `@atom63/ui-react` now costs a consumer bundle 8.6 kB gzip for `Kbd` (was 35.6 kB), 11.1 kB for `Button` (was 37.8 kB), 10.6 kB for `Separator` (was 107.2 kB) and 22.2 kB for `Dialog` (was 107.1 kB). `toast` is re-exported through the toaster module, so sonner is loaded only by apps that use the toaster or `toast`. The public exports and types are unchanged.

## 0.2.0-beta.6

### Minor Changes

- [#298](https://github.com/atom63/atom63-design-system/pull/298) [`7ab4fc9`](https://github.com/atom63/atom63-design-system/commit/7ab4fc97d5ce63f3f3c7237e4db61a3dc6954582) Thanks [@atom63](https://github.com/atom63)! - Add the Progressive Blur contract (`progressiveBlurContract`, `progressiveBlurPositions`, `ProgressiveBlurPosition`), marked preview; `ProgressiveBlur` takes its defaults and position type from it. Map the iOS axes of Alert, Avatar, Button shape, Card, Carousel dots, Input, Item group surface, Message, Progress, Toaster and Toggle Group onto the contract intent; the contract check fails when a mapped Swift enum drifts. The catalog and the agent index now fail on a component without a contract maturity instead of calling it stable.

### Patch Changes

- [#295](https://github.com/atom63/atom63-design-system/pull/295) [`524fd93`](https://github.com/atom63/atom63-design-system/commit/524fd93260a5405a3becfe9e8ceb9e35d6bf6754) Thanks [@atom63](https://github.com/atom63)! - `SelectTrigger` and `AutocompleteInput` take an `invalid` prop and draw the same danger edge as `Input` when it or `aria-invalid` is set; the Autocomplete input gains a hover border. The Select contract lists an `invalid` state and the Autocomplete contract lists `hover` and `invalid`. The default `Toaster` now reads `--a63-surface-overlay`, `--a63-border-subtle`, `--a63-text-primary` and `--radius-lg` instead of the shadcn compat variables, so its toast has a fill with only `@atom63/ui-react/styles.css` installed.
  
  `SelectSeparator` and `AutocompleteSeparator` render with `role="none"`, so a separator between groups inside the open listbox no longer fails axe `aria-required-children`.

## 0.2.0-beta.5

### Minor Changes

- [#235](https://github.com/atom63/atom63-design-system/pull/235) [`b1ec823`](https://github.com/atom63/atom63-design-system/commit/b1ec82312e90d848d8e7629ef05536a48a8efad9) Thanks [@atom63](https://github.com/atom63)! - Add Amount, the web counterpart of iOS `AtomAmountText`: a money amount in the display text role (`size="md"`, 40px) or display-large (`size="lg"`, 56px), formatted for the locale with `Intl.NumberFormat`, with the fraction at half size and raised, tabular figures, and one accessible label.

- [#258](https://github.com/atom63/atom63-design-system/pull/258) [`88bf796`](https://github.com/atom63/atom63-design-system/commit/88bf79612ed208ee8b1161334c17c2a1c0b95cb2) Thanks [@atom63](https://github.com/atom63)! - Add AppView to `@atom63/ui-react/layout`: the full-window frame of a product view, for a window or a phone screen. Only the main region scrolls, each safe-area inset has one owner, `chrome="flush"` runs a window's columns to its edges, and `overlay` floats content over the main region. Its contract (layouts, chromes, slots) ships from `@atom63/ui-foundation`.

- [#231](https://github.com/atom63/atom63-design-system/pull/231) [`9bc6357`](https://github.com/atom63/atom63-design-system/commit/9bc6357002be5f7305d6688ab64862f321e7ff04) Thanks [@atom63](https://github.com/atom63)! - Add ChatComposer. ChatComposer is the message field of an assistant chat: a growing textarea with an attach slot and a send button that turns into stop while a reply streams.

- [#231](https://github.com/atom63/atom63-design-system/pull/231) [`9bc6357`](https://github.com/atom63/atom63-design-system/commit/9bc6357002be5f7305d6688ab64862f321e7ff04) Thanks [@atom63](https://github.com/atom63)! - Add ChatMessage and ChatMessageList (a log region for the transcript). ChatMessage shows one turn of a conversation: the user's message in a tinted bubble on the trailing side, the assistant's as plain text or a bubble. The `from` prop takes the conversation role.

- [#231](https://github.com/atom63/atom63-design-system/pull/231) [`9bc6357`](https://github.com/atom63/atom63-design-system/commit/9bc6357002be5f7305d6688ab64862f321e7ff04) Thanks [@atom63](https://github.com/atom63)! - Add ChatSteps and ChatStep. ChatSteps lists the tool calls and thinking steps behind an assistant reply in a collapsible group, each with a status icon.

- [#231](https://github.com/atom63/atom63-design-system/pull/231) [`9bc6357`](https://github.com/atom63/atom63-design-system/commit/9bc6357002be5f7305d6688ab64862f321e7ff04) Thanks [@atom63](https://github.com/atom63)! - Add ChatTypingIndicator. ChatTypingIndicator shows three pulsing dots while an assistant is preparing its reply, and announces it politely.

- [#273](https://github.com/atom63/atom63-design-system/pull/273) [`08e15ab`](https://github.com/atom63/atom63-design-system/commit/08e15abdd2588bb13260b494611e3bc0d030d31d) Thanks [@atom63](https://github.com/atom63)! - Add Message, MessageList and MessageEvent for person-to-person threads, separate from ChatMessage (an AI assistant's turn): a directional bubble (`direction` incoming or outgoing), joined runs of consecutive messages (`position` single, first, middle, last) with the tail on the last, a meta row with the time and a named delivery status (`status` sending, sent, delivered, read, failed), and media above the text. MessageEvent is a centred row for calls, dates and joins. Avatar `ring` also takes `unseen` (the same as `true`) and `seen`, and the unseen ring reads `--a63-avatar-ring-fill`, so a product can draw a story ring as a gradient of the category palette.

- [#212](https://github.com/atom63/atom63-design-system/pull/212) [`1881a52`](https://github.com/atom63/atom63-design-system/commit/1881a52447cacc0f135d7a6c53bf4bf88489b7d2) Thanks [@atom63](https://github.com/atom63)! - Add Rating: a score out of `max` stars (5 by default). Without `onValueChange` it is read-only, one image named "4.5 out of 5" with half stars; with `onValueChange` it is a radio group with one radio per star. `icon` replaces the star.

- [#236](https://github.com/atom63/atom63-design-system/pull/236) [`1d1a536`](https://github.com/atom63/atom63-design-system/commit/1d1a536af297623afee814a0bcff1483f67e6f65) Thanks [@atom63](https://github.com/atom63)! - Amount takes `fraction="raised" | "baseline"` (default `raised`): `baseline` keeps the half-size fraction on the baseline of the integer digits. The amount contract lists the values as `amountFractions`, and `@atom63/styles/tailwind` adds the `amount-fraction-baseline` utility. On iOS, `AtomAmountText` takes `fraction: .raised | .baseline` (`AtomAmountFraction`).

- [#271](https://github.com/atom63/atom63-design-system/pull/271) [`03a3cc6`](https://github.com/atom63/atom63-design-system/commit/03a3cc6bc1e8eb0e4fb7fbb889b7aa989b737ecc) Thanks [@atom63](https://github.com/atom63)! - AppView takes a `rail` before the side panel, an `aside` after the main region (from `lg` up), and `topBarSpan="main"` to start the top bar after the rail and panel. The app-view contract adds the `topBarSpans` axis and the `app-view-rail`, `app-view-content` and `app-view-aside` slots.

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

- [#270](https://github.com/atom63/atom63-design-system/pull/270) [`0f850f7`](https://github.com/atom63/atom63-design-system/commit/0f850f72ab621b62fd9d7bff2dce77ccfe9de37c) Thanks [@atom63](https://github.com/atom63)! - The app-view contract now says when iOS uses the native navigation bar and when it uses `AtomAppBar` for the top-bar slot.

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
