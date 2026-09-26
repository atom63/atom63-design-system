# @atom63/mdx

## 0.4.0-beta.1

### Patch Changes

- [#69](https://github.com/atom63/atom63-design-system/pull/69) [`ff25f46`](https://github.com/atom63/atom63-design-system/commit/ff25f46fb317c1224fa170856d852f7ef859bf33) Thanks [@atom63](https://github.com/atom63)! - Publish `@atom63/mdx` from the release workflow, alongside the other design system packages.
- Updated dependencies [[`dfe96a4`](https://github.com/atom63/atom63-design-system/commit/dfe96a4d508abb209bc4a11782252d867fac6ad7), [`bbd4c87`](https://github.com/atom63/atom63-design-system/commit/bbd4c877ff39d9a58746997cc4b5b2b3a9c928ba), [`be6077c`](https://github.com/atom63/atom63-design-system/commit/be6077c79fc1d3126427f9e44dc8f9446a06bbcd), [`0a538ef`](https://github.com/atom63/atom63-design-system/commit/0a538ef579c3841dcfae600403ce98f47053bd52), [`db5fadc`](https://github.com/atom63/atom63-design-system/commit/db5fadc3d5326f22a063fb2ea2dbaf78acc9e25c), [`a76b878`](https://github.com/atom63/atom63-design-system/commit/a76b878ea50c2ebbe75f4e4261cab42a89e22077), [`a76b878`](https://github.com/atom63/atom63-design-system/commit/a76b878ea50c2ebbe75f4e4261cab42a89e22077), [`a76b878`](https://github.com/atom63/atom63-design-system/commit/a76b878ea50c2ebbe75f4e4261cab42a89e22077), [`11555a8`](https://github.com/atom63/atom63-design-system/commit/11555a8d79f53ed5bcdbf4dc6476eecdc85dddac), [`457b90e`](https://github.com/atom63/atom63-design-system/commit/457b90e066b29fac5181cb709fc349f324e9262d), [`948aa37`](https://github.com/atom63/atom63-design-system/commit/948aa3772be67e1a27c8e007c7e014d32a17d0ca), [`78af86a`](https://github.com/atom63/atom63-design-system/commit/78af86a8af0f89a11b536109f4a0ef6e319478db), [`0b83864`](https://github.com/atom63/atom63-design-system/commit/0b8386419fb36738ea80a142b38ba523fb281983), [`7fc3f86`](https://github.com/atom63/atom63-design-system/commit/7fc3f86e4e4fe820972b417fe23f14e51f5be9c9), [`ffc8394`](https://github.com/atom63/atom63-design-system/commit/ffc8394d5f1e4cb9f5eb7ab922c3c7b5b125f9c3), [`85c29a5`](https://github.com/atom63/atom63-design-system/commit/85c29a53491c3c96ca3076e0964d138d5ec9ff75), [`f321b96`](https://github.com/atom63/atom63-design-system/commit/f321b961a259bcbfe422f07387ca72856f6f912d), [`aa077f9`](https://github.com/atom63/atom63-design-system/commit/aa077f9b547d15ca61f21c65367b49f03ab414d1), [`f297a4f`](https://github.com/atom63/atom63-design-system/commit/f297a4ff8f933b52c5dac74f86f17950486fe563), [`2cd2cb1`](https://github.com/atom63/atom63-design-system/commit/2cd2cb17474284abf5b58c47e864f4127190677d), [`3de1dce`](https://github.com/atom63/atom63-design-system/commit/3de1dcee52dc86436a0530d6849727705bc48945), [`11555a8`](https://github.com/atom63/atom63-design-system/commit/11555a8d79f53ed5bcdbf4dc6476eecdc85dddac), [`541e675`](https://github.com/atom63/atom63-design-system/commit/541e67582f86b9d9987b2ac41923dc9e5706ec95), [`614e4a5`](https://github.com/atom63/atom63-design-system/commit/614e4a5a1b02d0422aaf53920d6a6f840042b217), [`9109b20`](https://github.com/atom63/atom63-design-system/commit/9109b2076a71764d3869c3932ad9fdc0d676dd5b), [`f89eda9`](https://github.com/atom63/atom63-design-system/commit/f89eda9abc960caf880b57b1e41f73a7b4e8dd68), [`c3bdaf8`](https://github.com/atom63/atom63-design-system/commit/c3bdaf8648b67d7ce63bac343a5b9e42fafb5bae), [`b8a42d8`](https://github.com/atom63/atom63-design-system/commit/b8a42d86c445889f24ca80ca63e2c8433b9ae778), [`2f46468`](https://github.com/atom63/atom63-design-system/commit/2f46468f5a4b1b223f6a4235f15a47e2a0f393f4), [`38430d0`](https://github.com/atom63/atom63-design-system/commit/38430d06d2a691a43beb177906d2c8270e14b84c), [`b784cf5`](https://github.com/atom63/atom63-design-system/commit/b784cf5413e82a0343162ef1824ed73e9c19850d)]:
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
