# @atom63/mdx

## 0.4.0-beta.4

### Minor Changes

- [#304](https://github.com/atom63/atom63-design-system/pull/304) [`2c9247b`](https://github.com/atom63/atom63-design-system/commit/2c9247b6a597171efd84e0eecfd1fc61ab4b09e3) Thanks [@atom63](https://github.com/atom63)! - Fix feedback, status and media accessibility gaps from the readiness review:
  
  - `Alert`'s info, success and warning action labels use their status `-subtle-foreground` text step, so they reach 4.5:1 on the tinted fill in every theme and mode. The live region follows the tone: error and warning render `role="alert"` (assertive); default, info and success render `role="status"` (polite). Pass `role` to override.
  - `EmptyErrorDetail`'s "Show details" toggle is a muted ghost Button, so its label rests in the secondary text colour (4.5:1) instead of a 60% mix of it.
  - `FeedbackState` keeps one live region mounted in every state: polite (`role="status"`) for loading and the result states, assertive (`role="alert"`) for an error. It is no longer `aria-busy` while loading, which silenced it. Its title is a heading, level 3 unless `level` sets another.
  - `LoadMoreTrigger`'s Retry action gets a hit area of `--a63-control-min-target` (44px on coarse pointers) around its text.
  - `@atom63/mdx` `VideoBlock` does not autoplay when the reader prefers reduced motion. An autoplaying video without `controls` gets a pause and play toggle (an overlay Button named by `pauseLabel` and `playLabel`), and a decorative video without controls is `aria-hidden` instead of labelled.
  - `@atom63/widgets` controls reach a 44 physical px hit area on coarse pointers: inside a widget, a Button's hit area grows to `--widget-interaction-target` while the control keeps its 24px proportion.

### Patch Changes

- [#288](https://github.com/atom63/atom63-design-system/pull/288) [`adc4b50`](https://github.com/atom63/atom63-design-system/commit/adc4b5086f4f3da6c651fad03471f4f6875d8071) Thanks [@atom63](https://github.com/atom63)! - Add the danger status role: `--a63-status-danger` (step 600 in light mode, 500 in dark mode) with `-foreground`, `-subtle` and `-subtle-foreground`, for error icons, borders and tints. `--a63-action-danger` stays the danger button fill. The contrast test now checks `--a63-status-danger` (3:1) and `--a63-text-danger` (4.5:1) in every theme and mode, and `compat/a63-from-shadcn.css` maps both from `--destructive`.
  
  Alert's error tone draws its icon, border and fill from `--a63-status-danger` and its action label in `--a63-text-danger`, and its action sits at the inline end, so it no longer covers the title in right-to-left layouts. In `@atom63/mdx`, KeyIdea's eyebrow and the active PageTableOfContents link use `--a63-text-accent`; Compare's negative item, StatCard's down trend, the MermaidDiagram and live-preview error text use `--a63-text-danger`; the error Callout and Compare's negative marker use `--a63-status-danger`. The CLI agent index lists the new tokens.

- [#306](https://github.com/atom63/atom63-design-system/pull/306) [`bdcee47`](https://github.com/atom63/atom63-design-system/commit/bdcee4751d28defbc59ef3f5aefad0aad4bfc89a) Thanks [@atom63](https://github.com/atom63)! - Document every `@atom63/mdx` block. A new docs page, "MDX blocks" (`atom63 docs pattern-mdx-blocks`), gives each of the 30 blocks what it is for, a working example and its props, read from the block's TypeScript types with defaults and doc comments. `atom63 api <Block>` now prints that section, so `atom63 api KeyIdea` answers with the purpose, an example and the props, not only the import line. The `@atom63/mdx` README points to the page.

- [#293](https://github.com/atom63/atom63-design-system/pull/293) [`66a0aca`](https://github.com/atom63/atom63-design-system/commit/66a0aca3394b62efe3530e34919fd31327fdf8b8) Thanks [@atom63](https://github.com/atom63)! - `VideoBlock` takes `trackLang` (default `en`) and `trackLabel` for its caption track. The default label is the language's own name ("English", "Deutsch"), replacing the fixed "English captions". Adds render and accessibility tests for `ColorSwatchItem`, `KeyIdea`, `MdxPageSkeleton`, `MediaCaption`, `MediaPlaceholder`, `PageMeta`, `ResourceList`, `VideoBlock` and `ExampleContainer`.

- [#279](https://github.com/atom63/atom63-design-system/pull/279) [`b3410a1`](https://github.com/atom63/atom63-design-system/commit/b3410a1e54be91f79db37d01758b017dc1467a65) Thanks [@dependabot](https://github.com/apps/dependabot)! - Depend on motion ^14.14.0 instead of ^13.1.1. Motion 14 has no breaking changes to its public API.

- [#305](https://github.com/atom63/atom63-design-system/pull/305) [`eef5f6f`](https://github.com/atom63/atom63-design-system/commit/eef5f6f4072ad0d64e366d9a325d8e2fde1742ba) Thanks [@atom63](https://github.com/atom63)! - The README says the stability column is the API tier of each entry while the package is still beta.
- Updated dependencies [[`5304568`](https://github.com/atom63/atom63-design-system/commit/5304568ca070b05305f865b2b8d411c8667c48b9), [`9d419a3`](https://github.com/atom63/atom63-design-system/commit/9d419a3c93fb3bd92cbecff32176b0c637ce402c), [`7ab4fc9`](https://github.com/atom63/atom63-design-system/commit/7ab4fc97d5ce63f3f3c7237e4db61a3dc6954582), [`adc4b50`](https://github.com/atom63/atom63-design-system/commit/adc4b5086f4f3da6c651fad03471f4f6875d8071), [`2c9247b`](https://github.com/atom63/atom63-design-system/commit/2c9247b6a597171efd84e0eecfd1fc61ab4b09e3), [`09a3299`](https://github.com/atom63/atom63-design-system/commit/09a3299b1e7c1ce2498e3c1ed10a6f6f4ee4e7c8), [`426b77e`](https://github.com/atom63/atom63-design-system/commit/426b77e7399bca33758193001e29c3cd498ae4f1), [`2cea63d`](https://github.com/atom63/atom63-design-system/commit/2cea63dc522d9597dfccea2f61410c6f36ece136), [`77fd109`](https://github.com/atom63/atom63-design-system/commit/77fd109bb3277687a709be96abb7a0b280525ea9), [`a4188c4`](https://github.com/atom63/atom63-design-system/commit/a4188c47cab00e73439be61c39be0c2424644176), [`b3410a1`](https://github.com/atom63/atom63-design-system/commit/b3410a1e54be91f79db37d01758b017dc1467a65), [`524fd93`](https://github.com/atom63/atom63-design-system/commit/524fd93260a5405a3becfe9e8ceb9e35d6bf6754), [`eef5f6f`](https://github.com/atom63/atom63-design-system/commit/eef5f6f4072ad0d64e366d9a325d8e2fde1742ba), [`eef5f6f`](https://github.com/atom63/atom63-design-system/commit/eef5f6f4072ad0d64e366d9a325d8e2fde1742ba), [`34d8578`](https://github.com/atom63/atom63-design-system/commit/34d85787157a079355820596ddb437dea0962d97)]:
  - @atom63/ui-react@0.2.0-beta.13
  - @atom63/styles@0.1.0-beta.9

## 0.4.0-beta.3

### Patch Changes

- [#195](https://github.com/atom63/atom63-design-system/pull/195) [`39c39c2`](https://github.com/atom63/atom63-design-system/commit/39c39c2280cf3fdfae86572b09f8d64a1923e791) Thanks [@dependabot](https://github.com/apps/dependabot)! - Raise runtime dependency floors: `@atom63/ui-react` now needs `react-day-picker` `^10.0.2` and `react-resizable-panels` `^4.14.6`, and `@atom63/mdx` needs `shiki` `^4.5.0`.
- Updated dependencies [[`b1ec823`](https://github.com/atom63/atom63-design-system/commit/b1ec82312e90d848d8e7629ef05536a48a8efad9), [`88bf796`](https://github.com/atom63/atom63-design-system/commit/88bf79612ed208ee8b1161334c17c2a1c0b95cb2), [`9bc6357`](https://github.com/atom63/atom63-design-system/commit/9bc6357002be5f7305d6688ab64862f321e7ff04), [`9bc6357`](https://github.com/atom63/atom63-design-system/commit/9bc6357002be5f7305d6688ab64862f321e7ff04), [`9bc6357`](https://github.com/atom63/atom63-design-system/commit/9bc6357002be5f7305d6688ab64862f321e7ff04), [`9bc6357`](https://github.com/atom63/atom63-design-system/commit/9bc6357002be5f7305d6688ab64862f321e7ff04), [`08e15ab`](https://github.com/atom63/atom63-design-system/commit/08e15abdd2588bb13260b494611e3bc0d030d31d), [`1881a52`](https://github.com/atom63/atom63-design-system/commit/1881a52447cacc0f135d7a6c53bf4bf88489b7d2), [`1d1a536`](https://github.com/atom63/atom63-design-system/commit/1d1a536af297623afee814a0bcff1483f67e6f65), [`105231e`](https://github.com/atom63/atom63-design-system/commit/105231e3d30eb89e3e220b548b11480282855d26), [`03a3cc6`](https://github.com/atom63/atom63-design-system/commit/03a3cc6bc1e8eb0e4fb7fbb889b7aa989b737ecc), [`9bc6357`](https://github.com/atom63/atom63-design-system/commit/9bc6357002be5f7305d6688ab64862f321e7ff04), [`60f82a5`](https://github.com/atom63/atom63-design-system/commit/60f82a530e79e693dc6343cfcca105766cfc206d), [`c625d3a`](https://github.com/atom63/atom63-design-system/commit/c625d3ac03571a863f2c325a0fd9083261dd0493), [`82e55eb`](https://github.com/atom63/atom63-design-system/commit/82e55eb7951009488ae297d613e9ca0ece904bbc), [`e5d395b`](https://github.com/atom63/atom63-design-system/commit/e5d395b48c402ad8421912f273274635cb33bfd1), [`1881a52`](https://github.com/atom63/atom63-design-system/commit/1881a52447cacc0f135d7a6c53bf4bf88489b7d2), [`b0c2c05`](https://github.com/atom63/atom63-design-system/commit/b0c2c052a58a3ba5c939bfadebdf3284b546cae9), [`292bd89`](https://github.com/atom63/atom63-design-system/commit/292bd899e32b8c62b9811567f4dc3047d41befe7), [`f3dfc11`](https://github.com/atom63/atom63-design-system/commit/f3dfc117b18676eb56d70a8f8daf14a70f5d50a5), [`57a4a41`](https://github.com/atom63/atom63-design-system/commit/57a4a4191f29ffef0eaf823d17f84f9da0e97e89), [`0819d54`](https://github.com/atom63/atom63-design-system/commit/0819d54264e2219b6cb049e854e2e5e9c5c7f791), [`c537c27`](https://github.com/atom63/atom63-design-system/commit/c537c278e6b56f6b5dea557ad8b22b1ef75a4ea2), [`32e030a`](https://github.com/atom63/atom63-design-system/commit/32e030a63a913ae631a4083d55b881ecf246080e), [`7b1bb6e`](https://github.com/atom63/atom63-design-system/commit/7b1bb6e88af05c22c58415ac39392a500e7686c5), [`b070cf4`](https://github.com/atom63/atom63-design-system/commit/b070cf4a007c8529bf6d13454e8716740c20dc5c), [`39c39c2`](https://github.com/atom63/atom63-design-system/commit/39c39c2280cf3fdfae86572b09f8d64a1923e791), [`f207dc7`](https://github.com/atom63/atom63-design-system/commit/f207dc774c67667e1e527d2f05580aa8ce4b6f4a), [`70edde7`](https://github.com/atom63/atom63-design-system/commit/70edde79b9f3bab35680c2c471b4a23d65bb0984), [`07e274e`](https://github.com/atom63/atom63-design-system/commit/07e274ee36c53520a3e23f1617e84377f1653ed0), [`addae94`](https://github.com/atom63/atom63-design-system/commit/addae94c49a53d5e930509a5ab46e8b8e4955079), [`e3e846f`](https://github.com/atom63/atom63-design-system/commit/e3e846f828d35554705ae71b0d7a52bf582253a3), [`f04dc6e`](https://github.com/atom63/atom63-design-system/commit/f04dc6e502c16abee43933109017e0cc7b60e01b), [`f0f16e1`](https://github.com/atom63/atom63-design-system/commit/f0f16e15ded421195835d722362566b1e1fa4ca3), [`bd0d15e`](https://github.com/atom63/atom63-design-system/commit/bd0d15e6319422a2e3b9abdbef5f4cbb4e436bf4), [`87825b2`](https://github.com/atom63/atom63-design-system/commit/87825b29ad11a0e09cbb666d3bb443da9a99b93d), [`54ac87f`](https://github.com/atom63/atom63-design-system/commit/54ac87f0cf53ac8fcac439f8590cf3155fd49f86), [`b1ec823`](https://github.com/atom63/atom63-design-system/commit/b1ec82312e90d848d8e7629ef05536a48a8efad9), [`c0c8fe5`](https://github.com/atom63/atom63-design-system/commit/c0c8fe5c0ad2226ab1e51ad859c80eae9521d03b), [`b1ec823`](https://github.com/atom63/atom63-design-system/commit/b1ec82312e90d848d8e7629ef05536a48a8efad9), [`d8ef144`](https://github.com/atom63/atom63-design-system/commit/d8ef1448eb1eadfeb6aab67c0c5da853d74630d9), [`29e5fe7`](https://github.com/atom63/atom63-design-system/commit/29e5fe7843afa99897735df73586f14c3b4389c2), [`34859e0`](https://github.com/atom63/atom63-design-system/commit/34859e0e4159b77b0a4d928b02fb53bc87764ba7), [`343e7a3`](https://github.com/atom63/atom63-design-system/commit/343e7a32072539f5fe5dceac3d046f2a884c8a28), [`6701b2b`](https://github.com/atom63/atom63-design-system/commit/6701b2b67daf3c920c84aa87a72a498d27bf31d6), [`70c1964`](https://github.com/atom63/atom63-design-system/commit/70c1964f52f4a2805a01572deb861b8f8d607b0b), [`b018329`](https://github.com/atom63/atom63-design-system/commit/b0183290e065750a4d319dc30d5d975dd50d8f68), [`76f2a23`](https://github.com/atom63/atom63-design-system/commit/76f2a23688dca40b03d3778e21ab6358d52c46e9), [`452732e`](https://github.com/atom63/atom63-design-system/commit/452732e3a0b090a5040f60f1e7fbddbecf580236), [`b72b8a8`](https://github.com/atom63/atom63-design-system/commit/b72b8a8cd81f6bf9724ea05ff31b2ab91a22f160), [`42cc6b8`](https://github.com/atom63/atom63-design-system/commit/42cc6b81bc6fc1f6b4aed43c459554d5ddbb0c89), [`c0c30ea`](https://github.com/atom63/atom63-design-system/commit/c0c30eafb87fa8e94c1470973af888a76e7c9923), [`9e6182b`](https://github.com/atom63/atom63-design-system/commit/9e6182b6a00413aee4c57f46b54169b4d7bda951), [`4456f3e`](https://github.com/atom63/atom63-design-system/commit/4456f3ec076b52fc40dad7116e20711847f570d2), [`8b9830a`](https://github.com/atom63/atom63-design-system/commit/8b9830a79d5bf0123f5c3a0a7531d108ae79f1fb), [`1d7bc85`](https://github.com/atom63/atom63-design-system/commit/1d7bc858d02f0a3f3fde54abc96632577b351308), [`f7b6dcb`](https://github.com/atom63/atom63-design-system/commit/f7b6dcb0f3bd52a1880a40fad31070fa094ae494), [`ada3ca5`](https://github.com/atom63/atom63-design-system/commit/ada3ca5b4a97a0195f7398b55146ce5929fa5566), [`5221ab3`](https://github.com/atom63/atom63-design-system/commit/5221ab3a231e3cceb8c1a286e2b70036e5568a9f)]:
  - @atom63/ui-react@0.2.0-beta.12
  - @atom63/styles@0.1.0-beta.8

## 0.4.0-beta.2

### Patch Changes

- Updated dependencies [[`b9170fd`](https://github.com/atom63/atom63-design-system/commit/b9170fd68cc540f22166cdd973f016778d86d5e6), [`52c5bb5`](https://github.com/atom63/atom63-design-system/commit/52c5bb52e9df8cec06492bf4fcabfa8b0f7e0ff8), [`5eae380`](https://github.com/atom63/atom63-design-system/commit/5eae38029e462db7ae671a4b5227d20d3cae8eb4), [`5047bc7`](https://github.com/atom63/atom63-design-system/commit/5047bc7b069223eb1949cbe4ce323bd7275a85cc), [`6c2845b`](https://github.com/atom63/atom63-design-system/commit/6c2845b4d4faeee76c0a08c10e289d6c7518c337), [`8087c69`](https://github.com/atom63/atom63-design-system/commit/8087c69bcce189266b1c90221987e654bab72f21), [`aec1a7d`](https://github.com/atom63/atom63-design-system/commit/aec1a7d8f1c30ede29b16bbc57d89f9d342c3f19), [`c152bb1`](https://github.com/atom63/atom63-design-system/commit/c152bb1f2a0f3e53340d8bd0a6f9ab7ff3cab61d), [`7ab659e`](https://github.com/atom63/atom63-design-system/commit/7ab659e77f34a4fe6195ef91a4102a1784931d5c), [`a0c90bd`](https://github.com/atom63/atom63-design-system/commit/a0c90bddfc4901472bea054c45f29ae8a0626c51)]:
  - @atom63/styles@0.1.0-beta.7
  - @atom63/ui-react@0.2.0-beta.11

## 0.4.0-beta.1

### Patch Changes

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

- [#69](https://github.com/atom63/atom63-design-system/pull/69) [`ff25f46`](https://github.com/atom63/atom63-design-system/commit/ff25f46fb317c1224fa170856d852f7ef859bf33) Thanks [@atom63](https://github.com/atom63)! - Publish `@atom63/mdx` from the release workflow, alongside the other design system packages.
- Updated dependencies [[`dfe96a4`](https://github.com/atom63/atom63-design-system/commit/dfe96a4d508abb209bc4a11782252d867fac6ad7), [`bbd4c87`](https://github.com/atom63/atom63-design-system/commit/bbd4c877ff39d9a58746997cc4b5b2b3a9c928ba), [`ad62b14`](https://github.com/atom63/atom63-design-system/commit/ad62b1480089c5b92f984313c1045586e2dba7e3), [`be6077c`](https://github.com/atom63/atom63-design-system/commit/be6077c79fc1d3126427f9e44dc8f9446a06bbcd), [`0a538ef`](https://github.com/atom63/atom63-design-system/commit/0a538ef579c3841dcfae600403ce98f47053bd52), [`db5fadc`](https://github.com/atom63/atom63-design-system/commit/db5fadc3d5326f22a063fb2ea2dbaf78acc9e25c), [`a76b878`](https://github.com/atom63/atom63-design-system/commit/a76b878ea50c2ebbe75f4e4261cab42a89e22077), [`a76b878`](https://github.com/atom63/atom63-design-system/commit/a76b878ea50c2ebbe75f4e4261cab42a89e22077), [`a76b878`](https://github.com/atom63/atom63-design-system/commit/a76b878ea50c2ebbe75f4e4261cab42a89e22077), [`11555a8`](https://github.com/atom63/atom63-design-system/commit/11555a8d79f53ed5bcdbf4dc6476eecdc85dddac), [`457b90e`](https://github.com/atom63/atom63-design-system/commit/457b90e066b29fac5181cb709fc349f324e9262d), [`948aa37`](https://github.com/atom63/atom63-design-system/commit/948aa3772be67e1a27c8e007c7e014d32a17d0ca), [`78af86a`](https://github.com/atom63/atom63-design-system/commit/78af86a8af0f89a11b536109f4a0ef6e319478db), [`0b83864`](https://github.com/atom63/atom63-design-system/commit/0b8386419fb36738ea80a142b38ba523fb281983), [`cc43c53`](https://github.com/atom63/atom63-design-system/commit/cc43c539453f0d8d60209d0e99c5bcc3b1edcf1a), [`8f58388`](https://github.com/atom63/atom63-design-system/commit/8f583887296639967fe0f7c183d96e496f4e6ac0), [`7fc3f86`](https://github.com/atom63/atom63-design-system/commit/7fc3f86e4e4fe820972b417fe23f14e51f5be9c9), [`ffc8394`](https://github.com/atom63/atom63-design-system/commit/ffc8394d5f1e4cb9f5eb7ab922c3c7b5b125f9c3), [`85c29a5`](https://github.com/atom63/atom63-design-system/commit/85c29a53491c3c96ca3076e0964d138d5ec9ff75), [`f321b96`](https://github.com/atom63/atom63-design-system/commit/f321b961a259bcbfe422f07387ca72856f6f912d), [`aa077f9`](https://github.com/atom63/atom63-design-system/commit/aa077f9b547d15ca61f21c65367b49f03ab414d1), [`f297a4f`](https://github.com/atom63/atom63-design-system/commit/f297a4ff8f933b52c5dac74f86f17950486fe563), [`2cd2cb1`](https://github.com/atom63/atom63-design-system/commit/2cd2cb17474284abf5b58c47e864f4127190677d), [`3de1dce`](https://github.com/atom63/atom63-design-system/commit/3de1dcee52dc86436a0530d6849727705bc48945), [`11555a8`](https://github.com/atom63/atom63-design-system/commit/11555a8d79f53ed5bcdbf4dc6476eecdc85dddac), [`541e675`](https://github.com/atom63/atom63-design-system/commit/541e67582f86b9d9987b2ac41923dc9e5706ec95), [`614e4a5`](https://github.com/atom63/atom63-design-system/commit/614e4a5a1b02d0422aaf53920d6a6f840042b217), [`9109b20`](https://github.com/atom63/atom63-design-system/commit/9109b2076a71764d3869c3932ad9fdc0d676dd5b), [`f89eda9`](https://github.com/atom63/atom63-design-system/commit/f89eda9abc960caf880b57b1e41f73a7b4e8dd68), [`c3bdaf8`](https://github.com/atom63/atom63-design-system/commit/c3bdaf8648b67d7ce63bac343a5b9e42fafb5bae), [`b8a42d8`](https://github.com/atom63/atom63-design-system/commit/b8a42d86c445889f24ca80ca63e2c8433b9ae778), [`2f46468`](https://github.com/atom63/atom63-design-system/commit/2f46468f5a4b1b223f6a4235f15a47e2a0f393f4), [`38430d0`](https://github.com/atom63/atom63-design-system/commit/38430d06d2a691a43beb177906d2c8270e14b84c), [`b784cf5`](https://github.com/atom63/atom63-design-system/commit/b784cf5413e82a0343162ef1824ed73e9c19850d)]:
  - @atom63/ui-react@0.2.0-beta.10
  - @atom63/styles@0.1.0-beta.6

## 0.3.2

### Patch Changes

- Updated dependencies [[`058173d`](https://github.com/atom63/atom63-vite/commit/058173d4a52a21ac2114ad201d8d441de6fb8f07)]:
  - @atom63/ui-react@0.1.1

## 0.3.1

### Patch Changes

- [#297](https://github.com/atom63/atom63-vite/pull/297) [`acf02b8`](https://github.com/atom63/atom63-vite/commit/acf02b8536e1c6485d0226b1ddb2763824203302) Thanks [@atom63](https://github.com/atom63)! - Fix callout paragraph and list typography, which never rendered.

  The callout recipe composed its scoped classes at runtime via an internal
  `scopeMdx` helper. Tailwind's scanner is a static lexer over source text, so it
  never saw `[&_p]:mt-1.5`, `[&_li]:text-inherit`, or the four other classes the
  helper produced — no rules were generated and the styling silently did nothing.
  Callout paragraphs now get their spacing and leading, and list items inherit the
  callout's tone color.

  `scopeMdx` is removed. It was internal (never exported from the package entry)
  and every class it produced was, by construction, invisible to the scanner.
  Scoped classes are now written out literally at the point of use.

- [#276](https://github.com/atom63/atom63-vite/pull/276) [`0b5b534`](https://github.com/atom63/atom63-vite/commit/0b5b5341cd1fe2a7babf0c1abfe68a8015eb1300) Thanks [@atom63](https://github.com/atom63)! - Stack VideoDialog above detail modals and keep PhotoSwipe Escape from dismissing the case-study overlay.

- [#297](https://github.com/atom63/atom63-vite/pull/297) [`0b8c5f0`](https://github.com/atom63/atom63-vite/commit/0b8c5f087a5712bdd015ad7841efa7e6c2e9e674) Thanks [@atom63](https://github.com/atom63)! - Fix docs prose leading so it survives type scaling.

  Docs paragraphs paired `text-base` — which is `15px * --typography-scale`, a
  user-adjustable axis — with `leading-7`, a fixed 28px step. Leading froze while
  the text grew, so the ratio fell from 1.87 at the default scale to 1.24 at scale
  1.5, where lines nearly collide. Paragraphs, the page lead, and blockquotes now
  use a `1.75` ratio, which holds at every scale.

  The docs variant's paragraph and list classes are also written out literally
  instead of being composed by `scopeMdx`. Tailwind's scanner is static and cannot
  see a class assembled at runtime, so those rules were never generated from
  source — the list classes never existed at all, and the paragraph rule only
  resolved because a unit test happened to hardcode the same string as an expected
  value. `mdxTypography.docsBody`, `docsLead`, and `docsListItem` are removed;
  they described styling they could not produce.

- [#297](https://github.com/atom63/atom63-vite/pull/297) [`550fe7d`](https://github.com/atom63/atom63-vite/commit/550fe7dea75ae2a9259986b6c341f6097a9d1feb) Thanks [@atom63](https://github.com/atom63)! - Strengthen the docs variant page-title hierarchy: `h1` moves from `text-2xl`/`sm:text-3xl` semibold to `text-4xl`/`sm:text-5xl` medium, so the title reads clearly above the `h2` ramp instead of as its sibling.

- [#276](https://github.com/atom63/atom63-vite/pull/276) [`0b5b534`](https://github.com/atom63/atom63-vite/commit/0b5b5341cd1fe2a7babf0c1abfe68a8015eb1300) Thanks [@atom63](https://github.com/atom63)! - Fix PhotoSwipe: FigureLightboxHost now handles custom gallery ids from ImageBlock and ImageGrid (not only the default MDX gallery).

- [`7664581`](https://github.com/atom63/atom63-vite/commit/766458112df88d10f12c159ba053a940d85d4710) Thanks [@atom63](https://github.com/atom63)! - Load PhotoSwipe styles on demand when opening MDX figure lightboxes instead of including them in the shared MDX consumer stylesheet.

- [`894c17d`](https://github.com/atom63/atom63-vite/commit/894c17d2f356803b425402eac792e9eb6067f758) Thanks [@atom63](https://github.com/atom63)! - Add narrow subpath exports for `CreditsBlock` and `MediaCaption` so apps can consume lightweight MDX blocks without importing the full blocks barrel.

- [#318](https://github.com/atom63/atom63-vite/pull/318) [`98eb54c`](https://github.com/atom63/atom63-vite/commit/98eb54c86604ee6c7d67a7a5f8e5b466ff675d3e) Thanks [@atom63](https://github.com/atom63)! - Align article and example code content to the same frame inset, and remove duplicate padding from highlighted article code blocks.

- [#316](https://github.com/atom63/atom63-vite/pull/316) [`2e7663f`](https://github.com/atom63/atom63-vite/commit/2e7663fcc0561542b8a7d7dccdb2617732ce07fa) Thanks [@atom63](https://github.com/atom63)! - Add compact menu and embedded-list variants to `PageTableOfContents`, including active-section
  label reporting for responsive documentation chrome.
- Updated dependencies [[`c069a57`](https://github.com/atom63/atom63-vite/commit/c069a575b6f8bf4e3818742da3827c604fc4f480), [`869844f`](https://github.com/atom63/atom63-vite/commit/869844fab00764665f03530c9226efdbed5ee3f6), [`3ab5e63`](https://github.com/atom63/atom63-vite/commit/3ab5e63b016b63471b59c153b37d1fbfedebe88a), [`f8cbf00`](https://github.com/atom63/atom63-vite/commit/f8cbf00f05e252c272dcf048fbb69030271b12b1), [`2e7663f`](https://github.com/atom63/atom63-vite/commit/2e7663fcc0561542b8a7d7dccdb2617732ce07fa), [`2e7663f`](https://github.com/atom63/atom63-vite/commit/2e7663fcc0561542b8a7d7dccdb2617732ce07fa), [`0b5b534`](https://github.com/atom63/atom63-vite/commit/0b5b5341cd1fe2a7babf0c1abfe68a8015eb1300), [`f8cbf00`](https://github.com/atom63/atom63-vite/commit/f8cbf00f05e252c272dcf048fbb69030271b12b1), [`475b376`](https://github.com/atom63/atom63-vite/commit/475b376ca05270b49803c8c52aa22873fc6047f4), [`0b5b534`](https://github.com/atom63/atom63-vite/commit/0b5b5341cd1fe2a7babf0c1abfe68a8015eb1300), [`2e7663f`](https://github.com/atom63/atom63-vite/commit/2e7663fcc0561542b8a7d7dccdb2617732ce07fa), [`0b5b534`](https://github.com/atom63/atom63-vite/commit/0b5b5341cd1fe2a7babf0c1abfe68a8015eb1300), [`0b5b534`](https://github.com/atom63/atom63-vite/commit/0b5b5341cd1fe2a7babf0c1abfe68a8015eb1300), [`fd3f3c4`](https://github.com/atom63/atom63-vite/commit/fd3f3c4014952d5ff960ec31ad476376d330cbc0), [`7484e2f`](https://github.com/atom63/atom63-vite/commit/7484e2f373d30a8a5eaf80809d82346cae1d0b05), [`d1e3103`](https://github.com/atom63/atom63-vite/commit/d1e31032c26ede436172aea520bc1aeee26445f2), [`b0f4a28`](https://github.com/atom63/atom63-vite/commit/b0f4a285854a92799673d0518799e49998d36fa0), [`0b5b534`](https://github.com/atom63/atom63-vite/commit/0b5b5341cd1fe2a7babf0c1abfe68a8015eb1300), [`0b5b534`](https://github.com/atom63/atom63-vite/commit/0b5b5341cd1fe2a7babf0c1abfe68a8015eb1300), [`0b5b534`](https://github.com/atom63/atom63-vite/commit/0b5b5341cd1fe2a7babf0c1abfe68a8015eb1300), [`0b5b534`](https://github.com/atom63/atom63-vite/commit/0b5b5341cd1fe2a7babf0c1abfe68a8015eb1300), [`ae98a86`](https://github.com/atom63/atom63-vite/commit/ae98a86ed635b527e1865457e0fbedc92f4cea7f), [`0b5b534`](https://github.com/atom63/atom63-vite/commit/0b5b5341cd1fe2a7babf0c1abfe68a8015eb1300)]:
  - @atom63/ui-react@0.1.0
  - @atom63/styles@0.0.1

## 0.3.0

### Minor Changes

- [#243](https://github.com/atom63/atom63-vite/pull/243) [`513125e`](https://github.com/atom63/atom63-vite/commit/513125e896d8f015b8d3627ebfa5992d3dfa60a3) Thanks [@atom63](https://github.com/atom63)! - Editorial engine: primitives, slots, richer blocks, and motion.

  **Layout & motion primitives** (`@atom63/mdx/primitives`): `Section` (`column`/`wide`/`bleed`), `Grid`, `Stack`, `Bleed`, `Aside`, plus `Reveal` and `Stagger` backed by motion tokens and a single `useMdxReducedMotion` gate.

  **Named-slot composition**: `createSlot` / `hasSlot` / `pickSlot` / `pickRest`. `Callout` and `FigureBlock` gain named slots (`Callout.Icon/Title/Body/Actions`, `FigureBlock.Caption/Aside`); `Compare` gains `Compare.Title/Description`; `DocExample` gains `Title/Preview/Code` — all backward-compatible with existing props.

  **New content blocks**: `Tabs`, `Accordion` (wrapping the accessible `@atom63/ui` components), `Steps`, `Timeline`, `StatCard`/`StatGrid`, and `ScrollStage` (scrollytelling with a pinned, crossfading media pane; reduced-motion-safe). `MermaidDiagram` gains an optional `animated` draw-on-reveal.

  **i18n**: hardcoded UI/aria strings in `LayerStack`, `CodeBlock`, `DocExample`, `ComparisonPair`, `CreditsBlock`, and `MermaidDiagram` are now overridable props/label objects with English defaults.

  **Breaking (pre-1.0)**: `CodeBlockVariantProvider` is no longer a public export — it moved to an internal module. Removing a public export is a breaking change; per pre-1.0 semver it rides this `minor` bump. No known consumer imported it (`Compare` uses it internally); if you did, wrap embedded code differently or file an issue.

### Patch Changes

- Updated dependencies [[`5f3a502`](https://github.com/atom63/atom63-vite/commit/5f3a5026f3b3b11b6d17587d3c25f5352dc28321)]:
  - @atom63/ui@0.2.1

## 0.2.0

### Minor Changes

- [#106](https://github.com/atom63/atom63-vite/pull/106) [`c9fc8af`](https://github.com/atom63/atom63-vite/commit/c9fc8aff741746094196fc9626252822c1160054) Thanks [@atom63](https://github.com/atom63)! - Initial release to GitHub Packages

### Patch Changes

- Updated dependencies [[`c9fc8af`](https://github.com/atom63/atom63-vite/commit/c9fc8aff741746094196fc9626252822c1160054)]:
  - @atom63/ui@0.2.0
