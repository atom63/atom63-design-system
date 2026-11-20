# @atom63/cli

## 0.1.0-beta.2

### Minor Changes

- [#290](https://github.com/atom63/atom63-design-system/pull/290) [`400584a`](https://github.com/atom63/atom63-design-system/commit/400584aa0ef19e1c0673813f95dbe23914d1bed1) Thanks [@atom63](https://github.com/atom63)! - Index the public API. `atom63 api <name>` (and the `api` MCP tool) answers a SwiftUI type of `Atom63UI` with its declaration, doc comment and members, a JavaScript export with its import line and docs page, or a whole entry point such as `@atom63/ui-react/media` or `@atom63/mdx/blocks` with everything it exports. `search` finds these names too (`--kind api`), and `atom63 docs ios` reads the `Atom63UI` README. Docs pages in the index keep the code inside fenced blocks, including import, export and JSX lines, and new pages cover `@atom63/ui-react/media`, `@atom63/ui-react/media/lightbox`, `@atom63/ui-react/preview` and `@atom63/mdx`.

### Patch Changes

- [#295](https://github.com/atom63/atom63-design-system/pull/295) [`524fd93`](https://github.com/atom63/atom63-design-system/commit/524fd93260a5405a3becfe9e8ceb9e35d6bf6754) Thanks [@atom63](https://github.com/atom63)! - Search gives a component that a query's synonyms name a larger boost, so a story example whose name matches the query (autocomplete/Loading) no longer outranks the skeleton component for "loading".

- [#298](https://github.com/atom63/atom63-design-system/pull/298) [`7ab4fc9`](https://github.com/atom63/atom63-design-system/commit/7ab4fc97d5ce63f3f3c7237e4db61a3dc6954582) Thanks [@atom63](https://github.com/atom63)! - Add the Progressive Blur contract (`progressiveBlurContract`, `progressiveBlurPositions`, `ProgressiveBlurPosition`), marked preview; `ProgressiveBlur` takes its defaults and position type from it. Map the iOS axes of Alert, Avatar, Button shape, Card, Carousel dots, Input, Item group surface, Message, Progress, Toaster and Toggle Group onto the contract intent; the contract check fails when a mapped Swift enum drifts. The catalog and the agent index now fail on a component without a contract maturity instead of calling it stable.

- [#288](https://github.com/atom63/atom63-design-system/pull/288) [`adc4b50`](https://github.com/atom63/atom63-design-system/commit/adc4b5086f4f3da6c651fad03471f4f6875d8071) Thanks [@atom63](https://github.com/atom63)! - Add the danger status role: `--a63-status-danger` (step 600 in light mode, 500 in dark mode) with `-foreground`, `-subtle` and `-subtle-foreground`, for error icons, borders and tints. `--a63-action-danger` stays the danger button fill. The contrast test now checks `--a63-status-danger` (3:1) and `--a63-text-danger` (4.5:1) in every theme and mode, and `compat/a63-from-shadcn.css` maps both from `--destructive`.
  
  Alert's error tone draws its icon, border and fill from `--a63-status-danger` and its action label in `--a63-text-danger`, and its action sits at the inline end, so it no longer covers the title in right-to-left layouts. In `@atom63/mdx`, KeyIdea's eyebrow and the active PageTableOfContents link use `--a63-text-accent`; Compare's negative item, StatCard's down trend, the MermaidDiagram and live-preview error text use `--a63-text-danger`; the error Callout and Compare's negative marker use `--a63-status-danger`. The CLI agent index lists the new tokens.

- [#306](https://github.com/atom63/atom63-design-system/pull/306) [`bdcee47`](https://github.com/atom63/atom63-design-system/commit/bdcee4751d28defbc59ef3f5aefad0aad4bfc89a) Thanks [@atom63](https://github.com/atom63)! - Document every `@atom63/mdx` block. A new docs page, "MDX blocks" (`atom63 docs pattern-mdx-blocks`), gives each of the 30 blocks what it is for, a working example and its props, read from the block's TypeScript types with defaults and doc comments. `atom63 api <Block>` now prints that section, so `atom63 api KeyIdea` answers with the purpose, an example and the props, not only the import line. The `@atom63/mdx` README points to the page.

- [#305](https://github.com/atom63/atom63-design-system/pull/305) [`eef5f6f`](https://github.com/atom63/atom63-design-system/commit/eef5f6f4072ad0d64e366d9a325d8e2fde1742ba) Thanks [@atom63](https://github.com/atom63)! - `atom63 copy` and `atom63 template` now include the modules a template imports from outside its own folder, so `atom63 copy dashboard-page` also writes `pages/list-page/list-page-data.ts` and the copied page compiles.

- [#296](https://github.com/atom63/atom63-design-system/pull/296) [`fb39cb0`](https://github.com/atom63/atom63-design-system/commit/fb39cb0889932bd232045b4b7cb9df2ed8676974) Thanks [@atom63](https://github.com/atom63)! - The app-shell block and the chat-page template give every safe-area inset an owner, as AppView does: the top bar takes the top inset, and the page wrapper (app shell) or page column (chat page) takes the bottom inset and clears the inline ones. Copied templates no longer run under the notch or the home indicator when the page uses `viewport-fit=cover`.

## 0.1.0-beta.1

### Patch Changes

- [#265](https://github.com/atom63/atom63-design-system/pull/265) [`83517be`](https://github.com/atom63/atom63-design-system/commit/83517be7b43253b10a58390b7f004464781b5c8c) Thanks [@atom63](https://github.com/atom63)! - Allow MCP hosts to expose a filtered set of Atom63 read-only tools.

- [#273](https://github.com/atom63/atom63-design-system/pull/273) [`08e15ab`](https://github.com/atom63/atom63-design-system/commit/08e15abdd2588bb13260b494611e3bc0d030d31d) Thanks [@atom63](https://github.com/atom63)! - Messaging, messenger, direct message, story and related words point the build kit and search at Message and the Avatar story ring, and a component a topic names for an idea leads the kit, so the templates' own components cannot crowd it out.

- [#272](https://github.com/atom63/atom63-design-system/pull/272) [`51b5290`](https://github.com/atom63/atom63-design-system/commit/51b52902f0091b63e0018ebaa6a6bca909e56636) Thanks [@atom63](https://github.com/atom63)! - The rules add `content-colors`: draw content that carries its own colours (illustrations, game pieces, map and chart series) with the `--a63-category-{hue}` palette, and mix shades from tokens with `color-mix()`.
